import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { business, type GooglePlaceData } from "@/lib/schema";
import { nanoid } from "nanoid";
import {
  searchPlacesByPopularity,
  type PlaceType,
  type FormattedPlace,
} from "@/lib/services/google-places";
import { uploadBusinessPhotos } from "@/lib/services/blob-storage";
import { findDuplicate } from "@/lib/utils/duplicate-detection";

// Category to Google Place search mapping
const CATEGORY_SEARCH_MAPPING: Record<string, { query: string; type?: PlaceType }> = {
  restaurants: { query: "restaurants", type: "restaurant" },
  cafes: { query: "cafes bakeries coffee", type: "cafe" },
  retail: { query: "retail shops stores", type: "store" },
  services: { query: "professional services lawyers accountants" },
  healthcare: { query: "healthcare medical clinic doctors", type: "doctor" },
  plumbing: { query: "plumbers plumbing" },
  electrical: { query: "electricians electrical" },
  hvac: { query: "hvac heating cooling furnace" },
  contractors: { query: "general contractors construction renovation" },
  roofing: { query: "roofing contractors" },
  landscaping: { query: "landscaping lawn care" },
  cleaning: { query: "cleaning services" },
  "pest-control": { query: "pest control exterminator" },
  arts: { query: "entertainment attractions museums galleries", type: "tourist_attraction" },
  automotive: { query: "auto repair car service mechanics", type: "car_repair" },
  beauty: { query: "salon spa beauty hair", type: "hair_care" },
  fitness: { query: "gym fitness", type: "gym" },
  hotels: { query: "hotels lodging accommodation", type: "lodging" },
  nightlife: { query: "bars nightclub pub", type: "bar" },
  pets: { query: "veterinary pet store grooming", type: "veterinary_care" },
  "real-estate": { query: "real estate agents", type: "real_estate_agency" },
  "catch-all": { query: "local services businesses" },
};

export interface BulkImportRequestBody {
  categoryId: string;
}

export interface BulkImportSummary {
  imported: number;
  skipped: number;
  filteredOut: number;
  importedBusinesses: Array<{
    id: string;
    name: string;
    googlePlaceId: string;
  }>;
  skippedPlaces: Array<{
    name: string;
    googlePlaceId?: string;
    reason: string;
  }>;
}

/**
 * Generate a URL-friendly slug from a business name
 */
function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${baseSlug}-${nanoid(6)}`;
}

/**
 * Extract city from Google Places address
 */
function extractCity(address: string): string {
  const parts = address.split(",").map((p) => p.trim());

  for (const part of parts) {
    if (
      part.toLowerCase().includes("fredericton") ||
      part.toLowerCase().includes("oromocto") ||
      part.toLowerCase().includes("new maryland") ||
      part.toLowerCase().includes("hanwell")
    ) {
      return part;
    }
  }

  return "Fredericton";
}

/**
 * Extract postal code from Google Places address
 */
function extractPostalCode(address: string): string | null {
  const postalCodeMatch = address.match(/[A-Z]\d[A-Z]\s?\d[A-Z]\d/i);
  return postalCodeMatch ? postalCodeMatch[0].toUpperCase() : null;
}

export async function POST(request: Request) {
  try {
    // Check admin authentication
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body = (await request.json()) as BulkImportRequestBody;
    const { categoryId } = body;

    if (!categoryId || typeof categoryId !== "string") {
      return NextResponse.json(
        { error: "categoryId is required" },
        { status: 400 }
      );
    }

    // Get search parameters for this category
    const searchParams = CATEGORY_SEARCH_MAPPING[categoryId];
    if (!searchParams) {
      return NextResponse.json(
        { error: `Unknown category: ${categoryId}` },
        { status: 400 }
      );
    }

    // Search Google Places for popular businesses in this category
    const searchResult = await searchPlacesByPopularity({
      query: searchParams.query,
      type: searchParams.type,
      minRating: 4.0,
      minReviews: 10,
      maxResults: 20,
    });

    if (searchResult.places.length === 0) {
      return NextResponse.json({
        imported: 0,
        skipped: 0,
        filteredOut: 0,
        importedBusinesses: [],
        skippedPlaces: [],
        message: "No businesses found matching the quality criteria (rating >= 4.0, reviews >= 10)",
      });
    }

    // Get all existing businesses for duplicate detection
    const existingBusinesses = await db
      .select({
        id: business.id,
        name: business.name,
        address: business.address,
        googlePlaceId: business.googlePlaceId,
      })
      .from(business);

    // Process each place - check for duplicates
    const toImport: FormattedPlace[] = [];
    const skipped: Array<{ name: string; googlePlaceId: string; reason: string }> = [];

    for (const place of searchResult.places) {
      const duplicateResult = findDuplicate(
        {
          name: place.name,
          address: place.address,
          googlePlaceId: place.googlePlaceId,
        },
        existingBusinesses
      );

      if (duplicateResult) {
        skipped.push({
          name: place.name,
          googlePlaceId: place.googlePlaceId,
          reason: duplicateResult.reason,
        });
      } else {
        toImport.push(place);
      }
    }

    // Import non-duplicate businesses
    const importedBusinesses: Array<{
      id: string;
      name: string;
      googlePlaceId: string;
    }> = [];
    const failedImports: Array<{
      name: string;
      googlePlaceId: string;
      reason: string;
    }> = [];

    for (const placeData of toImport) {
      const id = nanoid();

      try {
        // Upload photos to blob storage (max 5 photos per business)
        let blobPhotoUrls: string[] = [];
        const photoNames = placeData.rawData.photos?.map((p) => p.name) || [];

        if (photoNames.length > 0) {
          try {
            blobPhotoUrls = await uploadBusinessPhotos(photoNames, id, 5);
          } catch (photoError) {
            console.warn(`Failed to upload photos for ${placeData.name}:`, photoError);
            // Continue without photos - not a fatal error
          }
        }

        // Prepare Google Place data for storage
        const googlePlaceData: GooglePlaceData = {
          displayName: { text: placeData.name },
          formattedAddress: placeData.address,
          types: placeData.types,
          primaryType: placeData.primaryType,
          photos: placeData.rawData.photos,
          regularOpeningHours: placeData.rawData.regularOpeningHours,
          rating: placeData.rating,
          userRatingCount: placeData.reviewCount,
          priceLevel: placeData.rawData.priceLevel,
          websiteUri: placeData.website,
          nationalPhoneNumber: placeData.phone,
          // Amenity fields
          dineIn: placeData.rawData.dineIn,
          delivery: placeData.rawData.delivery,
          takeout: placeData.rawData.takeout,
          reservable: placeData.rawData.reservable,
          servesBeer: placeData.rawData.servesBeer,
          servesWine: placeData.rawData.servesWine,
          servesBreakfast: placeData.rawData.servesBreakfast,
          servesBrunch: placeData.rawData.servesBrunch,
          servesLunch: placeData.rawData.servesLunch,
          servesDinner: placeData.rawData.servesDinner,
          servesCoffee: placeData.rawData.servesCoffee,
          servesVegetarianFood: placeData.rawData.servesVegetarianFood,
          outdoorSeating: placeData.rawData.outdoorSeating,
          liveMusic: placeData.rawData.liveMusic,
          menuForChildren: placeData.rawData.menuForChildren,
          goodForGroups: placeData.rawData.goodForGroups,
          goodForChildren: placeData.rawData.goodForChildren,
          goodForWatchingSports: placeData.rawData.goodForWatchingSports,
          restroom: placeData.rawData.restroom,
          allowsDogs: placeData.rawData.allowsDogs,
          curbsidePickup: placeData.rawData.curbsidePickup,
          accessibilityOptions: placeData.rawData.accessibilityOptions,
          parkingOptions: placeData.rawData.parkingOptions,
          paymentOptions: placeData.rawData.paymentOptions,
        };

        await db.insert(business).values({
          id,
          name: placeData.name,
          slug: generateSlug(placeData.name),
          description: placeData.primaryTypeDisplay
            ? `${placeData.primaryTypeDisplay} in Fredericton`
            : null,
          categoryId,
          phone: placeData.phone || null,
          website: placeData.website || null,
          address: placeData.address,
          city: extractCity(placeData.address),
          province: "NB",
          postalCode: extractPostalCode(placeData.address),
          latitude: placeData.latitude || null,
          longitude: placeData.longitude || null,
          status: "draft",
          googlePlaceId: placeData.googlePlaceId,
          googlePlaceData,
          hours: placeData.hours.length > 0 ? placeData.hours : null,
          rating: placeData.rating || null,
          reviewCount: placeData.reviewCount || null,
          imageUrl: blobPhotoUrls[0] || null,
          images: blobPhotoUrls.length > 0 ? blobPhotoUrls : null,
        });

        importedBusinesses.push({
          id,
          name: placeData.name,
          googlePlaceId: placeData.googlePlaceId,
        });
      } catch (insertError) {
        console.error(`Failed to import ${placeData.name}:`, insertError);
        failedImports.push({
          name: placeData.name,
          googlePlaceId: placeData.googlePlaceId,
          reason: insertError instanceof Error ? insertError.message : "Database insert failed",
        });
      }
    }

    const summary: BulkImportSummary = {
      imported: importedBusinesses.length,
      skipped: skipped.length + failedImports.length,
      filteredOut: 0, // The filtering happens in searchPlacesByPopularity
      importedBusinesses,
      skippedPlaces: [...skipped, ...failedImports],
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Bulk import error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
