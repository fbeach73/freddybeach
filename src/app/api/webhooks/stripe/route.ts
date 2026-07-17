/**
 * Stripe Webhook Handler
 *
 * This endpoint handles incoming webhooks from Stripe for:
 * - Credit purchases (checkout.session.completed, mode: payment)
 * - Subscription lifecycle (customer.subscription.created/updated/deleted)
 * - Renewals (invoice.paid)
 *
 * RETRY LOGIC (same policy as the Polar handler):
 * - Stripe automatically retries failed webhooks (5xx responses) for up to 3 days
 * - Critical (ledger) failures throw so we return 500 and Stripe retries
 * - Non-critical failures (email sending) are logged and we return 200
 *
 * IDEMPOTENCY:
 * - checkout.session.completed only handles one-time credit purchases;
 *   subscription activation is owned by the subscription events (avoids
 *   double-activation on first checkout)
 * - invoice.paid skips billing_reason === "subscription_create" — the first
 *   invoice fires alongside customer.subscription.created, and Starter's
 *   monthly 100-credit grant must not double up (load-bearing guard)
 * - subscription events for an already-active same-tier subscription only
 *   extend the expiry (no repeat credit grant / welcome email)
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { getStripe, tierFromPriceId, STRIPE_PRICES } from "@/lib/stripe";
import {
  addCredits,
  activateSubscription,
  extendSubscription,
  cancelSubscription,
  endSubscriptionImmediately,
  getSubscriptionInfo,
  markFoundingMember,
  type SubscriptionTier,
} from "@/lib/services/token-system";
import {
  sendPurchaseConfirmationEmail,
  sendSubscriptionStartedEmail,
  sendSubscriptionRenewedEmail,
  sendSubscriptionCancelledEmail,
} from "@/lib/services/email";
import { PLANS, getCreditPackById } from "@/lib/data/plans";

/**
 * Map checkout metadata.plan values to subscription tiers
 */
function tierFromPlanMetadata(plan: string | undefined): SubscriptionTier | null {
  switch (plan) {
    case "starter":
      return "starter";
    case "pro":
    case "pro-yearly":
      return "pro";
    case "byok":
    case "byok-pro":
      return "byok";
    default:
      return null;
  }
}

/**
 * Display info for subscription emails, sourced from the canonical plans
 */
function getPlanDisplay(tier: SubscriptionTier): {
  name: string;
  price: number;
  features: { name: string }[];
} {
  const plan =
    tier === "byok" ? PLANS.byokPro : tier === "starter" ? PLANS.starter : PLANS.pro;
  return {
    name: plan.name,
    price: plan.price,
    features: plan.features.map((name) => ({ name })),
  };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Resolve the app user for an event: metadata.userId first,
 * then fallback lookup by Stripe customer ID.
 */
async function resolveUserId(
  metadata: Record<string, string> | null | undefined,
  customerId: string | null | undefined
): Promise<string | null> {
  if (metadata?.userId) {
    return metadata.userId;
  }

  if (customerId) {
    const result = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.stripeCustomerId, customerId))
      .limit(1);
    return result[0]?.id ?? null;
  }

  return null;
}

/**
 * Fetch user details by ID for sending emails
 */
async function getUserById(userId: string) {
  const result = await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return result[0] || null;
}

/**
 * POST /api/webhooks/stripe
 * Handle incoming webhooks from Stripe
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // Raw body is required for signature verification
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature || "", webhookSecret);
  } catch (error) {
    console.error(
      "Stripe webhook verification failed:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  console.log(`Received Stripe webhook: ${event.type}`, { eventId: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(event.data.object);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await handleSubscriptionEvent(event.data.object);
        break;
      }

      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object);
        break;
      }

      case "invoice.paid": {
        await handleInvoicePaid(event.data.object);
        break;
      }

      default: {
        console.log(`Unhandled Stripe event type: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed
 * - Persist the Stripe customer ID on the user
 * - Credit purchases: add credits + confirmation email
 * - Every successful checkout marks the user a founding member (while < 100)
 *
 * Subscription activation is NOT done here — the subscription events own it.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = (session.metadata || {}) as Record<string, string>;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const userId = await resolveUserId(metadata, customerId);

  if (!userId) {
    console.error("Could not resolve user for checkout session", {
      sessionId: session.id,
      customerId,
    });
    return;
  }

  // Persist the customer ID if this user doesn't have one yet
  if (customerId) {
    const existing = await db
      .select({ stripeCustomerId: user.stripeCustomerId })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (existing.length > 0 && !existing[0].stripeCustomerId) {
      await db
        .update(user)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(user.id, userId));
    }
  }

  // Founding member: first 100 paying customers, idempotent, capped
  await markFoundingMember(userId);

  if (metadata.type !== "credits") {
    // Subscriptions are activated by customer.subscription.* events
    return;
  }

  const creditsToAdd = parseInt(metadata.credits || "0", 10);
  if (!creditsToAdd || creditsToAdd <= 0) {
    console.error("Invalid credits amount in checkout metadata", {
      sessionId: session.id,
      credits: metadata.credits,
    });
    return;
  }

  console.log(`Adding ${creditsToAdd} credits to user ${userId}`);
  // Throws on failure → 500 → Stripe retries
  const newBalance = await addCredits(
    userId,
    creditsToAdd,
    "purchase",
    `Purchased ${creditsToAdd} credits via Stripe`
  );
  console.log(`Credits added successfully. New balance: ${newBalance}`);

  // Send purchase confirmation email (non-critical)
  try {
    const userData = await getUserById(userId);
    if (userData) {
      const pack = metadata.packId ? getCreditPackById(metadata.packId) : undefined;
      const total =
        session.amount_total != null
          ? session.amount_total / 100
          : pack?.price ?? 0;
      await sendPurchaseConfirmationEmail({
        email: userData.email,
        userName: userData.name,
        orderNumber: session.id.slice(-8).toUpperCase(),
        items: [
          {
            name: `${creditsToAdd} AI Credits`,
            description: "Credits for AI generations",
            quantity: 1,
            unitPrice: total,
          },
        ],
        subtotal: total,
        total: total,
        paymentMethodLast4: "****",
        paymentMethodBrand: "Card",
      });
      console.log(`Purchase confirmation email sent to ${userData.email}`);
    } else {
      console.warn(`User ${userId} not found for email notification`);
    }
  } catch (emailError) {
    console.error("Failed to send purchase confirmation email:", emailError);
  }
}

/**
 * Handle customer.subscription.created / customer.subscription.updated
 * - cancel_at_period_end → mark cancellation (access retained until expiry)
 * - active/trialing → activate (first time) or extend (already active)
 * - Starter gets its first 100 credits on activation; renewals are granted
 *   via invoice.paid
 */
async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const metadata = (subscription.metadata || {}) as Record<string, string>;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;
  const userId = await resolveUserId(metadata, customerId);

  if (!userId) {
    console.error("Could not resolve user for subscription event", {
      subscriptionId: subscription.id,
      customerId,
    });
    return;
  }

  const item = subscription.items?.data?.[0];
  // Price ID first — it reflects what Stripe is actually billing. Subscription
  // metadata is a checkout-time snapshot that goes stale if the user changes
  // plans through the billing portal.
  const tier =
    tierFromPriceId(item?.price?.id) ?? tierFromPlanMetadata(metadata.plan);
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000)
    : undefined;

  // Cancellation scheduled at period end — access retained until expiry
  if (subscription.cancel_at_period_end) {
    console.log(`Subscription cancel-at-period-end for user ${userId}`);
    const success = await cancelSubscription(userId);
    if (!success) {
      throw new Error(`Failed to process cancellation for user ${userId}`);
    }

    try {
      const userData = await getUserById(userId);
      if (userData && tier) {
        const display = getPlanDisplay(tier);
        await sendSubscriptionCancelledEmail({
          email: userData.email,
          userName: userData.name,
          tierName: display.name,
          accessEndDate: periodEnd ? formatDate(periodEnd) : "the end of your billing period",
          resubscribeUrl: "https://freddybeach.com/pricing",
          feedbackUrl: "https://freddybeach.com/consultation",
        });
        console.log(`Subscription cancelled email sent to ${userData.email}`);
      }
    } catch (emailError) {
      console.error("Failed to send subscription cancelled email:", emailError);
    }
    return;
  }

  if (subscription.status !== "active" && subscription.status !== "trialing") {
    console.log(
      `Ignoring subscription ${subscription.id} with status ${subscription.status}`
    );
    return;
  }

  if (!tier) {
    console.error("Could not determine tier for subscription", {
      subscriptionId: subscription.id,
      plan: metadata.plan,
      priceId: item?.price?.id,
    });
    return;
  }

  // Serialize concurrent deliveries for the same user (created/updated fire
  // back-to-back on first checkout): the advisory lock makes the
  // check-then-activate-then-grant sequence race-free, so Starter's first
  // 100 credits can't double-grant. Lock releases when the transaction ends.
  let activated = false;
  await db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtext(${`stripe_sub_${userId}`}))`
    );

    // Already active on this tier (e.g. the duplicate created/updated pair on
    // first checkout, or a metadata-only update): just sync the expiry.
    const currentInfo = await getSubscriptionInfo(userId);
    if (currentInfo.isActive && currentInfo.tier === tier) {
      const success = await extendSubscription(userId, tier, periodEnd);
      if (!success) {
        throw new Error(`Failed to extend subscription for user ${userId}`);
      }
      console.log(`Synced ${tier} subscription expiry for user ${userId}`);
      return;
    }

    console.log(`Activating ${tier} subscription for user ${userId}`);
    const success = await activateSubscription(userId, tier, periodEnd);
    if (!success) {
      throw new Error(`Failed to activate subscription for user ${userId}`);
    }

    // Starter's allowance is a monthly credit grant — first 100 on activation
    if (tier === "starter") {
      await addCredits(userId, 100, "purchase", "Starter monthly credits");
      console.log(`Granted first 100 Starter credits to user ${userId}`);
    }

    activated = true;
  });

  if (!activated) {
    return;
  }

  // Founding member: first 100 paying customers, idempotent, capped
  await markFoundingMember(userId);

  // Send subscription started email (non-critical)
  try {
    const userData = await getUserById(userId);
    if (userData) {
      const display = getPlanDisplay(tier);
      const billingFrequency =
        item?.price?.recurring?.interval === "year" ? "yearly" : "monthly";
      // Actual billed amount from the Stripe price (covers Pro yearly, which
      // has no entry in plans.ts); fall back to the plan's monthly price
      const billingAmount =
        item?.price?.unit_amount != null
          ? item.price.unit_amount / 100
          : display.price;
      await sendSubscriptionStartedEmail({
        email: userData.email,
        userName: userData.name,
        tierName: display.name,
        features: display.features,
        billingAmount,
        billingFrequency,
        nextBillingDate: periodEnd
          ? formatDate(periodEnd)
          : formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        manageSubscriptionUrl: "https://freddybeach.com/dashboard/billing",
      });
      console.log(`Subscription started email sent to ${userData.email}`);
    } else {
      console.warn(`User ${userId} not found for email notification`);
    }
  } catch (emailError) {
    console.error("Failed to send subscription started email:", emailError);
  }
}

/**
 * Handle invoice.paid — subscription renewals
 * Skips the very first invoice (billing_reason === "subscription_create"):
 * it fires alongside customer.subscription.created, which owns activation
 * and Starter's first credit grant.
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (invoice.billing_reason === "subscription_create") {
    console.log(
      `Skipping invoice ${invoice.id} (subscription_create — handled by subscription events)`
    );
    return;
  }

  const subscriptionDetails = invoice.parent?.subscription_details;
  if (!subscriptionDetails) {
    console.log(`Invoice ${invoice.id} is not for a subscription — skipping`);
    return;
  }

  const metadata = (subscriptionDetails.metadata || {}) as Record<string, string>;
  const customerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  const userId = await resolveUserId(metadata, customerId);

  if (!userId) {
    console.error("Could not resolve user for invoice", {
      invoiceId: invoice.id,
      customerId,
    });
    return;
  }

  // Price ID first (what Stripe actually billed), then the metadata snapshot,
  // then the user's current tier
  const line = invoice.lines?.data?.[0];
  const linePriceRef = line?.pricing?.price_details?.price;
  const linePriceId =
    typeof linePriceRef === "string" ? linePriceRef : linePriceRef?.id;
  const tier =
    tierFromPriceId(linePriceId) ??
    tierFromPlanMetadata(metadata.plan) ??
    (await getSubscriptionInfo(userId)).tier ??
    undefined;

  const lineEnd = line?.period?.end;
  const periodEnd = lineEnd ? new Date(lineEnd * 1000) : undefined;

  console.log(`Extending ${tier ?? "current"} subscription for user ${userId}`);
  const success = await extendSubscription(userId, tier, periodEnd);
  if (!success) {
    throw new Error(`Failed to extend subscription for user ${userId}`);
  }

  // Starter's monthly allowance renews with each paid invoice
  if (tier === "starter") {
    await addCredits(userId, 100, "purchase", "Starter monthly credits");
    console.log(`Granted 100 monthly Starter credits to user ${userId}`);
  }

  // Send renewal email (non-critical)
  try {
    const userData = await getUserById(userId);
    if (userData && tier) {
      const display = getPlanDisplay(tier);
      // Actual amount paid on this invoice (covers Pro yearly)
      const billingAmount =
        invoice.amount_paid != null ? invoice.amount_paid / 100 : display.price;
      await sendSubscriptionRenewedEmail({
        email: userData.email,
        userName: userData.name,
        tierName: display.name,
        billingAmount,
        billingFrequency:
          metadata.plan === "pro-yearly" || linePriceId === STRIPE_PRICES.PRO_YEARLY
            ? "yearly"
            : "monthly",
        nextBillingDate: periodEnd
          ? formatDate(periodEnd)
          : formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        billingSettingsUrl: "https://freddybeach.com/dashboard/billing",
      });
      console.log(`Subscription renewed email sent to ${userData.email}`);
    }
  } catch (emailError) {
    console.error("Failed to send subscription renewed email:", emailError);
  }
}

/**
 * Handle customer.subscription.deleted — subscription fully ended.
 * Clears the tier immediately (NOT the no-op cancelSubscription).
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const metadata = (subscription.metadata || {}) as Record<string, string>;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;
  const userId = await resolveUserId(metadata, customerId);

  if (!userId) {
    console.error("Could not resolve user for subscription deletion", {
      subscriptionId: subscription.id,
      customerId,
    });
    return;
  }

  console.log(`Ending subscription immediately for user ${userId}`);
  const success = await endSubscriptionImmediately(userId);
  if (!success) {
    throw new Error(`Failed to end subscription for user ${userId}`);
  }
}
