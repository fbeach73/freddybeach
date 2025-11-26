"use client";

import Image from "next/image";
import { Star, MapPin, ExternalLink, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/data/categories";
import type { FormattedPlace } from "@/lib/services/google-places";

interface PlaceResultCardProps {
  place: FormattedPlace;
  isSelected: boolean;
  onToggleSelect: (placeId: string) => void;
  categoryId: string | undefined;
  onCategoryChange: (placeId: string, categoryId: string) => void;
  isAlreadyImported: boolean;
}

export function PlaceResultCard({
  place,
  isSelected,
  onToggleSelect,
  categoryId,
  onCategoryChange,
  isAlreadyImported,
}: PlaceResultCardProps) {
  return (
    <Card
      className={`relative transition-all ${
        isSelected ? "ring-2 ring-primary" : ""
      } ${isAlreadyImported ? "opacity-60" : ""}`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          {/* Checkbox */}
          <div className="flex items-start pt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(place.id)}
              disabled={isAlreadyImported}
              aria-label={`Select ${place.name}`}
            />
          </div>

          {/* Photo Thumbnail */}
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted sm:h-20 sm:w-20">
            {place.photoUrl ? (
              <Image
                src={place.photoUrl}
                alt={place.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 64px, 80px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
            )}
          </div>

          {/* Business Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold sm:text-base">{place.name}</h3>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">
                  {place.shortAddress || place.address}
                </p>
              </div>

              {/* Already Imported Badge - hidden on mobile, shown on desktop */}
              {isAlreadyImported && (
                <Badge variant="secondary" className="hidden flex-shrink-0 sm:flex">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Imported
                </Badge>
              )}
            </div>

            {/* Already Imported Badge - shown on mobile only */}
            {isAlreadyImported && (
              <Badge variant="secondary" className="mt-1 flex w-fit sm:hidden">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Imported
              </Badge>
            )}

            {/* Rating & Review Count */}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
              {place.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 sm:h-4 sm:w-4" />
                  <span>{place.rating.toFixed(1)}</span>
                  {place.reviewCount && (
                    <span className="text-muted-foreground">
                      ({place.reviewCount.toLocaleString()})
                    </span>
                  )}
                </div>
              )}
              {place.priceLevel && (
                <span className="text-muted-foreground">{place.priceLevel}</span>
              )}
            </div>

            {/* Google Category */}
            <div className="mt-1">
              {place.primaryTypeDisplay && (
                <Badge variant="outline" className="text-xs">
                  {place.primaryTypeDisplay}
                </Badge>
              )}
            </div>

            {/* Category Selector */}
            <div className="mt-2 sm:mt-3">
              <Select
                value={categoryId || ""}
                onValueChange={(value) => onCategoryChange(place.id, value)}
                disabled={isAlreadyImported}
              >
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* External Link - hidden on mobile */}
          {place.googleMapsUrl && (
            <a
              href={place.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground sm:block"
              title="View on Google Maps"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton loading state
export function PlaceResultCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          {/* Checkbox placeholder */}
          <div className="flex items-start pt-1">
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          </div>

          {/* Photo placeholder */}
          <div className="h-16 w-16 flex-shrink-0 animate-pulse rounded-md bg-muted sm:h-20 sm:w-20" />

          {/* Content placeholder */}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted sm:h-5" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted sm:h-4" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted sm:h-4" />
            <div className="h-8 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
