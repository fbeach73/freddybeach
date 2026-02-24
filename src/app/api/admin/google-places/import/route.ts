import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { business, type GooglePlaceData } from "@/lib/schema";
import { inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { FormattedPlace } from "@/lib/services/google-places";
import { generateUniqueBusinessSlug } from "@/lib/slug";
import { uploadBusinessPhotos } from "@/lib/services/blob-storage";

export interface PlaceToImport {
  placeData: FormattedPlace;
  categoryId: string;
}

export interface ImportRequestBody {
  places: PlaceToImport[];
}

export interface ImportSummary {
  imported: number;
  skipped: number;
  importedBusinesses: Array<{
    id: string;
    name: string;
    googlePlaceId: string;
  }>;
  skippedPlaces: Array<{
    name: string;
    googlePlaceId: string;
    reason: string;
  }>;
}

/**
 * Extract city from Google Places address
 */
function extractCity(address: string): string {
  // Typical Google format: "123 Main St, Fredericton, NB A1B 2C3, Canada"
  const parts = address.split(",").map((p) => p.trim());

  // Try to find Fredericton or other city name
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

  // Default to Fredericton for the directory focus
  return "Fredericton";
}

/**
 * Extract postal code from Google Places address
 */
function extractPostalCode(address: string): string | null {
  // Canadian postal code pattern: A1A 1A1
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
    const body = (await request.json()) as ImportRequestBody;
    const { places } = body;

    if (!places || !Array.isArray(places) || places.length === 0) {
      return NextResponse.json(
        { error: "Places array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Validate all places have required data
    for (const place of places) {
      if (!place.placeData || !place.categoryId) {
        return NextResponse.json(
          { error: "Each place must have placeData and categoryId" },
          { status: 400 }
        );
      }
    }

    // Get all Google Place IDs to check for duplicates
    const googlePlaceIds = places.map((p) => p.placeData.googlePlaceId);

    // Check for existing businesses with these Google Place IDs
    const existingBusinesses = await db
      .select({
        googlePlaceId: business.googlePlaceId,
        name: business.name,
      })
      .from(business)
      .where(inArray(business.googlePlaceId, googlePlaceIds));

    const existingPlaceIds = new Set(
      existingBusinesses
        .filter((b) => b.googlePlaceId !== null)
        .map((b) => b.googlePlaceId!)
    );

    // Separate places into importable and skipped
    const toImport: PlaceToImport[] = [];
    const skipped: Array<{ name: string; googlePlaceId: string; reason: string }> = [];

    for (const place of places) {
      if (existingPlaceIds.has(place.placeData.googlePlaceId)) {
        skipped.push({
          name: place.placeData.name,
          googlePlaceId: place.placeData.googlePlaceId,
          reason: "Already imported",
        });
      } else {
        toImport.push(place);
      }
    }

    // Import new businesses with individual error handling
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

    for (const place of toImport) {
      const { placeData, categoryId } = place;

      // Validate categoryId exists
      if (!categoryId) {
        failedImports.push({
          name: placeData.name,
          googlePlaceId: placeData.googlePlaceId,
          reason: "Missing category assignment",
        });
        continue;
      }

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
          slug: await generateUniqueBusinessSlug(placeData.name),
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
          imageUrl: blobPhotoUrls[0] || null, // Primary photo from blob storage
          images: blobPhotoUrls.length > 0 ? blobPhotoUrls : null, // All photos from blob storage
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

    const summary: ImportSummary = {
      imported: importedBusinesses.length,
      skipped: skipped.length + failedImports.length,
      importedBusinesses,
      skippedPlaces: [...skipped, ...failedImports],
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Google Places import error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
