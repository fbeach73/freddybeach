import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { getCategoryById } from "./categories";
import type { Business, BusinessHours, DayOfWeek } from "@/lib/types";

/**
 * Convert database business hours (day as number 0-6) to the Business type format
 */
function convertHours(dbHours: { day: number; open: string; close: string }[] | null): BusinessHours[] {
  if (!dbHours || dbHours.length === 0) {
    return [];
  }

  const dayNames: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return dbHours.map((h) => ({
    day: dayNames[h.day],
    open: h.open,
    close: h.close,
    closed: false,
  }));
}

/**
 * Convert a database business record to the Business type used by UI components
 */
function toBusinessType(dbBusiness: typeof business.$inferSelect): Business {
  const category = dbBusiness.categoryId ? getCategoryById(dbBusiness.categoryId) : null;

  return {
    id: dbBusiness.id,
    name: dbBusiness.name,
    slug: dbBusiness.slug,
    categoryId: dbBusiness.categoryId || "",
    categorySlug: category?.slug || "",
    description: dbBusiness.description || `${dbBusiness.name} in Fredericton, NB`,
    shortDescription: dbBusiness.description?.substring(0, 100) || `${dbBusiness.name} - ${category?.name || "Business"} in Fredericton`,
    address: dbBusiness.address || "",
    city: dbBusiness.city || "Fredericton",
    province: dbBusiness.province || "NB",
    postalCode: dbBusiness.postalCode || "",
    phone: dbBusiness.phone || "",
    email: dbBusiness.email || "",
    website: dbBusiness.website || undefined,
    rating: dbBusiness.rating || 0,
    reviewCount: dbBusiness.reviewCount || 0,
    hours: convertHours(dbBusiness.hours),
    images: dbBusiness.images || [],
    heroImage: dbBusiness.imageUrl || dbBusiness.images?.[0] || "",
    // Derived from ownerId - true if business has been claimed
    isClaimed: dbBusiness.ownerId !== null,
    isVerified: false,
    isFeatured: false,
    tier: "free" as const,
    createdAt: dbBusiness.createdAt,
  };
}

/**
 * Get all published businesses
 */
export async function getPublishedBusinesses(): Promise<Business[]> {
  const results = await db
    .select()
    .from(business)
    .where(eq(business.status, "published"));

  return results.map(toBusinessType);
}

/**
 * Get published businesses by category ID
 */
export async function getBusinessesByCategoryFromDb(categoryId: string): Promise<Business[]> {
  const results = await db
    .select()
    .from(business)
    .where(
      and(
        eq(business.status, "published"),
        eq(business.categoryId, categoryId)
      )
    );

  return results.map(toBusinessType);
}

/**
 * Get a single published business by slug
 */
export async function getBusinessBySlugFromDb(slug: string): Promise<Business | null> {
  const [result] = await db
    .select()
    .from(business)
    .where(
      and(
        eq(business.slug, slug),
        eq(business.status, "published")
      )
    );

  return result ? toBusinessType(result) : null;
}

/**
 * Get all businesses (including drafts) - for admin use
 */
export async function getAllBusinesses(): Promise<Business[]> {
  const results = await db.select().from(business);
  return results.map(toBusinessType);
}
