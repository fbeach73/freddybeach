// Blog Categories
// Reuses the directory categories for consistency

import { categories, getCategoryById, getCategoryBySlug } from "@/lib/data/categories";
import type { Category } from "@/lib/types";

// Re-export the category functions and data for blog use
export { categories, getCategoryById, getCategoryBySlug };

// Blog-specific category utilities

/**
 * Get all categories that have blog-relevant content
 * For now, returns all categories since any business category could have related blog posts
 */
export function getBlogCategories(): Category[] {
  return categories;
}

/**
 * Get category name from ID with fallback
 */
export function getCategoryName(categoryId: string): string {
  const category = getCategoryById(categoryId);
  return category?.name ?? "General";
}

/**
 * Get category slug from ID with fallback
 */
export function getCategorySlugFromId(categoryId: string): string {
  const category = getCategoryById(categoryId);
  return category?.slug ?? "general";
}

/**
 * Validate that a category ID exists
 */
export function isValidCategory(categoryId: string): boolean {
  return getCategoryById(categoryId) !== undefined;
}
