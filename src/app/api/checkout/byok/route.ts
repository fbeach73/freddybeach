import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getStripe,
  STRIPE_PRICES,
  getOrCreateStripeCustomer,
  getAppUrl,
} from "@/lib/stripe";

/**
 * POST /api/checkout/byok
 * Create a Stripe checkout session for BYOK Pro subscription
 *
 * BYOK Pro allows users to use their own API key for unlimited generations
 * at a monthly subscription price of $7.99
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!STRIPE_PRICES.BYOK_PRO) {
      return NextResponse.json(
        { error: "BYOK Pro is not configured. Please contact support." },
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
      type: "byok",
      plan: "byok",
    };

    const checkout = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: STRIPE_PRICES.BYOK_PRO, quantity: 1 }],
      success_url: `${appUrl}/dashboard/billing?success=byok`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=byok`,
      metadata,
      subscription_data: { metadata },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
    });
  } catch (error) {
    console.error("Create BYOK checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
