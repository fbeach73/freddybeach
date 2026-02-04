import Link from "next/link";
import Image from "next/image";
import { MapPin, Sparkles, Star, Heart, TrendingUp, BadgeCheck, Award } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/shared/tier-badge";
import { RatingStars } from "@/components/shared/rating-stars";
import { OpenStatus } from "@/components/shared/open-status";
import type { Business, BusinessBadge } from "@/lib/types";

interface BusinessCardProps {
  business: Business;
  /** Optional override for category slug. Defaults to business.categorySlug */
  categorySlug?: string;
}

const BADGE_CONFIG: Record<BusinessBadge, { label: string; icon: React.ComponentType<{ className?: string }>; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  new: { label: "New", icon: Sparkles, variant: "default", className: "bg-green-500 hover:bg-green-600" },
  featured: { label: "Featured", icon: Star, variant: "default", className: "bg-yellow-500 hover:bg-yellow-600 text-black" },
  favourite: { label: "Favourite", icon: Heart, variant: "default", className: "bg-red-500 hover:bg-red-600" },
  popular: { label: "Popular", icon: TrendingUp, variant: "default", className: "bg-blue-500 hover:bg-blue-600" },
  verified: { label: "Verified", icon: BadgeCheck, variant: "default", className: "bg-emerald-500 hover:bg-emerald-600" },
  "top-rated": { label: "Top Rated", icon: Award, variant: "default", className: "bg-purple-500 hover:bg-purple-600" },
};

export function BusinessCard({ business, categorySlug }: BusinessCardProps) {
  const showTierBadge = business.tier === "enhanced" || business.tier === "featured";
  const category = categorySlug || business.categorySlug;
  const badges = business.badges || [];

  return (
    <Link href={`/${category}/${business.slug}`}>
      <div className="nb-card bg-card group h-full overflow-hidden">
        <div className="relative aspect-video overflow-hidden bg-muted border-b-2 border-nb-border">
          {business.heroImage ? (
            <Image
              src={business.heroImage}
              alt={business.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/50">
              <Image
                src="/images/freddybeach-logo.png"
                alt="FreddyBeach Directory"
                width={100}
                height={100}
                className="opacity-40"
              />
            </div>
          )}
          {/* Business badges */}
          {badges.length > 0 && (
            <div className="absolute left-2 top-2 flex flex-wrap gap-1">
              {badges.slice(0, 2).map((badge) => {
                const config = BADGE_CONFIG[badge];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <Badge key={badge} variant={config.variant} className={`nb-badge ${config.className} text-xs`}>
                    <Icon className="mr-1 h-3 w-3" />
                    {config.label}
                  </Badge>
                );
              })}
            </div>
          )}
          {/* Tier badge - show on right if there are badges, otherwise on left */}
          {showTierBadge && (
            <div className={`absolute top-2 ${badges.length > 0 ? "right-2" : "left-2"}`}>
              <TierBadge tier={business.tier} size="sm" />
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <h3 className="font-bold line-clamp-1">{business.name}</h3>
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
      </div>
    </Link>
  );
}
