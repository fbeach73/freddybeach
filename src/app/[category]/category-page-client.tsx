"use client";

import { useState, useMemo } from "react";
import type { Business, Category } from "@/lib/types";
import {
  CategoryPageHeader,
  BusinessListFilters,
  FilterBadge,
  BusinessList,
  type SortOption,
} from "@/components/category";
import { isOpenNow, sortByRating, sortByName } from "@/lib/utils/business";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryPageClientProps {
  category: Category;
  businesses: Business[];
}

export function CategoryPageClient({
  category,
  businesses,
}: CategoryPageClientProps) {
  const [sortOption, setSortOption] = useState<SortOption>("rating-desc");
  const [openNowFilter, setOpenNowFilter] = useState(false);

  const filteredAndSortedBusinesses = useMemo(() => {
    let result = [...businesses];

    // Apply open now filter
    if (openNowFilter) {
      result = result.filter((b) => isOpenNow(b.hours));
    }

    // Apply sorting
    switch (sortOption) {
      case "rating-desc":
        result = sortByRating(result, true);
        break;
      case "rating-asc":
        result = sortByRating(result, false);
        break;
      case "name-asc":
        result = sortByName(result, false);
        break;
      case "name-desc":
        result = sortByName(result, true);
        break;
    }

    return result;
  }, [businesses, sortOption, openNowFilter]);

  const handleRemoveOpenNowFilter = () => {
    setOpenNowFilter(false);
  };

  const hasActiveFilters = openNowFilter; // Easy to extend later

  return (
    <>
      <CategoryPageHeader
        category={category}
        businessCount={filteredAndSortedBusinesses.length}
      />

      <BusinessListFilters
        sortOption={sortOption}
        onSortChange={setSortOption}
        openNow={openNowFilter}
        onOpenNowChange={setOpenNowFilter}
      />

      {openNowFilter && (
        <div className="mb-4 flex flex-wrap gap-2">
          <FilterBadge
            label="Open Now"
            onRemove={handleRemoveOpenNowFilter}
          />
        </div>
      )}

      {filteredAndSortedBusinesses.length === 0 && hasActiveFilters ? (
        <section role="status" aria-live="polite" className="nb-card bg-card p-12 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center bg-nb-yellow border-2 border-nb-border">
            <SearchX className="h-8 w-8 text-black" />
          </div>
          <h3 className="mt-4 text-lg font-bold uppercase">No businesses match your filters</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Try adjusting your filters to see more results.
          </p>
          <Button
            className="nb-btn mt-4 bg-nb-pink text-black hover:bg-nb-pink"
            onClick={handleRemoveOpenNowFilter}
          >
            Clear Filters
          </Button>
        </section>
      ) : (
        <BusinessList
          businesses={filteredAndSortedBusinesses}
          categorySlug={category.slug}
          categoryName={category.name}
        />
      )}
    </>
  );
}
