"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/home/category-card";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface NoResultsProps {
  query?: string;
  suggestedCategories?: Category[];
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export function NoResults({
  query,
  suggestedCategories = [],
  onSuggestionClick,
  className,
}: NoResultsProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      {/* Icon */}
      <div className="rounded-full bg-muted p-4">
        <SearchX className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Message */}
      <h3 className="mt-4 text-lg font-semibold">No businesses found</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {query ? (
          <>
            We couldn&apos;t find any businesses matching &quot;
            <span className="font-medium text-foreground">{query}</span>&quot;.
            Try adjusting your search or filters.
          </>
        ) : (
          "No businesses match your current filters. Try adjusting your filters or browse all businesses."
        )}
      </p>

      {/* Suggested searches */}
      {query && onSuggestionClick && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">Try searching for:</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSuggestionClick("restaurants")}
            >
              Restaurants
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSuggestionClick("cafes")}
            >
              Cafes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSuggestionClick("services")}
            >
              Services
            </Button>
          </div>
        </div>
      )}

      {/* Popular Categories */}
      {suggestedCategories.length > 0 && (
        <div className="mt-8 w-full max-w-2xl">
          <h4 className="mb-4 text-sm font-medium text-muted-foreground">
            Popular Categories
          </h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {suggestedCategories.slice(0, 4).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      )}

      {/* Browse All Link */}
      <Button asChild className="mt-6">
        <Link href="/search">Browse All Businesses</Link>
      </Button>
    </div>
  );
}
