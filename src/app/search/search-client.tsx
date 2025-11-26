"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { SearchBar } from "@/components/search/search-bar";
import {
  SearchFilters,
  FilterState,
  getActiveFilterCount,
} from "@/components/search/search-filters";
import { SearchResults } from "@/components/search/search-results";
import { SearchPagination } from "@/components/search/search-pagination";
import { NoResults } from "@/components/search/no-results";
import type { Business, Category } from "@/lib/types";

const PAGE_SIZE = 20;

type SortOption = "relevance" | "rating" | "name-asc" | "name-desc";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Highest Rated" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
];

interface SearchClientProps {
  businesses: Business[];
  categories: Category[];
}

export function SearchClient({ businesses, categories }: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL params
  const initialQuery = searchParams.get("q") || "";
  const initialCategories = searchParams.get("category")?.split(",").filter(Boolean) || [];
  const initialRating = searchParams.get("rating")
    ? parseFloat(searchParams.get("rating")!)
    : null;
  const initialOpenNow = searchParams.get("open") === "true";
  const initialSort = (searchParams.get("sort") as SortOption) || "relevance";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  // State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<FilterState>({
    categories: initialCategories,
    minRating: initialRating,
    openNow: initialOpenNow,
  });
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when state changes
  const updateURL = useCallback(
    (params: {
      q?: string;
      category?: string[];
      rating?: number | null;
      open?: boolean;
      sort?: SortOption;
      page?: number;
    }) => {
      const url = new URL(window.location.href);

      // Query
      if (params.q !== undefined) {
        if (params.q) {
          url.searchParams.set("q", params.q);
        } else {
          url.searchParams.delete("q");
        }
      }

      // Category
      if (params.category !== undefined) {
        if (params.category.length > 0) {
          url.searchParams.set("category", params.category.join(","));
        } else {
          url.searchParams.delete("category");
        }
      }

      // Rating
      if (params.rating !== undefined) {
        if (params.rating !== null) {
          url.searchParams.set("rating", params.rating.toString());
        } else {
          url.searchParams.delete("rating");
        }
      }

      // Open Now
      if (params.open !== undefined) {
        if (params.open) {
          url.searchParams.set("open", "true");
        } else {
          url.searchParams.delete("open");
        }
      }

      // Sort
      if (params.sort !== undefined) {
        if (params.sort !== "relevance") {
          url.searchParams.set("sort", params.sort);
        } else {
          url.searchParams.delete("sort");
        }
      }

      // Page
      if (params.page !== undefined) {
        if (params.page > 1) {
          url.searchParams.set("page", params.page.toString());
        } else {
          url.searchParams.delete("page");
        }
      }

      router.push(url.pathname + url.search, { scroll: false });
    },
    [router]
  );

  // Update URL when debounced query changes
  useEffect(() => {
    updateURL({ q: debouncedQuery, page: 1 });
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Check if a business is currently open (mock implementation)
  const isBusinessOpen = useCallback((business: Business): boolean => {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const currentHours = business.hours.find((h) => h.day === dayOfWeek);

    if (!currentHours || currentHours.closed) {
      return false;
    }

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = currentHours.open.split(":").map(Number);
    const [closeHour, closeMin] = currentHours.close.split(":").map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
  }, []);

  // Filter businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      // Filter by query
      if (debouncedQuery) {
        const lowerQuery = debouncedQuery.toLowerCase();
        const matchesName = business.name.toLowerCase().includes(lowerQuery);
        const matchesDescription = business.description
          .toLowerCase()
          .includes(lowerQuery);
        const matchesShortDesc = business.shortDescription
          .toLowerCase()
          .includes(lowerQuery);

        if (!matchesName && !matchesDescription && !matchesShortDesc) {
          return false;
        }
      }

      // Filter by category
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(business.categorySlug)) {
          return false;
        }
      }

      // Filter by rating
      if (filters.minRating !== null) {
        if (business.rating < filters.minRating) {
          return false;
        }
      }

      // Filter by open now
      if (filters.openNow) {
        if (!isBusinessOpen(business)) {
          return false;
        }
      }

      return true;
    });
  }, [businesses, debouncedQuery, filters, isBusinessOpen]);

  // Sort businesses
  const sortedBusinesses = useMemo(() => {
    const sorted = [...filteredBusinesses];

    switch (sortBy) {
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "relevance":
      default:
        // If there's a query, sort by relevance (name match first)
        if (debouncedQuery) {
          const lowerQuery = debouncedQuery.toLowerCase();
          sorted.sort((a, b) => {
            const aNameMatch = a.name.toLowerCase().includes(lowerQuery);
            const bNameMatch = b.name.toLowerCase().includes(lowerQuery);
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            // Secondary sort by rating for relevance
            return b.rating - a.rating;
          });
        } else {
          // No query, sort featured first, then by rating
          sorted.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return b.rating - a.rating;
          });
        }
        break;
    }

    return sorted;
  }, [filteredBusinesses, sortBy, debouncedQuery]);

  // Pagination
  const totalPages = Math.ceil(sortedBusinesses.length / PAGE_SIZE);
  const paginatedBusinesses = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedBusinesses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedBusinesses, currentPage]);

  // Handlers - wrapped in useCallback for performance
  const handleCategoryChange = useCallback(
    (newCategories: string[]) => {
      setFilters((prev) => ({ ...prev, categories: newCategories }));
      updateURL({ category: newCategories, page: 1 });
      setCurrentPage(1);
    },
    [updateURL]
  );

  const handleRatingChange = useCallback(
    (rating: number | null) => {
      setFilters((prev) => ({ ...prev, minRating: rating }));
      updateURL({ rating, page: 1 });
      setCurrentPage(1);
    },
    [updateURL]
  );

  const handleOpenNowChange = useCallback(
    (openNow: boolean) => {
      setFilters((prev) => ({ ...prev, openNow }));
      updateURL({ open: openNow, page: 1 });
      setCurrentPage(1);
    },
    [updateURL]
  );

  const handleClearAllFilters = useCallback(() => {
    setFilters({
      categories: [],
      minRating: null,
      openNow: false,
    });
    updateURL({
      category: [],
      rating: null,
      open: false,
      page: 1,
    });
    setCurrentPage(1);
  }, [updateURL]);

  const handleSortChange = useCallback(
    (value: SortOption) => {
      setSortBy(value);
      updateURL({ sort: value, page: 1 });
      setCurrentPage(1);
    },
    [updateURL]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      updateURL({ page });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateURL]
  );

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
  }, []);

  const activeFilterCount = getActiveFilterCount(filters);
  const hasResults = paginatedBusinesses.length > 0;
  const showNoResults = !hasResults && (debouncedQuery || activeFilterCount > 0);

  // Popular categories for no results state
  const popularCategories = categories.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search businesses, services, restaurants..."
        size="lg"
        autoFocus
      />

      {/* Results Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {debouncedQuery ? (
            <h2 className="text-lg font-semibold">
              Showing results for &quot;{debouncedQuery}&quot;
            </h2>
          ) : (
            <h2 className="text-lg font-semibold">Browse All Businesses</h2>
          )}
          <p className="text-sm text-muted-foreground">
            {sortedBusinesses.length}{" "}
            {sortedBusinesses.length === 1 ? "business" : "businesses"} found
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filters Button */}
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setIsFiltersOpen(true)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-lg border bg-card p-6">
            <h3 className="mb-4 font-semibold">Filters</h3>
            <SearchFilters
              filters={filters}
              categories={categories}
              onCategoryChange={handleCategoryChange}
              onRatingChange={handleRatingChange}
              onOpenNowChange={handleOpenNowChange}
              onClearAll={handleClearAllFilters}
            />
          </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-1">
          {showNoResults ? (
            <NoResults
              query={debouncedQuery || undefined}
              suggestedCategories={popularCategories}
              onSuggestionClick={handleSuggestionClick}
            />
          ) : (
            <>
              <SearchResults businesses={paginatedBusinesses} />
              {totalPages > 1 && (
                <SearchPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mt-8"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <SheetContent side="left" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <SearchFilters
              filters={filters}
              categories={categories}
              onCategoryChange={handleCategoryChange}
              onRatingChange={handleRatingChange}
              onOpenNowChange={handleOpenNowChange}
              onClearAll={handleClearAllFilters}
            />
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button className="w-full">
                Apply Filters
                {activeFilterCount > 0 && ` (${activeFilterCount})`}
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
