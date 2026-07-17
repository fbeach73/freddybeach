import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { getStripe, getAppUrl } from "@/lib/stripe";

/**
 * POST /api/billing/portal
 * Create a Stripe billing portal session so the user can manage
 * their subscription, payment methods, and invoices.
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db
      .select({ stripeCustomerId: user.stripeCustomerId })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    const stripeCustomerId = result[0]?.stripeCustomerId;
    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found. Make a purchase first." },
        { status: 400 }
      );
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${getAppUrl()}/dashboard/billing`,
    });

    return NextResponse.json({
      success: true,
      portalUrl: portalSession.url,
    });
  } catch (error) {
    console.error("Create billing portal session error:", error);
    return NextResponse.json(
      { error: "Failed to open billing portal" },
      { status: 500 }
    );
  }
}
