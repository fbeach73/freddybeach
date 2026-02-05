import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { like } from "drizzle-orm";

/**
 * Create a URL-friendly base slug from text
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generate a unique business slug from a name.
 * Produces clean slugs like "isaacs-way", with numeric
 * suffixes ("isaacs-way-2") only when there's a collision.
 */
export async function generateUniqueBusinessSlug(name: string): Promise<string> {
  const baseSlug = slugify(name.trim());

  // Find any existing slugs that start with this base
  const existing = await db
    .select({ slug: business.slug })
    .from(business)
    .where(like(business.slug, `${baseSlug}%`));

  const existingSlugs = new Set(existing.map((r) => r.slug));

  // Try the clean slug first
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  // Append incrementing number until unique
  let i = 2;
  while (existingSlugs.has(`${baseSlug}-${i}`)) {
    i++;
  }

  return `${baseSlug}-${i}`;
}
