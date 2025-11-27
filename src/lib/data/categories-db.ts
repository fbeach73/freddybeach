import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { eq, count } from "drizzle-orm";
import { categories } from "./categories";
import type { Category } from "@/lib/types";

/**
 * Get all categories with accurate business counts from the database
 * Server-only function - do not import in client components
 */
export async function getCategoriesWithCounts(): Promise<Category[]> {
  // Get counts for each category from the database
  const counts = await db
    .select({
      categoryId: business.categoryId,
      count: count(business.id),
    })
    .from(business)
    .where(eq(business.status, "published"))
    .groupBy(business.categoryId);

  // Create a map of categoryId to count
  const countMap = new Map<string, number>();
  counts.forEach((c) => {
    if (c.categoryId) {
      countMap.set(c.categoryId, c.count);
    }
  });

  // Return categories with updated counts
  return categories.map((cat) => ({
    ...cat,
    businessCount: countMap.get(cat.id) || 0,
  }));
}
