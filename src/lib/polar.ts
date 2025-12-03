import { Polar } from "@polar-sh/sdk";

// Initialize Polar client with access token
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});

// Product IDs from Polar dashboard
// These need to be updated after creating products in Polar
export const POLAR_PRODUCTS = {
  CREDITS_100: process.env.POLAR_CREDITS_PRODUCT_ID || "credits-100",
  SUBSCRIPTION_MONTHLY: process.env.POLAR_MONTHLY_PRODUCT_ID || "unlimited-monthly",
  SUBSCRIPTION_YEARLY: process.env.POLAR_YEARLY_PRODUCT_ID || "unlimited-yearly",
} as const;

// Helper to get the app URL for redirects
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
