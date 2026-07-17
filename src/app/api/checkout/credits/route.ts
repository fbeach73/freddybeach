import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getStripe,
  STRIPE_CREDIT_PACK_CONFIG,
  getOrCreateStripeCustomer,
  getAppUrl,
} from "@/lib/stripe";

/**
 * POST /api/checkout/credits
 * Create a Stripe checkout session for credit purchase
 *
 * Body: { packId: "credits-10" | "credits-50" | "credits-100" }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body to get pack ID
    let packId = "credits-100"; // Default to 100 credits
    try {
      const body = await request.json();
      if (body.packId && typeof body.packId === "string") {
        packId = body.packId;
      }
    } catch {
      // If no body or invalid JSON, use default
    }

    // Validate pack ID and get configuration
    const packConfig = STRIPE_CREDIT_PACK_CONFIG[packId];
    if (!packConfig) {
      return NextResponse.json(
        { error: `Invalid pack ID: ${packId}. Valid options: credits-10, credits-50, credits-100` },
        { status: 400 }
      );
    }

    if (!packConfig.priceId) {
      return NextResponse.json(
        { error: "Credit pack is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const customerId = await getOrCreateStripeCustomer(
      session.user.id,
      session.user.email,
      session.user.name
    );

    const appUrl = getAppUrl();

    const checkout = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price: packConfig.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/billing?success=credits`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=credits`,
      metadata: {
        userId: session.user.id,
        type: "credits",
        packId,
        credits: String(packConfig.credits),
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
      packId: packId,
      credits: packConfig.credits,
    });
  } catch (error) {
    console.error("Create credits checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
