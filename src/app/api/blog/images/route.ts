import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  uploadBlogImage,
  listBlogImages,
  validateImageFile,
} from "@/lib/services/blog-storage";

/**
 * GET /api/blog/images - List blog images with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const blogPostId = searchParams.get("blogPostId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await listBlogImages({
      search,
      blogPostId,
      limit: Math.min(limit, 100), // Cap at 100
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing blog images:", error);
    return NextResponse.json(
      { error: "Failed to list images" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/images - Upload a new blog image
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const altText = formData.get("altText") as string | null;
    const blogPostId = formData.get("blogPostId") as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!altText || altText.trim().length === 0) {
      return NextResponse.json(
        { error: "Alt text is required for accessibility" },
        { status: 400 }
      );
    }

    // Validate file type and size
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload the image
    const result = await uploadBlogImage({
      file,
      altText: altText.trim(),
      blogPostId: blogPostId || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to upload image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ image: result.image }, { status: 201 });
  } catch (error) {
    console.error("Error uploading blog image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
