"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { FeaturedBusinessesCarousel } from "@/components/home/featured-businesses-carousel";
import type { Business } from "@/lib/types";

interface FeaturedBusinessesWrapperProps {
  businesses: Business[];
}

export function FeaturedBusinessesWrapper({ businesses }: FeaturedBusinessesWrapperProps) {
  return (
    <ErrorBoundary name="Featured Businesses">
      <FeaturedBusinessesCarousel businesses={businesses} />
    </ErrorBoundary>
  );
}
