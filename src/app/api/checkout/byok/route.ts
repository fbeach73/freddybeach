import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { polar, POLAR_PRODUCTS, getAppUrl } from "@/lib/polar";

/**
 * POST /api/checkout/byok
 * Create a Polar checkout session for BYOK Pro subscription
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

    const appUrl = getAppUrl();
    const successUrl = `${appUrl}/dashboard/billing?success=byok`;

    // Create Polar checkout session for BYOK Pro subscription
    const checkout = await polar.checkouts.create({
      products: [POLAR_PRODUCTS.BYOK_PRO],
      successUrl,
      customerEmail: session.user.email,
      customerName: session.user.name || undefined,
      metadata: {
        userId: session.user.id,
        type: "byok",
        plan: "byok-pro",
      },
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
