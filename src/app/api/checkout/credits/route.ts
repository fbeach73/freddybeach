import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { polar, POLAR_PRODUCTS, getAppUrl } from "@/lib/polar";

/**
 * POST /api/checkout/credits
 * Create a Polar checkout session for credit purchase
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUrl = getAppUrl();
    const successUrl = `${appUrl}/dashboard/billing?success=credits`;

    // Create Polar checkout session for credits
    const checkout = await polar.checkouts.create({
      products: [POLAR_PRODUCTS.CREDITS_100],
      successUrl,
      customerEmail: session.user.email,
      customerName: session.user.name || undefined,
      metadata: {
        userId: session.user.id,
        type: "credits",
        amount: "100",
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
    });
  } catch (error) {
    console.error("Create credits checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
