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
      {/* nb-card empty state */}
      <div className="nb-card bg-card p-10 w-full max-w-lg">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center bg-nb-pink border-2 border-nb-border mx-auto">
          <SearchX className="h-8 w-8 text-black" />
        </div>

        {/* Message */}
        <h3 className="mt-4 text-lg font-bold uppercase">No businesses found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {query ? (
            <>
              We couldn&apos;t find any businesses matching &quot;
              <span className="font-bold text-foreground">{query}</span>&quot;.
              Try adjusting your search or filters.
            </>
          ) : (
            "No businesses match your current filters. Try adjusting your filters or browse all businesses."
          )}
        </p>

        {/* Suggested searches */}
        {query && onSuggestionClick && (
          <div className="mt-4">
            <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Try searching for:</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Button
                className="nb-btn bg-nb-yellow text-black hover:bg-nb-yellow text-xs"
                size="sm"
                onClick={() => onSuggestionClick("restaurants")}
              >
                Restaurants
              </Button>
              <Button
                className="nb-btn bg-nb-blue text-black hover:bg-nb-blue text-xs"
                size="sm"
                onClick={() => onSuggestionClick("cafes")}
              >
                Cafes
              </Button>
              <Button
                className="nb-btn bg-nb-green text-black hover:bg-nb-green text-xs"
                size="sm"
                onClick={() => onSuggestionClick("services")}
              >
                Services
              </Button>
            </div>
          </div>
        )}

        {/* Browse All Link */}
        <Button asChild className="nb-btn mt-6 bg-nb-green text-black hover:bg-nb-green">
          <Link href="/search">Browse All Businesses</Link>
        </Button>
      </div>

      {/* Popular Categories */}
      {suggestedCategories.length > 0 && (
        <div className="mt-8 w-full max-w-2xl">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Popular Categories
          </h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {suggestedCategories.slice(0, 4).map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
