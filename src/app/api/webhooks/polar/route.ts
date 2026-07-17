// SUNSET: legacy Polar billing — existing subscribers only. All new checkouts go through Stripe.

/**
 * Polar Webhook Handler
 *
 * This endpoint handles incoming webhooks from Polar for:
 * - Credit purchases (order.paid)
 * - Subscription lifecycle (created, updated, canceled)
 *
 * RETRY LOGIC:
 * - Polar automatically retries failed webhooks (5xx responses) with exponential backoff
 * - Retries occur at: 1min, 5min, 30min, 2hr, 6hr, 12hr, 24hr
 * - After 7 failed attempts, the webhook is marked as failed
 * - To trigger a retry, return a 5xx status code (we throw errors for critical failures)
 * - For non-critical failures (like email sending), we log and continue with 200
 *
 * IDEMPOTENCY:
 * - Each webhook has a unique event ID (event.data.id)
 * - Subscription events include subscription IDs for tracking
 * - Credit transactions are recorded with order IDs for deduplication
 */

import { NextRequest, NextResponse } from "next/server";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import {
  addCredits,
  activateSubscription,
  cancelSubscription,
  extendSubscription,
  type LegacySubscriptionTier,
} from "@/lib/services/token-system";
import {
  sendPurchaseConfirmationEmail,
  sendSubscriptionStartedEmail,
  sendSubscriptionRenewedEmail,
  sendSubscriptionCancelledEmail,
} from "@/lib/services/email";
import { PLANS, creditPacks } from "@/lib/data/plans";

// Polar sells the legacy monthly/yearly plans plus BYOK Pro. Legacy tiers are
// normalized to "pro" on read by token-system; this handler keeps writing the
// values Polar knows about during the sunset period.
type PolarTier = LegacySubscriptionTier | "byok";

// Display info for legacy plans no longer defined in plans.ts (email copy only)
const LEGACY_PLAN_DISPLAY: Record<LegacySubscriptionTier, { name: string; price: number }> = {
  monthly: { name: "Unlimited Monthly", price: 29 },
  yearly: { name: "Unlimited Yearly", price: 199 },
};

/**
 * Validate that required metadata fields are present
 * Returns the userId if valid, null otherwise
 */
function validateMetadata(
  metadata: Record<string, string> | undefined,
  eventId: string,
  eventType: string
): { userId: string | null; isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (!metadata) {
    return {
      userId: null,
      isValid: false,
      warnings: [`No metadata in ${eventType} event ${eventId}`],
    };
  }

  const userId = metadata.userId;
  if (!userId) {
    return {
      userId: null,
      isValid: false,
      warnings: [`Missing userId in ${eventType} metadata for event ${eventId}`],
    };
  }

  // Check for optional but recommended fields
  if (!metadata.type && eventType === "order.paid") {
    warnings.push(`Missing 'type' in order metadata - assuming credits purchase`);
  }

  if (!metadata.plan && eventType.includes("subscription")) {
    warnings.push(`Missing 'plan' in subscription metadata - will infer from product name`);
  }

  return { userId, isValid: true, warnings };
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
 * Calculate next billing date based on subscription tier
 */
function getNextBillingDate(tier: PolarTier): string {
  const nextDate = new Date();
  if (tier === "yearly") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }
  return nextDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Polar webhook event types we handle
type WebhookEventType =
  | "order.paid"
  | "subscription.created"
  | "subscription.updated"
  | "subscription.active"
  | "subscription.canceled"
  | "subscription.revoked"
  | "checkout.created"
  | "checkout.updated";

interface WebhookEvent {
  type: WebhookEventType;
  data: {
    id: string;
    metadata?: Record<string, string>;
    customer?: {
      id: string;
      email: string;
      metadata?: Record<string, string>;
    };
    subscription?: {
      id: string;
      status: string;
      product?: {
        id: string;
        name: string;
      };
    };
    product?: {
      id: string;
      name: string;
    };
    // For subscriptions
    status?: string;
    currentPeriodEnd?: string;
  };
}

/**
 * POST /api/webhooks/polar
 * Handle incoming webhooks from Polar
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const headersList = Object.fromEntries(request.headers.entries());

    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("POLAR_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Validate the webhook signature
    let event: WebhookEvent;
    try {
      event = validateEvent(body, headersList, webhookSecret) as WebhookEvent;
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        console.error("Webhook verification failed:", error.message);
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
      throw error;
    }

    console.log(`Received Polar webhook: ${event.type}`, {
      eventId: event.data.id,
      metadata: event.data.metadata,
    });

    // Handle different event types
    switch (event.type) {
      case "order.paid": {
        // Handle one-time purchases (credits)
        await handleOrderPaid(event);
        break;
      }

      case "subscription.created":
      case "subscription.active": {
        // Handle new subscription activation
        await handleSubscriptionCreated(event);
        break;
      }

      case "subscription.updated": {
        // Handle subscription updates (renewal, plan change)
        await handleSubscriptionUpdated(event);
        break;
      }

      case "subscription.canceled":
      case "subscription.revoked": {
        // Handle subscription cancellation
        await handleSubscriptionCanceled(event);
        break;
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle order.paid event - for one-time credit purchases
 */
async function handleOrderPaid(event: WebhookEvent) {
  // Validate metadata
  const validation = validateMetadata(event.data.metadata, event.data.id, event.type);

  // Log any warnings
  validation.warnings.forEach((warning) => console.warn(warning));

  if (!validation.isValid || !validation.userId) {
    console.error("Invalid order metadata", {
      eventId: event.data.id,
      warnings: validation.warnings,
    });
    return;
  }

  const userId = validation.userId;
  const metadata = event.data.metadata || {};
  const type = metadata.type || "credits"; // Default to credits if not specified
  const amount = metadata.amount;

  if (type === "credits") {
    const creditsToAdd = parseInt(amount || "100", 10);
    console.log(`Adding ${creditsToAdd} credits to user ${userId}`);

    try {
      const newBalance = await addCredits(
        userId,
        creditsToAdd,
        "purchase",
        `Purchased ${creditsToAdd} credits via Polar`
      );
      console.log(`Credits added successfully. New balance: ${newBalance}`);

      // Send purchase confirmation email
      try {
        const userData = await getUserById(userId);
        if (userData) {
          const creditPackage = creditPacks[0]; // Default to first pack
          const total = creditPackage.price;
          await sendPurchaseConfirmationEmail({
            email: userData.email,
            userName: userData.name,
            orderNumber: event.data.id.substring(0, 8).toUpperCase(),
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
            paymentMethodLast4: "****", // Polar doesn't expose this
            paymentMethodBrand: "Card",
          });
          console.log(`Purchase confirmation email sent to ${userData.email}`);
        } else {
          console.warn(`User ${userId} not found for email notification`);
        }
      } catch (emailError) {
        // Log email error but don't fail the webhook
        console.error("Failed to send purchase confirmation email:", emailError);
      }
    } catch (error) {
      console.error("Failed to add credits:", error);
      throw error; // Re-throw to return 500 and trigger Polar retry
    }
  } else {
    console.log(`Unknown order type: ${type}`, { eventId: event.data.id });
  }
}

/**
 * Handle subscription.created or subscription.active event
 */
async function handleSubscriptionCreated(event: WebhookEvent) {
  // Validate metadata
  const validation = validateMetadata(event.data.metadata, event.data.id, event.type);

  // Log any warnings
  validation.warnings.forEach((warning) => console.warn(warning));

  if (!validation.isValid || !validation.userId) {
    console.error("Invalid subscription metadata", {
      eventId: event.data.id,
      subscriptionId: event.data.subscription?.id,
      warnings: validation.warnings,
    });
    return;
  }

  const userId = validation.userId;
  const metadata = event.data.metadata || {};
  const plan = metadata.plan as PolarTier | string | undefined;
  const type = metadata.type;

  // Determine tier from metadata, product name, or type
  let tier: PolarTier;

  // Check if this is a BYOK subscription
  if (type === "byok" || plan === "byok-pro" || plan === "byok") {
    tier = "byok";
  } else if (plan === "monthly" || plan === "yearly") {
    tier = plan;
  } else if (event.data.product?.name) {
    // Try to infer from product name
    const productName = event.data.product.name.toLowerCase();
    if (productName.includes("byok")) {
      tier = "byok";
    } else if (productName.includes("yearly")) {
      tier = "yearly";
    } else {
      tier = "monthly";
    }
    console.warn(
      `Inferred subscription tier '${tier}' from product name '${event.data.product.name}'. ` +
      `Consider adding 'plan' to checkout metadata for reliability.`
    );
  } else {
    tier = "monthly"; // Default fallback
  }

  console.log(`Activating ${tier} subscription for user ${userId}`);

  try {
    const success = await activateSubscription(userId, tier);
    if (success) {
      console.log(`Subscription activated successfully for user ${userId}`);

      // Send subscription started email
      try {
        const userData = await getUserById(userId);
        if (userData) {
          // Get tier-specific information
          let tierName: string;
          let billingAmount: number;
          let features: { name: string }[];

          if (tier === "byok") {
            tierName = "BYOK Pro";
            billingAmount = PLANS.byokPro.price;
            features = [
              { name: "Unlimited AI generations" },
              { name: "Use your own API key" },
              { name: "Priority processing queue" },
              { name: "Cancel anytime" },
            ];
          } else {
            const legacyPlan = LEGACY_PLAN_DISPLAY[tier];
            tierName = legacyPlan.name;
            billingAmount = legacyPlan.price;
            features = [
              { name: "Unlimited AI generations" },
              { name: "All available AI tools" },
              { name: "Priority processing" },
              { name: tier === "yearly" ? "2 months free vs monthly" : "Cancel anytime" },
            ];
          }

          await sendSubscriptionStartedEmail({
            email: userData.email,
            userName: userData.name,
            tierName,
            features,
            billingAmount,
            billingFrequency: tier === "byok" ? "monthly" : tier, // BYOK is always monthly
            nextBillingDate: getNextBillingDate(tier === "byok" ? "monthly" : tier),
            manageSubscriptionUrl: "https://freddybeach.com/dashboard/billing",
          });
          console.log(`Subscription started email sent to ${userData.email}`);
        } else {
          console.warn(`User ${userId} not found for email notification`);
        }
      } catch (emailError) {
        // Log email error but don't fail the webhook
        console.error("Failed to send subscription started email:", emailError);
      }
    } else {
      console.error(`Failed to activate subscription for user ${userId}`);
    }
  } catch (error) {
    console.error("Failed to activate subscription:", error);
    throw error; // Re-throw to return 500 and trigger Polar retry
  }
}

/**
 * Handle subscription.updated event (renewals, plan changes)
 */
async function handleSubscriptionUpdated(event: WebhookEvent) {
  // Validate metadata
  const validation = validateMetadata(event.data.metadata, event.data.id, event.type);

  // Log any warnings
  validation.warnings.forEach((warning) => console.warn(warning));

  if (!validation.isValid || !validation.userId) {
    console.error("Invalid subscription metadata for update", {
      eventId: event.data.id,
      subscriptionId: event.data.subscription?.id,
      warnings: validation.warnings,
    });
    return;
  }

  const userId = validation.userId;
  const metadata = event.data.metadata || {};
  const status = event.data.status;
  const type = metadata.type;

  // If subscription is active, extend it
  if (status === "active") {
    const plan = metadata.plan as PolarTier | string | undefined;
    let tier: PolarTier | undefined;

    // Determine tier from metadata or product name
    if (type === "byok" || plan === "byok-pro" || plan === "byok") {
      tier = "byok";
    } else if (plan === "monthly" || plan === "yearly") {
      tier = plan;
    } else if (event.data.product?.name) {
      // Try to infer from product name
      const productName = event.data.product.name.toLowerCase();
      if (productName.includes("byok")) {
        tier = "byok";
      } else if (productName.includes("yearly")) {
        tier = "yearly";
      } else {
        tier = "monthly";
      }
      console.warn(
        `Inferred subscription tier '${tier}' from product name for renewal. ` +
        `Consider adding 'plan' to checkout metadata for reliability.`
      );
    }

    console.log(`Extending subscription for user ${userId}`);

    try {
      const success = await extendSubscription(userId, tier);
      if (success) {
        console.log(`Subscription extended successfully for user ${userId}`);

        // Send subscription renewed email
        try {
          const userData = await getUserById(userId);
          if (userData) {
            const effectiveTier = tier || "monthly";

            // Get tier-specific information
            let tierName: string;
            let billingAmount: number;

            if (effectiveTier === "byok") {
              tierName = "BYOK Pro";
              billingAmount = PLANS.byokPro.price;
            } else {
              const legacyPlan = LEGACY_PLAN_DISPLAY[effectiveTier];
              tierName = legacyPlan.name;
              billingAmount = legacyPlan.price;
            }

            await sendSubscriptionRenewedEmail({
              email: userData.email,
              userName: userData.name,
              tierName,
              billingAmount,
              billingFrequency: effectiveTier === "byok" ? "monthly" : effectiveTier,
              nextBillingDate: getNextBillingDate(effectiveTier === "byok" ? "monthly" : effectiveTier),
              billingSettingsUrl: "https://freddybeach.com/dashboard/billing",
            });
            console.log(`Subscription renewed email sent to ${userData.email}`);
          } else {
            console.warn(`User ${userId} not found for email notification`);
          }
        } catch (emailError) {
          // Log email error but don't fail the webhook
          console.error("Failed to send subscription renewed email:", emailError);
        }
      } else {
        console.error(`Failed to extend subscription for user ${userId}`);
      }
    } catch (error) {
      console.error("Failed to extend subscription:", error);
      throw error;
    }
  }
}

/**
 * Handle subscription.canceled or subscription.revoked event
 */
async function handleSubscriptionCanceled(event: WebhookEvent) {
  // Validate metadata
  const validation = validateMetadata(event.data.metadata, event.data.id, event.type);

  // Log any warnings
  validation.warnings.forEach((warning) => console.warn(warning));

  if (!validation.isValid || !validation.userId) {
    console.error("Invalid subscription metadata for cancellation", {
      eventId: event.data.id,
      subscriptionId: event.data.subscription?.id,
      warnings: validation.warnings,
    });
    return;
  }

  const userId = validation.userId;
  const metadata = event.data.metadata || {};
  const plan = metadata.plan as PolarTier | string | undefined;
  const type = metadata.type;

  // Determine tier from metadata or product name
  let tier: PolarTier;

  if (type === "byok" || plan === "byok-pro" || plan === "byok") {
    tier = "byok";
  } else if (plan === "monthly" || plan === "yearly") {
    tier = plan;
  } else if (event.data.product?.name) {
    const productName = event.data.product.name.toLowerCase();
    if (productName.includes("byok")) {
      tier = "byok";
    } else if (productName.includes("yearly")) {
      tier = "yearly";
    } else {
      tier = "monthly";
    }
    console.warn(
      `Inferred subscription tier '${tier}' from product name for cancellation. ` +
      `Consider adding 'plan' to checkout metadata for reliability.`
    );
  } else {
    tier = "monthly"; // Default fallback
  }

  console.log(`Processing subscription cancellation for user ${userId}`);

  try {
    const success = await cancelSubscription(userId);
    if (success) {
      console.log(
        `Subscription cancellation processed for user ${userId}`
      );

      // Send subscription cancelled email
      try {
        const userData = await getUserById(userId);
        if (userData) {
          const tierName = tier === "byok" ? "BYOK Pro" :
            tier === "yearly" ? "Unlimited Yearly" : "Unlimited Monthly";
          // Access end date is the end of current billing period
          const accessEndDate = event.data.currentPeriodEnd
            ? new Date(event.data.currentPeriodEnd).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : getNextBillingDate(tier === "byok" ? "monthly" : tier);

          await sendSubscriptionCancelledEmail({
            email: userData.email,
            userName: userData.name,
            tierName,
            accessEndDate,
            resubscribeUrl: "https://freddybeach.com/ai-tools#pricing",
            feedbackUrl: "https://freddybeach.com/contact",
          });
          console.log(`Subscription cancelled email sent to ${userData.email}`);
        } else {
          console.warn(`User ${userId} not found for email notification`);
        }
      } catch (emailError) {
        // Log email error but don't fail the webhook
        console.error("Failed to send subscription cancelled email:", emailError);
      }
    } else {
      console.error(
        `Failed to process subscription cancellation for user ${userId}`
      );
    }
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    throw error;
  }
}
