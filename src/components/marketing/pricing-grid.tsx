"use client";

import { PLANS } from "@/lib/data/plans";
import type { PricingTier } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PricingCard } from "./pricing-card";

// Map the canonical plans (Free / Starter / Pro) into the card shape.
// Full pricing redesign lands in the billing UI phase.
const pricingTiers: PricingTier[] = [PLANS.free, PLANS.starter, PLANS.pro].map(
  (plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    priceLabel: plan.priceLabel,
    period: plan.period === "monthly" ? "per month" : "forever",
    description: plan.description,
    features: plan.features,
    ctaText: plan.price === 0 ? "Get Started Free" : `Get ${plan.name}`,
    isPopular: plan.isPopular,
  })
);

interface PricingGridProps {
  className?: string;
}

export function PricingGrid({ className }: PricingGridProps) {
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
          className={cn(
            index === 1 && "md:-mt-4 md:mb-4"
          )}
        />
      ))}
    </div>
  );
}
