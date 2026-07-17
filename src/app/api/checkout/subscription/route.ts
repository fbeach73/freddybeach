import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getStripe,
  STRIPE_PRICES,
  getOrCreateStripeCustomer,
  getAppUrl,
} from "@/lib/stripe";

// Valid plan types
const VALID_PLANS = ["starter", "pro", "pro-yearly"] as const;
type PlanType = (typeof VALID_PLANS)[number];

function isValidPlan(plan: string): plan is PlanType {
  return VALID_PLANS.includes(plan as PlanType);
}

const PLAN_PRICE_MAP: Record<PlanType, string> = {
  starter: STRIPE_PRICES.STARTER_MONTHLY,
  pro: STRIPE_PRICES.PRO_MONTHLY,
  "pro-yearly": STRIPE_PRICES.PRO_YEARLY,
};

/**
 * POST /api/checkout/subscription
 * Create a Stripe checkout session for subscription
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body;

    // Validate plan type
    if (!plan || typeof plan !== "string" || !isValidPlan(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'starter', 'pro', or 'pro-yearly'" },
        { status: 400 }
      );
    }

    const priceId = PLAN_PRICE_MAP[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: "Plan is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const customerId = await getOrCreateStripeCustomer(
      session.user.id,
      session.user.email,
      session.user.name
    );

    const appUrl = getAppUrl();
    const metadata = {
      userId: session.user.id,
      type: "subscription",
      plan,
    };

    const checkout = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/billing?success=subscription&plan=${plan}`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=subscription`,
      metadata,
      subscription_data: { metadata },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
    });
  } catch (error) {
    console.error("Create subscription checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
