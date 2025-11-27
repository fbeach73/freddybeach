import { type BusinessHours } from "@/lib/schema";

// ============================================================================
// Google Places API (New) - TypeScript Interfaces
// https://developers.google.com/maps/documentation/places/web-service/op-overview
// ============================================================================

// Fredericton, NB center coordinates
export const FREDERICTON_CENTER = {
  latitude: 45.9636,
  longitude: -66.6431,
};

// Google Place types relevant to local business directory
export const PLACE_TYPES = [
  { value: "restaurant", label: "Restaurants" },
  { value: "cafe", label: "Cafes & Coffee" },
  { value: "bar", label: "Bars & Pubs" },
  { value: "bakery", label: "Bakeries" },
  { value: "store", label: "Retail Stores" },
  { value: "shopping_mall", label: "Shopping" },
  { value: "gym", label: "Gyms & Fitness" },
  { value: "spa", label: "Spas & Wellness" },
  { value: "hair_care", label: "Hair & Beauty" },
  { value: "lodging", label: "Hotels & Lodging" },
  { value: "tourist_attraction", label: "Attractions" },
  { value: "park", label: "Parks & Recreation" },
  { value: "museum", label: "Museums" },
  { value: "art_gallery", label: "Art Galleries" },
  { value: "night_club", label: "Nightlife" },
  { value: "movie_theater", label: "Entertainment" },
  { value: "doctor", label: "Healthcare" },
  { value: "dentist", label: "Dental" },
  { value: "veterinary_care", label: "Pet Services" },
  { value: "car_repair", label: "Auto Services" },
  { value: "real_estate_agency", label: "Real Estate" },
  { value: "lawyer", label: "Legal Services" },
  { value: "accounting", label: "Financial Services" },
] as const;

export type PlaceType = (typeof PLACE_TYPES)[number]["value"];

// ============================================================================
// Google Places API Response Types
// ============================================================================

export interface GooglePlacePhoto {
  name: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: Array<{
    displayName: string;
    uri: string;
    photoUri: string;
  }>;
}

export interface GooglePlaceOpeningHoursPeriod {
  open: {
    day: number;
    hour: number;
    minute: number;
  };
  close?: {
    day: number;
    hour: number;
    minute: number;
  };
}

export interface GooglePlaceOpeningHours {
  openNow?: boolean;
  weekdayDescriptions?: string[];
  periods?: GooglePlaceOpeningHoursPeriod[];
}

export interface GooglePlaceLocation {
  latitude: number;
  longitude: number;
}

export interface GooglePlace {
  id: string;
  displayName?: {
    text: string;
    languageCode?: string;
  };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: GooglePlaceLocation;
  types?: string[];
  primaryType?: string;
  primaryTypeDisplayName?: {
    text: string;
    languageCode?: string;
  };
  photos?: GooglePlacePhoto[];
  regularOpeningHours?: GooglePlaceOpeningHours;
  rating?: number;
  userRatingCount?: number;
  priceLevel?:
    | "PRICE_LEVEL_FREE"
    | "PRICE_LEVEL_INEXPENSIVE"
    | "PRICE_LEVEL_MODERATE"
    | "PRICE_LEVEL_EXPENSIVE"
    | "PRICE_LEVEL_VERY_EXPENSIVE";
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  googleMapsUri?: string;
  businessStatus?:
    | "OPERATIONAL"
    | "CLOSED_TEMPORARILY"
    | "CLOSED_PERMANENTLY";
}

export interface GooglePlacesSearchResponse {
  places?: GooglePlace[];
  nextPageToken?: string;
}

export interface GooglePlaceDetailsResponse extends GooglePlace {}

// ============================================================================
// Formatted Place Type (for UI consumption)
// ============================================================================

export interface FormattedPlace {
  id: string;
  googlePlaceId: string;
  name: string;
  address: string;
  shortAddress?: string;
  latitude?: number;
  longitude?: number;
  types: string[];
  primaryType?: string;
  primaryTypeDisplay?: string;
  photoUrl?: string;
  photos: string[];
  hours: BusinessHours[];
  hoursDescriptions?: string[];
  rating?: number;
  reviewCount?: number;
  priceLevel?: string;
  website?: string;
  phone?: string;
  googleMapsUrl?: string;
  isOpen?: boolean;
  businessStatus?: string;
  rawData: GooglePlace;
}

// ============================================================================
// API Configuration
// ============================================================================

const GOOGLE_PLACES_API_BASE = "https://places.googleapis.com/v1";

function getApiKey(): string {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_PLACES_API_KEY environment variable is not set. " +
        "Get one from https://console.cloud.google.com/apis/credentials"
    );
  }
  return apiKey;
}

// Fields to request from the API (controls billing)
const SEARCH_FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.shortFormattedAddress",
  "places.location",
  "places.types",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.photos",
  "places.regularOpeningHours",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.googleMapsUri",
  "places.businessStatus",
  "nextPageToken",
].join(",");

const DETAILS_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "shortFormattedAddress",
  "location",
  "types",
  "primaryType",
  "primaryTypeDisplayName",
  "photos",
  "regularOpeningHours",
  "rating",
  "userRatingCount",
  "priceLevel",
  "websiteUri",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "googleMapsUri",
  "businessStatus",
].join(",");

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build a photo URL from the Google Places photo resource name
 * Uses a proxy endpoint for admin import since Google Places API photos
 * require server-side authentication and don't work with direct browser requests.
 * https://developers.google.com/maps/documentation/places/web-service/place-photos
 */
export function buildPhotoUrl(
  photoName: string,
  maxWidth: number = 400,
  maxHeight: number = 300
): string {
  // Use the proxy endpoint which handles authentication server-side
  return `/api/admin/google-places/photo?name=${encodeURIComponent(photoName)}&maxWidth=${maxWidth}&maxHeight=${maxHeight}`;
}

/**
 * Parse Google Places opening hours into BusinessHours[] format
 */
export function parseOpeningHours(
  regularOpeningHours?: GooglePlaceOpeningHours
): BusinessHours[] {
  if (!regularOpeningHours?.periods) {
    return [];
  }

  const hours: BusinessHours[] = [];

  for (const period of regularOpeningHours.periods) {
    // Skip if no close time (24 hours - handle separately)
    if (!period.close) {
      // 24-hour operation for this day
      hours.push({
        day: period.open.day,
        open: "00:00",
        close: "23:59",
      });
      continue;
    }

    const openTime = `${period.open.hour.toString().padStart(2, "0")}:${period.open.minute.toString().padStart(2, "0")}`;
    const closeTime = `${period.close.hour.toString().padStart(2, "0")}:${period.close.minute.toString().padStart(2, "0")}`;

    hours.push({
      day: period.open.day,
      open: openTime,
      close: closeTime,
    });
  }

  // Sort by day
  return hours.sort((a, b) => a.day - b.day);
}

/**
 * Convert price level enum to readable string
 */
function formatPriceLevel(
  priceLevel?: GooglePlace["priceLevel"]
): string | undefined {
  if (!priceLevel) return undefined;

  const levels: Record<string, string> = {
    PRICE_LEVEL_FREE: "Free",
    PRICE_LEVEL_INEXPENSIVE: "$",
    PRICE_LEVEL_MODERATE: "$$",
    PRICE_LEVEL_EXPENSIVE: "$$$",
    PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
  };

  return levels[priceLevel];
}

/**
 * Format a Google Place into a cleaner structure for UI consumption
 */
export function formatPlace(place: GooglePlace): FormattedPlace {
  const photos =
    place.photos?.map((photo) => buildPhotoUrl(photo.name)) ?? [];

  return {
    id: place.id,
    googlePlaceId: place.id,
    name: place.displayName?.text ?? "Unknown",
    address: place.formattedAddress ?? "",
    shortAddress: place.shortFormattedAddress,
    latitude: place.location?.latitude,
    longitude: place.location?.longitude,
    types: place.types ?? [],
    primaryType: place.primaryType,
    primaryTypeDisplay: place.primaryTypeDisplayName?.text,
    photoUrl: photos[0],
    photos,
    hours: parseOpeningHours(place.regularOpeningHours),
    hoursDescriptions: place.regularOpeningHours?.weekdayDescriptions,
    rating: place.rating,
    reviewCount: place.userRatingCount,
    priceLevel: formatPriceLevel(place.priceLevel),
    website: place.websiteUri,
    phone: place.nationalPhoneNumber,
    googleMapsUrl: place.googleMapsUri,
    isOpen: place.regularOpeningHours?.openNow,
    businessStatus: place.businessStatus,
    rawData: place,
  };
}

// ============================================================================
// API Functions
// ============================================================================

export interface SearchPlacesOptions {
  query: string;
  type?: PlaceType;
  radius?: number; // in meters, default 10000 (10km)
  pageToken?: string;
  maxResults?: number; // default 20, max 20
}

export interface BulkSearchOptions {
  query: string;
  type?: PlaceType;
  radius?: number;
  minRating?: number;
  minReviews?: number;
  maxResults?: number;
}

export interface SearchPlacesResult {
  places: FormattedPlace[];
  nextPageToken?: string;
}

/**
 * Search for places using Google Places API (New) Text Search
 * https://developers.google.com/maps/documentation/places/web-service/text-search
 */
export async function searchPlaces(
  options: SearchPlacesOptions
): Promise<SearchPlacesResult> {
  const apiKey = getApiKey();
  const {
    query,
    type,
    radius = 10000,
    pageToken,
    maxResults = 20,
  } = options;

  const url = `${GOOGLE_PLACES_API_BASE}/places:searchText`;

  const requestBody: Record<string, unknown> = {
    textQuery: type ? `${query} ${type}` : query,
    locationBias: {
      circle: {
        center: FREDERICTON_CENTER,
        radius,
      },
    },
    maxResultCount: Math.min(maxResults, 20),
    languageCode: "en",
    regionCode: "CA",
  };

  // Include specific type if provided
  if (type) {
    requestBody.includedType = type;
  }

  // Add page token for pagination
  if (pageToken) {
    requestBody.pageToken = pageToken;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": SEARCH_FIELDS,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Places API error: ${response.status} - ${errorText}`
    );
  }

  const data = (await response.json()) as GooglePlacesSearchResponse;

  return {
    places: (data.places ?? []).map(formatPlace),
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Get detailed information about a specific place
 * https://developers.google.com/maps/documentation/places/web-service/place-details
 */
export async function getPlaceDetails(
  placeId: string
): Promise<FormattedPlace> {
  const apiKey = getApiKey();
  const url = `${GOOGLE_PLACES_API_BASE}/places/${placeId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": DETAILS_FIELDS,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Places API error: ${response.status} - ${errorText}`
    );
  }

  const data = (await response.json()) as GooglePlaceDetailsResponse;

  return formatPlace(data);
}

/**
 * Search for popular places with quality filtering
 * Uses rankPreference: RELEVANCE and filters by rating/reviews
 * https://developers.google.com/maps/documentation/places/web-service/text-search
 */
export async function searchPlacesByPopularity(
  options: BulkSearchOptions
): Promise<SearchPlacesResult> {
  const apiKey = getApiKey();
  const {
    query,
    type,
    radius = 15000, // 15km default for bulk import
    minRating = 4.0,
    minReviews = 10,
    maxResults = 20,
  } = options;

  const url = `${GOOGLE_PLACES_API_BASE}/places:searchText`;

  const requestBody: Record<string, unknown> = {
    textQuery: `${query} Fredericton NB`,
    locationBias: {
      circle: {
        center: FREDERICTON_CENTER,
        radius,
      },
    },
    rankPreference: "RELEVANCE",
    maxResultCount: Math.min(maxResults, 20),
    languageCode: "en",
    regionCode: "CA",
  };

  // Include specific type if provided
  if (type) {
    requestBody.includedType = type;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": SEARCH_FIELDS,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Places API error: ${response.status} - ${errorText}`
    );
  }

  const data = (await response.json()) as GooglePlacesSearchResponse;

  // Format places and filter by quality criteria
  const allPlaces = (data.places ?? []).map(formatPlace);

  const filteredPlaces = allPlaces.filter((place) => {
    const hasMinRating = place.rating !== undefined && place.rating >= minRating;
    const hasMinReviews = place.reviewCount !== undefined && place.reviewCount >= minReviews;
    return hasMinRating && hasMinReviews;
  });

  return {
    places: filteredPlaces,
    nextPageToken: undefined, // Bulk import doesn't use pagination
  };
}
