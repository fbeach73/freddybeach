import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  generation,
  generatedImage,
  generationHistory,
} from "@/lib/schema";
import { deleteGenerationImages } from "@/lib/services/blob-storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/generate/[id]
 * Retrieve a generation with its images and history
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the generation
    const [gen] = await db
      .select()
      .from(generation)
      .where(
        and(eq(generation.id, id), eq(generation.userId, session.user.id))
      );

    if (!gen) {
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 }
      );
    }

    // Get the images
    const images = await db
      .select()
      .from(generatedImage)
      .where(eq(generatedImage.generationId, id));

    // Get the history
    const history = await db
      .select()
      .from(generationHistory)
      .where(eq(generationHistory.generationId, id))
      .orderBy(generationHistory.createdAt);

    return NextResponse.json({
      generation: {
        id: gen.id,
        prompt: gen.prompt,
        status: gen.status,
        settings: gen.settings,
        usedAppKey: gen.usedAppKey,
        errorMessage: gen.errorMessage,
        createdAt: gen.createdAt,
        updatedAt: gen.updatedAt,
      },
      images: images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        isPublic: img.isPublic,
        width: img.width,
        height: img.height,
        createdAt: img.createdAt,
      })),
      history: history.map((h) => ({
        id: h.id,
        role: h.role,
        content: h.content,
        imageUrls: h.imageUrls,
        createdAt: h.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching generation:", error);
    return NextResponse.json(
      { error: "Failed to fetch generation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/generate/[id]
 * Delete a generation and its associated images
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the generation to verify ownership
    const [gen] = await db
      .select()
      .from(generation)
      .where(
        and(eq(generation.id, id), eq(generation.userId, session.user.id))
      );

    if (!gen) {
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 }
      );
    }

    // Get image URLs for blob deletion
    const images = await db
      .select({ imageUrl: generatedImage.imageUrl })
      .from(generatedImage)
      .where(eq(generatedImage.generationId, id));

    const imageUrls = images.map((img) => img.imageUrl);

    // Delete images from blob storage
    if (imageUrls.length > 0) {
      await deleteGenerationImages(imageUrls);
    }

    // Delete the generation (cascades to images and history)
    await db.delete(generation).where(eq(generation.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting generation:", error);
    return NextResponse.json(
      { error: "Failed to delete generation" },
      { status: 500 }
    );
  }
}
