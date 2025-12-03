import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchClient } from "./search-client";
import { getPublishedBusinesses } from "@/lib/data/businesses-db";
import { getCategoriesWithCounts } from "@/lib/data/categories-db";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Search Businesses | FreddyBeach.com",
  description:
    "Search and discover local businesses in Fredericton, New Brunswick. Find restaurants, cafes, retail shops, professional services, and more.",
  openGraph: {
    title: "Search Businesses | FreddyBeach.com",
    description:
      "Search and discover local businesses in Fredericton, New Brunswick. Find restaurants, cafes, retail shops, professional services, and more.",
  },
};

// Revalidate every 60 seconds
export const revalidate = 60;

function SearchLoading() {
  return (
    <div className="space-y-6">
      {/* Search Bar Skeleton */}
      <Skeleton className="h-14 w-full" />

      {/* Results Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 lg:hidden" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex gap-8">
        {/* Sidebar Skeleton */}
        <div className="hidden w-64 shrink-0 lg:block">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>

        {/* Grid Skeleton */}
        <div className="flex-1">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={`skeleton-${i}`} className="aspect-[4/5] w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function SearchPage() {
  // Fetch businesses and categories with counts from database
  const [businesses, categoriesWithCounts] = await Promise.all([
    getPublishedBusinesses(),
    getCategoriesWithCounts(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<SearchLoading />}>
        <SearchClient businesses={businesses} categories={categoriesWithCounts} />
      </Suspense>
    </div>
  );
}
