import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { inArray } from "drizzle-orm";
import {
  searchPlaces,
  type PlaceType,
  type FormattedPlace,
} from "@/lib/services/google-places";

export interface SearchRequestBody {
  query: string;
  type?: PlaceType;
  radius?: number;
  pageToken?: string;
}

export interface SearchResultWithDuplicate extends FormattedPlace {
  isDuplicate: boolean;
  existingBusinessId?: string;
}

export interface SearchResponse {
  places: SearchResultWithDuplicate[];
  nextPageToken?: string;
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
    const body = (await request.json()) as SearchRequestBody;
    const { query, type, radius, pageToken } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Sanitize query - trim and limit length
    const sanitizedQuery = query.trim().slice(0, 500);
    if (sanitizedQuery.length === 0) {
      return NextResponse.json(
        { error: "Query cannot be empty" },
        { status: 400 }
      );
    }

    // Validate radius if provided
    if (radius !== undefined) {
      if (typeof radius !== "number" || radius <= 0 || radius > 50000) {
        return NextResponse.json(
          { error: "Radius must be a positive number up to 50000 meters" },
          { status: 400 }
        );
      }
    }

    // Search Google Places
    const searchResult = await searchPlaces({
      query: sanitizedQuery,
      type,
      radius,
      pageToken,
    });

    // Get all Google Place IDs from the results
    const googlePlaceIds = searchResult.places.map((p) => p.googlePlaceId);

    // Check which places already exist in our database
    let existingPlaceIds: Map<string, string> = new Map();

    if (googlePlaceIds.length > 0) {
      const existingBusinesses = await db
        .select({
          id: business.id,
          googlePlaceId: business.googlePlaceId,
        })
        .from(business)
        .where(inArray(business.googlePlaceId, googlePlaceIds));

      existingPlaceIds = new Map(
        existingBusinesses
          .filter((b) => b.googlePlaceId !== null)
          .map((b) => [b.googlePlaceId!, b.id])
      );
    }

    // Add duplicate indicators to results
    const placesWithDuplicates: SearchResultWithDuplicate[] =
      searchResult.places.map((place) => ({
        ...place,
        isDuplicate: existingPlaceIds.has(place.googlePlaceId),
        existingBusinessId: existingPlaceIds.get(place.googlePlaceId),
      }));

    const response: SearchResponse = {
      places: placesWithDuplicates,
      nextPageToken: searchResult.nextPageToken,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Google Places search error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
