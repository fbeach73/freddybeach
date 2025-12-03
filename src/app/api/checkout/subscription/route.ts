import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { polar, POLAR_PRODUCTS, getAppUrl } from "@/lib/polar";

// Valid plan types
const VALID_PLANS = ["monthly", "yearly"] as const;
type PlanType = (typeof VALID_PLANS)[number];

function isValidPlan(plan: string): plan is PlanType {
  return VALID_PLANS.includes(plan as PlanType);
}

/**
 * POST /api/checkout/subscription
 * Create a Polar checkout session for subscription
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
    if (!plan || !isValidPlan(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'monthly' or 'yearly'" },
        { status: 400 }
      );
    }

    // Get the correct product ID based on plan
    const productId =
      plan === "monthly"
        ? POLAR_PRODUCTS.SUBSCRIPTION_MONTHLY
        : POLAR_PRODUCTS.SUBSCRIPTION_YEARLY;

    const appUrl = getAppUrl();
    const successUrl = `${appUrl}/dashboard/billing?success=subscription&plan=${plan}`;

    // Create Polar checkout session for subscription
    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl,
      customerEmail: session.user.email,
      customerName: session.user.name || undefined,
      metadata: {
        userId: session.user.id,
        type: "subscription",
        plan,
      },
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
