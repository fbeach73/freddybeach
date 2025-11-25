"use client";

import { pricingTiers } from "@/lib/data/packages";
import { cn } from "@/lib/utils";
import { PricingCard } from "./pricing-card";

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
