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

      <BusinessList
        businesses={filteredAndSortedBusinesses}
        categorySlug={category.slug}
        categoryName={category.name}
      />
    </>
  );
}
