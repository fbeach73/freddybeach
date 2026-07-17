"use client";

import { PLANS } from "@/lib/data/plans";
import type { PricingTier } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PricingCard } from "./pricing-card";

// Map the canonical plans (Free / Starter / Pro) into the card shape.
const pricingTiers: PricingTier[] = [PLANS.free, PLANS.starter, PLANS.pro].map(
  (plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    priceLabel: plan.priceLabel === "Free" ? plan.priceLabel : `$${plan.price}`,
    period: plan.period === "monthly" ? "month" : "",
    description: plan.description,
    features: plan.features,
    ctaText: plan.price === 0 ? "Get Started Free" : `Get ${plan.name}`,
    isPopular: plan.isPopular,
    foundingPriceLabel: plan.foundingPriceLabel,
  })
);

interface PricingGridProps {
  className?: string;
  /** Signed-in users get direct checkout; signed-out users get the sign-up dialog */
  isAuthenticated?: boolean;
}

export function PricingGrid({ className, isAuthenticated = false }: PricingGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6 md:grid-cols-3 md:items-stretch",
        className
      )}
    >
      {pricingTiers.map((tier, index) => (
        <PricingCard
          key={tier.id}
          tier={tier}
          highlighted={index === 1}
          isAuthenticated={isAuthenticated}
          className={cn(
            index === 1 && "md:-mt-4 md:mb-4"
          )}
        />
      ))}
    </div>
  );
}
