import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const GOOGLE_PLACES_API_BASE = "https://places.googleapis.com/v1";

/**
 * Proxy endpoint for Google Places photos
 * This is needed because Google Places API (New) photo URLs require
 * server-side authentication and don't work with direct browser requests.
 *
 * Usage: /api/admin/google-places/photo?name={photoResourceName}&maxWidth={width}&maxHeight={height}
 */
export async function GET(request: NextRequest) {
  // Check authentication
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const photoName = searchParams.get("name");
  const maxWidth = searchParams.get("maxWidth") || "400";
  const maxHeight = searchParams.get("maxHeight") || "300";

  if (!photoName) {
    return NextResponse.json({ error: "Missing photo name parameter" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Google Places API key not configured" }, { status: 500 });
  }

  try {
    // Fetch the photo from Google Places API
    const photoUrl = `${GOOGLE_PLACES_API_BASE}/${photoName}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}`;

    const response = await fetch(photoUrl, {
      headers: {
        "X-Goog-Api-Key": apiKey,
      },
      // Follow redirects to get the actual image
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`Google Places photo error: ${response.status}`);
      return NextResponse.json(
        { error: "Failed to fetch photo" },
        { status: response.status }
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Photo proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch photo" },
      { status: 500 }
    );
  }
}
