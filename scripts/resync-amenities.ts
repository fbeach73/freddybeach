/**
 * Re-sync amenity data from Google Places API for all existing businesses.
 * Fetches updated place details and merges amenity fields into googlePlaceData JSONB.
 *
 * Usage: npx tsx scripts/resync-amenities.ts
 * Add --dry-run to preview changes without writing to DB.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, isNotNull } from "drizzle-orm";
import { business } from "../src/lib/schema";

const dryRun = process.argv.includes("--dry-run");

// Amenity fields we want to extract from the API response
const AMENITY_KEYS = [
  "dineIn",
  "delivery",
  "takeout",
  "reservable",
  "curbsidePickup",
  "servesBeer",
  "servesWine",
  "servesBreakfast",
  "servesBrunch",
  "servesLunch",
  "servesDinner",
  "servesCoffee",
  "servesVegetarianFood",
  "outdoorSeating",
  "liveMusic",
  "menuForChildren",
  "goodForGroups",
  "goodForChildren",
  "goodForWatchingSports",
  "restroom",
  "allowsDogs",
  "accessibilityOptions",
  "parkingOptions",
  "paymentOptions",
] as const;

const DETAILS_FIELDS = [
  "id",
  "displayName",
  "dineIn",
  "delivery",
  "takeout",
  "reservable",
  "servesBeer",
  "servesWine",
  "servesBreakfast",
  "servesBrunch",
  "servesLunch",
  "servesDinner",
  "servesCoffee",
  "servesVegetarianFood",
  "outdoorSeating",
  "liveMusic",
  "menuForChildren",
  "goodForGroups",
  "goodForChildren",
  "goodForWatchingSports",
  "restroom",
  "allowsDogs",
  "curbsidePickup",
  "accessibilityOptions",
  "parkingOptions",
  "paymentOptions",
].join(",");

async function fetchAmenities(
  placeId: string,
  apiKey: string
): Promise<Record<string, unknown> | null> {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": DETAILS_FIELDS,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`  API error for ${placeId}: ${response.status} - ${errorText}`);
    return null;
  }

  return (await response.json()) as Record<string, unknown>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error("POSTGRES_URL environment variable is not set");
    process.exit(1);
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_PLACES_API_KEY environment variable is not set");
    process.exit(1);
  }

  const sql = postgres(connectionString);
  const db = drizzle(sql);

  console.log(`\n🔄 Re-syncing amenity data from Google Places API${dryRun ? " (DRY RUN)" : ""}\n`);

  // Get all businesses with a Google Place ID
  const businesses = await db
    .select({
      id: business.id,
      name: business.name,
      googlePlaceId: business.googlePlaceId,
      googlePlaceData: business.googlePlaceData,
    })
    .from(business)
    .where(isNotNull(business.googlePlaceId));

  console.log(`Found ${businesses.length} businesses with Google Place IDs\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];
    const placeId = biz.googlePlaceId!;
    const prefix = `[${i + 1}/${businesses.length}]`;

    // Rate limit: 100ms between calls
    if (i > 0) await sleep(100);

    const apiData = await fetchAmenities(placeId, apiKey);
    if (!apiData) {
      console.log(`${prefix} ❌ ${biz.name} — API error`);
      errors++;
      continue;
    }

    // Count how many amenity values we got
    let amenityCount = 0;
    const newAmenityData: Record<string, unknown> = {};

    for (const key of AMENITY_KEYS) {
      if (apiData[key] !== undefined) {
        newAmenityData[key] = apiData[key];
        if (typeof apiData[key] === "boolean" && apiData[key]) {
          amenityCount++;
        } else if (typeof apiData[key] === "object" && apiData[key] !== null) {
          // Count truthy values in nested objects (accessibility, parking, payment)
          const nested = apiData[key] as Record<string, boolean>;
          amenityCount += Object.values(nested).filter(Boolean).length;
        }
      }
    }

    if (amenityCount === 0) {
      console.log(`${prefix} ⏭️  ${biz.name} — no amenities found`);
      skipped++;
      continue;
    }

    // Merge into existing googlePlaceData
    const existingData = (biz.googlePlaceData as Record<string, unknown>) || {};
    const mergedData = { ...existingData, ...newAmenityData };

    if (!dryRun) {
      await db
        .update(business)
        .set({ googlePlaceData: mergedData })
        .where(eq(business.id, biz.id));
    }

    console.log(`${prefix} ✅ ${biz.name} — ${amenityCount} amenities found`);
    updated++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped (no amenities): ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${businesses.length}\n`);

  await sql.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
