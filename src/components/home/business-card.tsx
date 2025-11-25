import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TierBadge } from "@/components/shared/tier-badge";
import { RatingStars } from "@/components/shared/rating-stars";
import { OpenStatus } from "@/components/shared/open-status";
import type { Business } from "@/lib/types";

interface BusinessCardProps {
  business: Business;
  /** Optional override for category slug. Defaults to business.categorySlug */
  categorySlug?: string;
}

export function BusinessCard({ business, categorySlug }: BusinessCardProps) {
  const showTierBadge = business.tier === "enhanced" || business.tier === "featured";
  const category = categorySlug || business.categorySlug;

  return (
    <Link href={`/${category}/${business.slug}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={business.heroImage}
            alt={business.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {showTierBadge && (
            <div className="absolute left-2 top-2">
              <TierBadge tier={business.tier} size="sm" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1">{business.name}</h3>
          <div className="mt-1">
            <RatingStars
              rating={business.rating}
              size="sm"
              showValue
              reviewCount={business.reviewCount}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {business.shortDescription}
          </p>
          <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{business.address}</span>
          </div>
          <div className="mt-2">
            <OpenStatus hours={business.hours} size="sm" showNextOpen={false} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
