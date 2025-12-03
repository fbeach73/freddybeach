import { Polar } from "@polar-sh/sdk";

// Initialize Polar client with access token
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});

// Product IDs from Polar dashboard
// These need to be updated after creating products in Polar
export const POLAR_PRODUCTS = {
  // Credit packs (one-time purchases)
  CREDITS_10: process.env.POLAR_CREDITS_10_PRODUCT_ID || "credits-10",
  CREDITS_50: process.env.POLAR_CREDITS_50_PRODUCT_ID || "credits-50",
  CREDITS_100: process.env.POLAR_CREDITS_100_PRODUCT_ID || "credits-100",
  // Subscription plans
  SUBSCRIPTION_MONTHLY: process.env.POLAR_MONTHLY_PRODUCT_ID || "unlimited-monthly",
  SUBSCRIPTION_YEARLY: process.env.POLAR_YEARLY_PRODUCT_ID || "unlimited-yearly",
  // BYOK Pro subscription
  BYOK_PRO: process.env.POLAR_BYOK_PRO_PRODUCT_ID || "byok-pro",
} as const;

// Credit pack mapping for checkout
export const CREDIT_PACK_CONFIG: Record<string, { productId: string; credits: number }> = {
  "credits-10": { productId: POLAR_PRODUCTS.CREDITS_10, credits: 10 },
  "credits-50": { productId: POLAR_PRODUCTS.CREDITS_50, credits: 50 },
  "credits-100": { productId: POLAR_PRODUCTS.CREDITS_100, credits: 100 },
};

// Helper to get the app URL for redirects
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
