import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generatedImage } from "@/lib/schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/generate/[id]/public
 * Toggle the public/private status of a generated image
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: imageId } = await params;

    // Parse and validate request body
    let body: { isPublic: boolean };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (typeof body.isPublic !== "boolean") {
      return NextResponse.json(
        { error: "isPublic must be a boolean" },
        { status: 400 }
      );
    }

    // Get the image and verify ownership
    const [image] = await db
      .select()
      .from(generatedImage)
      .where(
        and(
          eq(generatedImage.id, imageId),
          eq(generatedImage.userId, session.user.id)
        )
      );

    if (!image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    // Update the public status
    const [updated] = await db
      .update(generatedImage)
      .set({ isPublic: body.isPublic })
      .where(eq(generatedImage.id, imageId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: {
        id: updated.id,
        isPublic: updated.isPublic,
      },
    });
  } catch (error) {
    console.error("Error toggling image public status:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}
