import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";

// Lazily initialized Stripe client with a pinned API version (matches SDK v22).
// The SDK throws when constructed without a key, so we defer until first use —
// build-time page data collection must not require STRIPE_SECRET_KEY.
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2026-06-24.dahlia",
    });
  }
  return stripeClient;
}

// Price IDs from the Stripe dashboard, mapped via env vars
export const STRIPE_PRICES = {
  // Subscription plans
  STARTER_MONTHLY: process.env.STRIPE_PRICE_STARTER_MONTHLY || "",
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || "",
  BYOK_PRO: process.env.STRIPE_PRICE_BYOK_PRO || "",
  // Credit packs (one-time purchases)
  CREDITS_10: process.env.STRIPE_PRICE_CREDITS_10 || "",
  CREDITS_50: process.env.STRIPE_PRICE_CREDITS_50 || "",
  CREDITS_100: process.env.STRIPE_PRICE_CREDITS_100 || "",
} as const;

// Credit pack mapping for checkout
export const STRIPE_CREDIT_PACK_CONFIG: Record<
  string,
  { priceId: string; credits: number }
> = {
  "credits-10": { priceId: STRIPE_PRICES.CREDITS_10, credits: 10 },
  "credits-50": { priceId: STRIPE_PRICES.CREDITS_50, credits: 50 },
  "credits-100": { priceId: STRIPE_PRICES.CREDITS_100, credits: 100 },
};

/**
 * Resolve a subscription tier from a Stripe price ID.
 * Used as the webhook fallback when metadata.plan is missing.
 */
export function tierFromPriceId(
  priceId: string | null | undefined
): "starter" | "pro" | "byok" | null {
  // Guard against unset env values matching an empty price ID
  if (!priceId) return null;
  switch (priceId) {
    case STRIPE_PRICES.STARTER_MONTHLY:
      return "starter";
    case STRIPE_PRICES.PRO_MONTHLY:
    case STRIPE_PRICES.PRO_YEARLY:
      return "pro";
    case STRIPE_PRICES.BYOK_PRO:
      return "byok";
    default:
      return null;
  }
}

/**
 * Get the user's Stripe customer ID, creating the customer on first use.
 * Persists the ID on user.stripeCustomerId.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string | null
): Promise<string> {
  const result = await db
    .select({ stripeCustomerId: user.stripeCustomerId })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const existing = result[0]?.stripeCustomerId;
  if (existing) {
    return existing;
  }

  const customer = await getStripe().customers.create({
    email,
    name: name || undefined,
    metadata: { userId },
  });

  await db
    .update(user)
    .set({ stripeCustomerId: customer.id, updatedAt: new Date() })
    .where(eq(user.id, userId));

  return customer.id;
}

// Helper to get the app URL for redirects
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
