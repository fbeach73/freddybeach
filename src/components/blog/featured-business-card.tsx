// Featured Business Card Component
// Compact business card for blog post sidebar

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import type { Business } from "@/lib/types";

interface FeaturedBusinessCardProps {
  business: Business;
}

export function FeaturedBusinessCard({ business }: FeaturedBusinessCardProps) {
  const href = `/${business.categorySlug}/${business.slug}`;

  return (
    <Link href={href} className="group block">
      <div className="flex gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
        {/* Image */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
          <Image
            src={business.heroImage}
            alt={business.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="64px"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {business.name}
          </h4>

          {/* Rating */}
          {business.rating > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">
                {business.rating.toFixed(1)}
                {business.reviewCount > 0 && (
                  <span> ({business.reviewCount})</span>
                )}
              </span>
            </div>
          )}

          {/* Address */}
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{business.address}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
