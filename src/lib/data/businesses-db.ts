import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { eq, and, asc, inArray } from "drizzle-orm";
import { getCategoryById } from "./categories";
import type { Business, BusinessAmenities, BusinessHours, DayOfWeek, BusinessBadge } from "@/lib/types";
import type { GooglePlaceData } from "@/lib/schema";

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
 * Extract a flat BusinessAmenities object from the GooglePlaceData JSONB blob
 */
function extractAmenities(data: GooglePlaceData | null | undefined): BusinessAmenities | undefined {
  if (!data) return undefined;

  const amenities: BusinessAmenities = {};
  let hasAny = false;

  // Direct boolean fields
  const booleanFields = [
    "dineIn", "delivery", "takeout", "reservable", "curbsidePickup",
    "servesBeer", "servesWine", "servesBreakfast", "servesBrunch",
    "servesLunch", "servesDinner", "servesCoffee", "servesVegetarianFood",
    "outdoorSeating", "liveMusic", "goodForGroups", "goodForChildren",
    "goodForWatchingSports", "menuForChildren", "restroom", "allowsDogs",
  ] as const;

  for (const field of booleanFields) {
    if (typeof data[field] === "boolean") {
      (amenities as Record<string, unknown>)[field] = data[field];
      if (data[field]) hasAny = true;
    }
  }

  // Flatten nested accessibility options
  if (data.accessibilityOptions) {
    const ao = data.accessibilityOptions;
    if (ao.wheelchairAccessibleEntrance) { amenities.wheelchairAccessibleEntrance = true; hasAny = true; }
    if (ao.wheelchairAccessibleParking) { amenities.wheelchairAccessibleParking = true; hasAny = true; }
    if (ao.wheelchairAccessibleRestroom) { amenities.wheelchairAccessibleRestroom = true; hasAny = true; }
    if (ao.wheelchairAccessibleSeating) { amenities.wheelchairAccessibleSeating = true; hasAny = true; }
  }

  // Flatten nested parking options
  if (data.parkingOptions) {
    const po = data.parkingOptions;
    if (po.freeParkingLot) { amenities.freeParkingLot = true; hasAny = true; }
    if (po.paidParkingLot) { amenities.paidParkingLot = true; hasAny = true; }
    if (po.freeStreetParking) { amenities.freeStreetParking = true; hasAny = true; }
    if (po.valetParking) { amenities.valetParking = true; hasAny = true; }
  }

  // Flatten nested payment options
  if (data.paymentOptions) {
    const pay = data.paymentOptions;
    if (pay.acceptsCreditCards) { amenities.acceptsCreditCards = true; hasAny = true; }
    if (pay.acceptsDebitCards) { amenities.acceptsDebitCards = true; hasAny = true; }
    if (pay.acceptsCashOnly) { amenities.acceptsCashOnly = true; hasAny = true; }
    if (pay.acceptsNfc) { amenities.acceptsNfc = true; hasAny = true; }
  }

  // Meta fields
  if (data.priceLevel) {
    amenities.priceLevel = data.priceLevel;
    hasAny = true;
  }
  if (data.types) {
    amenities.types = data.types;
  }

  return hasAny ? amenities : undefined;
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
    latitude: dbBusiness.latitude || undefined,
    longitude: dbBusiness.longitude || undefined,
    rating: dbBusiness.rating || 0,
    reviewCount: dbBusiness.reviewCount || 0,
    hours: convertHours(dbBusiness.hours),
    images: dbBusiness.images || [],
    heroImage: dbBusiness.imageUrl || dbBusiness.images?.[0] || "",
    // Derived from ownerId - true if business has been claimed
    isClaimed: dbBusiness.ownerId !== null,
    isVerified: false,
    isFeatured: dbBusiness.isFeatured,
    amenities: extractAmenities(dbBusiness.googlePlaceData),
    badges: (dbBusiness.badges as BusinessBadge[]) || [],
    displayOrder: dbBusiness.displayOrder,
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

/**
 * Get featured businesses for the homepage carousel
 * Returns published businesses with isFeatured=true, ordered by displayOrder
 */
export async function getFeaturedBusinessesFromDb(): Promise<Business[]> {
  const results = await db
    .select()
    .from(business)
    .where(
      and(
        eq(business.status, "published"),
        eq(business.isFeatured, true)
      )
    )
    .orderBy(asc(business.displayOrder));

  return results.map(toBusinessType);
}

/**
 * Get multiple published businesses by their slugs
 * Useful for fetching featured businesses in blog posts
 */
export async function getBusinessesBySlugs(slugs: string[]): Promise<Business[]> {
  if (slugs.length === 0) {
    return [];
  }

  const results = await db
    .select()
    .from(business)
    .where(
      and(
        eq(business.status, "published"),
        inArray(business.slug, slugs)
      )
    );

  return results.map(toBusinessType);
}
