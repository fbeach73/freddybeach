"use client";

import { memo } from "react";
import { BusinessCard } from "@/components/home/business-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Business } from "@/lib/types";

interface SearchResultsProps {
  businesses: Business[];
  isLoading?: boolean;
  className?: string;
}

export const SearchResults = memo(function SearchResults({
  businesses,
  isLoading = false,
  className,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <BusinessCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {businesses.map((business) => (
        <BusinessCard key={business.id} business={business} />
      ))}
    </div>
  );
});

function BusinessCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-5 w-3/4" />
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-2/3" />
        <div className="mt-3 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="mt-2 h-5 w-16" />
      </CardContent>
    </Card>
  );
}

export { BusinessCardSkeleton };
