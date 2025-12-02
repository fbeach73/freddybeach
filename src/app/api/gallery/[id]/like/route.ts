import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generatedImage, imageLike } from "@/lib/schema";
import { nanoid } from "nanoid";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/gallery/[id]/like
 * Like a public image
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: imageId } = await params;

    // Verify image exists and is public
    const [image] = await db
      .select()
      .from(generatedImage)
      .where(and(eq(generatedImage.id, imageId), eq(generatedImage.isPublic, true)));

    if (!image) {
      return NextResponse.json(
        { error: "Image not found or not public" },
        { status: 404 }
      );
    }

    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(imageLike)
      .where(
        and(
          eq(imageLike.imageId, imageId),
          eq(imageLike.userId, session.user.id)
        )
      );

    if (existingLike) {
      return NextResponse.json(
        { error: "Already liked this image" },
        { status: 400 }
      );
    }

    // Create like
    await db.insert(imageLike).values({
      id: nanoid(),
      imageId,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true, liked: true });
  } catch (error) {
    console.error("Error liking image:", error);
    return NextResponse.json(
      { error: "Failed to like image" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gallery/[id]/like
 * Unlike a public image
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: imageId } = await params;

    // Delete like if exists
    const result = await db
      .delete(imageLike)
      .where(
        and(
          eq(imageLike.imageId, imageId),
          eq(imageLike.userId, session.user.id)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Like not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, liked: false });
  } catch (error) {
    console.error("Error unliking image:", error);
    return NextResponse.json(
      { error: "Failed to unlike image" },
      { status: 500 }
    );
  }
}
