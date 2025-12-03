"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { RatingStars } from "@/components/shared/rating-stars";
import { TierBadge } from "@/components/shared/tier-badge";
import { OpenStatus } from "@/components/shared/open-status";
import type { Business } from "@/lib/types";

interface BusinessHeroProps {
  business: Business;
  className?: string;
}

export function BusinessHero({ business, className }: BusinessHeroProps) {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg", className)}>
      <div className="relative aspect-[21/9] w-full">
        {business.heroImage ? (
          <Image
            src={business.heroImage}
            alt={`${business.name} hero image`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Image
              src="/images/freddybeach-logo.png"
              alt="FreddyBeach Directory"
              width={180}
              height={180}
              className="opacity-30"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <TierBadge tier={business.tier} size="md" />
          <OpenStatus hours={business.hours} showNextOpen={false} size="sm" />
        </div>
        <h1 className="text-3xl font-bold mb-2 md:text-4xl lg:text-5xl">
          {business.name}
        </h1>
        <div className="flex items-center gap-4">
          <RatingStars
            rating={business.rating}
            size="lg"
            showValue
            reviewCount={business.reviewCount}
            className="text-white [&_svg]:text-white [&_svg]:fill-yellow-400"
          />
        </div>
      </div>
    </div>
  );
}
