import type { BYOKOption, CreditPackage } from "@/lib/types";

// Canonical plans module — the ONLY place plan names, prices, features,
// and allowances are defined. All pricing UI, checkout routes, and webhooks
// read from here.

export type PlanId = "free" | "starter" | "pro" | "byokPro";

export interface PlanAllowance {
  /** Credits granted per month (free top-up or Starter grant) */
  monthlyCredits?: number;
  /** Monthly generation soft cap (Pro) */
  softCap?: number;
  /** Unlimited usage via user's own API key (BYOK Pro) */
  unlimited?: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  priceLabel: string;
  period: "forever" | "monthly";
  /** Label shown to founding members while the founding offer is live */
  foundingPriceLabel?: string;
  description: string;
  features: string[];
  /** Env var name holding the Stripe price ID for this plan (Phase 2) */
  stripePriceEnvKey?: string;
  allowance: PlanAllowance;
  isPopular: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "Free",
    period: "forever",
    description:
      "10 free credits every month. Try any AI tool — no credit card needed.",
    features: [
      "10 free credits every month",
      "Works on every text tool",
      "Real results, not a demo",
      "No credit card required",
    ],
    allowance: { monthlyCredits: 10 },
    isPopular: false,
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 9,
    priceLabel: "$9/mo",
    period: "monthly",
    foundingPriceLabel: "$9/mo — founding price, locked in",
    description:
      "100 credits every month. Enough to keep your reviews, posts, and emails handled.",
    features: [
      "100 credits every month",
      "All AI tools included",
      "Credits top up automatically",
      "Cancel anytime",
    ],
    stripePriceEnvKey: "STRIPE_PRICE_STARTER_MONTHLY",
    allowance: { monthlyCredits: 100 },
    isPopular: true,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 29,
    priceLabel: "$29/mo",
    period: "monthly",
    foundingPriceLabel: "$29/mo — founding price, locked in",
    description:
      "Unlimited generations for businesses that use AI every day.",
    features: [
      "Unlimited AI generations",
      "All AI tools included",
      "Priority processing",
      "Cancel anytime",
    ],
    stripePriceEnvKey: "STRIPE_PRICE_PRO_MONTHLY",
    allowance: { softCap: 500 },
    isPopular: false,
  },
  byokPro: {
    id: "byokPro",
    name: "BYOK Pro",
    price: 7.99,
    priceLabel: "$7.99/mo",
    period: "monthly",
    description:
      "Unlimited AI generations using your own API key. Best for power users and developers.",
    features: [
      "Unlimited image generations",
      "Use your own Google Gemini API key",
      "No per-image credits needed",
      "Higher resolution outputs (up to 4K)",
      "Priority processing queue",
      "Full privacy - your key, your data",
      "Cancel anytime",
    ],
    stripePriceEnvKey: "STRIPE_PRICE_BYOK_PRO",
    allowance: { unlimited: true },
    isPopular: false,
  },
};

export function getPlanById(id: string): Plan | undefined {
  return (Object.values(PLANS) as Plan[]).find((plan) => plan.id === id);
}

// Credit packs — one-time top-ups, usable on any plan

export const creditPacks: CreditPackage[] = [
  {
    id: "credits-10",
    name: "Starter Pack",
    credits: 10,
    price: 1.99,
    priceLabel: "$1.99",
    pricePerCredit: "$0.20",
    description: "Try AI image generation without commitment.",
    features: [
      "10 AI generations",
      "Use on any available AI tool",
      "Credits never expire",
      "No subscription required",
    ],
    isPopular: false,
  },
  {
    id: "credits-50",
    name: "Popular Pack",
    credits: 50,
    price: 6.99,
    priceLabel: "$6.99",
    pricePerCredit: "$0.14",
    description: "Most popular choice for regular users.",
    features: [
      "50 AI generations",
      "Use on any available AI tool",
      "Credits never expire",
      "No subscription required",
      "Save 30% vs Starter Pack",
    ],
    isPopular: true,
  },
  {
    id: "credits-100",
    name: "Value Pack",
    credits: 100,
    price: 9.99,
    priceLabel: "$9.99",
    pricePerCredit: "$0.10",
    description: "Best value for power users. Credits never expire.",
    features: [
      "100 AI generations",
      "Use on any available AI tool",
      "Credits never expire",
      "No subscription required",
      "Save 50% vs Starter Pack",
    ],
    isPopular: false,
  },
];

export function getCreditPackById(id: string): CreditPackage | undefined {
  return creditPacks.find((pack) => pack.id === id);
}

// Free BYOK option — use your own key at no charge (marketing display)

export const byokOption: BYOKOption = {
  id: "byok",
  name: "Bring Your Own Key",
  price: 0,
  priceLabel: "Free",
  description:
    "Use your own API keys for free, unlimited access. Perfect for developers and power users.",
  features: [
    "Unlimited generations",
    "Use your own API keys",
    "No usage tracking",
    "Full privacy control",
  ],
  requirements: [
    "Google Gemini API key (free tier available)",
    "Technical setup required",
  ],
};
