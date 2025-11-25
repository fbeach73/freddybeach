import type { Business, SearchFilters, SearchResult } from "@/lib/types";
import { businesses, categories } from "@/lib/data";
import { isOpenNow, sortByRating, sortByName } from "./business";

export type SortOption = "rating" | "name" | "newest";

/**
 * Search and filter businesses based on provided filters
 */
export function searchBusinesses(filters: SearchFilters): SearchResult {
  let results = [...businesses];

  // Filter by search query
  if (filters.query) {
    const query = filters.query.toLowerCase().trim();
    results = results.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query) ||
        b.shortDescription.toLowerCase().includes(query) ||
        b.address.toLowerCase().includes(query)
    );
  }

  // Filter by category
  if (filters.category) {
    results = results.filter(
      (b) => b.categorySlug === filters.category || b.categoryId === filters.category
    );
  }

  // Filter by minimum rating
  if (filters.rating && filters.rating > 0) {
    results = results.filter((b) => b.rating >= filters.rating!);
  }

  // Filter by open now
  if (filters.openNow) {
    results = results.filter((b) => isOpenNow(b.hours));
  }

  // Filter by tier
  if (filters.tier) {
    results = results.filter((b) => b.tier === filters.tier);
  }

  return {
    businesses: results,
    totalCount: results.length,
    filters,
  };
}

/**
 * Sort search results
 */
export function sortSearchResults(
  results: Business[],
  sortBy: SortOption
): Business[] {
  switch (sortBy) {
    case "rating":
      return sortByRating(results);
    case "name":
      return sortByName(results);
    case "newest":
      return [...results].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    default:
      return results;
  }
}

/**
 * Get search suggestions based on partial query
 */
export function getSearchSuggestions(query: string, limit = 5): string[] {
  if (!query || query.length < 2) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  const suggestions = new Set<string>();

  // Add matching business names
  businesses.forEach((b) => {
    if (b.name.toLowerCase().includes(lowerQuery)) {
      suggestions.add(b.name);
    }
  });

  // Add matching category names
  categories.forEach((c) => {
    if (c.name.toLowerCase().includes(lowerQuery)) {
      suggestions.add(c.name);
    }
  });

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Get "Did you mean" suggestions for no-result searches
 */
export function getDidYouMeanSuggestions(query: string): string[] {
  if (!query || query.length < 3) {
    return [];
  }

  // Simple suggestion based on category names
  const suggestions: string[] = [];
  const lowerQuery = query.toLowerCase();

  // Check for common misspellings or partial matches
  categories.forEach((c) => {
    const categoryLower = c.name.toLowerCase();
    // Check if first few characters match
    if (
      categoryLower.startsWith(lowerQuery.slice(0, 3)) ||
      levenshteinDistance(lowerQuery, categoryLower) <= 3
    ) {
      suggestions.push(c.name);
    }
  });

  return suggestions.slice(0, 3);
}

/**
 * Simple Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Parse URL search params to SearchFilters
 */
export function parseSearchParams(searchParams: URLSearchParams): SearchFilters {
  return {
    query: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
    rating: searchParams.get("rating")
      ? parseInt(searchParams.get("rating")!, 10)
      : undefined,
    openNow: searchParams.get("open") === "true",
    tier: (searchParams.get("tier") as SearchFilters["tier"]) || undefined,
  };
}

/**
 * Convert SearchFilters to URL search params
 */
export function filtersToSearchParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("q", filters.query);
  }
  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.rating) {
    params.set("rating", filters.rating.toString());
  }
  if (filters.openNow) {
    params.set("open", "true");
  }
  if (filters.tier) {
    params.set("tier", filters.tier);
  }

  return params;
}
