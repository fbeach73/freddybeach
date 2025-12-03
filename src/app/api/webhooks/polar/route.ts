import { NextRequest, NextResponse } from "next/server";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import {
  addCredits,
  activateSubscription,
  cancelSubscription,
  extendSubscription,
  type SubscriptionTier,
} from "@/lib/services/token-system";

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
  const metadata = event.data.metadata || {};
  const userId = metadata.userId;
  const type = metadata.type;
  const amount = metadata.amount;

  if (!userId) {
    console.error("No userId in order metadata", { eventId: event.data.id });
    return;
  }

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
  const metadata = event.data.metadata || {};
  const userId = metadata.userId;
  const plan = metadata.plan as SubscriptionTier | undefined;

  if (!userId) {
    console.error("No userId in subscription metadata", {
      eventId: event.data.id,
    });
    return;
  }

  // Determine tier from metadata or product name
  let tier: SubscriptionTier = plan || "monthly";

  // Try to infer from product name if not in metadata
  if (!plan && event.data.product?.name) {
    const productName = event.data.product.name.toLowerCase();
    tier = productName.includes("yearly") ? "yearly" : "monthly";
  }

  console.log(`Activating ${tier} subscription for user ${userId}`);

  try {
    const success = await activateSubscription(userId, tier);
    if (success) {
      console.log(`Subscription activated successfully for user ${userId}`);
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
  const metadata = event.data.metadata || {};
  const userId = metadata.userId;
  const status = event.data.status;

  if (!userId) {
    console.error("No userId in subscription metadata", {
      eventId: event.data.id,
    });
    return;
  }

  // If subscription is active, extend it
  if (status === "active") {
    const plan = metadata.plan as SubscriptionTier | undefined;
    let tier: SubscriptionTier | undefined = plan;

    // Try to infer from product name if not in metadata
    if (!tier && event.data.product?.name) {
      const productName = event.data.product.name.toLowerCase();
      tier = productName.includes("yearly") ? "yearly" : "monthly";
    }

    console.log(`Extending subscription for user ${userId}`);

    try {
      const success = await extendSubscription(userId, tier);
      if (success) {
        console.log(`Subscription extended successfully for user ${userId}`);
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
  const metadata = event.data.metadata || {};
  const userId = metadata.userId;

  if (!userId) {
    console.error("No userId in subscription metadata", {
      eventId: event.data.id,
    });
    return;
  }

  console.log(`Processing subscription cancellation for user ${userId}`);

  try {
    const success = await cancelSubscription(userId);
    if (success) {
      console.log(
        `Subscription cancellation processed for user ${userId}`
      );
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
