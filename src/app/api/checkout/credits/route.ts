import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { polar, CREDIT_PACK_CONFIG, getAppUrl } from "@/lib/polar";

/**
 * POST /api/checkout/credits
 * Create a Polar checkout session for credit purchase
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
    const packConfig = CREDIT_PACK_CONFIG[packId];
    if (!packConfig) {
      return NextResponse.json(
        { error: `Invalid pack ID: ${packId}. Valid options: credits-10, credits-50, credits-100` },
        { status: 400 }
      );
    }

    const appUrl = getAppUrl();
    const successUrl = `${appUrl}/dashboard/billing?success=credits`;

    // Create Polar checkout session for credits
    const checkout = await polar.checkouts.create({
      products: [packConfig.productId],
      successUrl,
      customerEmail: session.user.email,
      customerName: session.user.name || undefined,
      metadata: {
        userId: session.user.id,
        type: "credits",
        packId: packId,
        amount: String(packConfig.credits),
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
