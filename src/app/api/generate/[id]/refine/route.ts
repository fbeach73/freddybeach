import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  generation,
  generatedImage,
  generationHistory,
  type GenerationSettings,
} from "@/lib/schema";
import { nanoid } from "nanoid";
import { refineGeneration } from "@/lib/gemini";
import { uploadGeneratedImage } from "@/lib/services/blob-storage";
import {
  canGenerateCount,
  incrementTokenUsage,
  hasOwnApiKey,
} from "@/lib/services/token-system";
import type { RefineRequestBody } from "@/lib/types/image-generation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/generate/[id]/refine
 * Refine a generation with additional instructions
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: generationId } = await params;
    const body: RefineRequestBody = await request.json();
    const { instruction, imageId } = body;

    // Validate input
    if (
      !instruction ||
      typeof instruction !== "string" ||
      instruction.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Instruction is required" },
        { status: 400 }
      );
    }

    // Get the generation to verify ownership and get settings
    const [gen] = await db
      .select()
      .from(generation)
      .where(
        and(
          eq(generation.id, generationId),
          eq(generation.userId, session.user.id)
        )
      );

    if (!gen) {
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 }
      );
    }

    if (gen.status !== "completed") {
      return NextResponse.json(
        { error: "Can only refine completed generations" },
        { status: 400 }
      );
    }

    // If imageId is provided, verify it belongs to this generation
    if (imageId) {
      const [img] = await db
        .select()
        .from(generatedImage)
        .where(
          and(
            eq(generatedImage.id, imageId),
            eq(generatedImage.generationId, generationId)
          )
        );

      if (!img) {
        return NextResponse.json(
          { error: "Image not found in this generation" },
          { status: 404 }
        );
      }
    }

    // Check token availability (skip if user has their own API key)
    const settings = gen.settings as GenerationSettings;
    const imageCount = settings.imageCount || 1;
    const userHasOwnKey = await hasOwnApiKey(session.user.id);

    if (!userHasOwnKey) {
      const canProceed = await canGenerateCount(session.user.id, imageCount);
      if (!canProceed) {
        return NextResponse.json(
          {
            error:
              "Token limit reached. Upgrade your plan or add your own API key.",
          },
          { status: 403 }
        );
      }
    }

    // Update generation status to processing
    await db
      .update(generation)
      .set({ status: "processing" })
      .where(eq(generation.id, generationId));

    // Add user instruction to history
    await db.insert(generationHistory).values({
      id: nanoid(),
      generationId,
      role: "user",
      content: instruction.trim(),
    });

    // Refine the generation
    const result = await refineGeneration(generationId, instruction.trim(), imageId, {
      userId: session.user.id,
      originalPrompt: gen.prompt,
      settings,
    });

    if (!result.success || !result.images || result.images.length === 0) {
      // Update generation status back to completed (failed refinement)
      await db
        .update(generation)
        .set({ status: "completed" })
        .where(eq(generation.id, generationId));

      // Add error to history
      await db.insert(generationHistory).values({
        id: nanoid(),
        generationId,
        role: "assistant",
        content: `Refinement failed: ${result.error || "Unknown error"}`,
      });

      return NextResponse.json(
        { error: result.error || "Refinement failed" },
        { status: 500 }
      );
    }

    // Upload refined images to blob storage and save to database
    const savedImages: Array<{
      id: string;
      imageUrl: string;
      width: number;
      height: number;
    }> = [];

    for (let i = 0; i < result.images.length; i++) {
      const img = result.images[i];
      const imageUrl = await uploadGeneratedImage(
        img.imageBytes,
        session.user.id,
        generationId,
        Date.now() + i // Unique index for refined images
      );

      if (imageUrl) {
        const imageId = nanoid();
        await db.insert(generatedImage).values({
          id: imageId,
          generationId,
          userId: session.user.id,
          imageUrl,
          width: img.width,
          height: img.height,
          isPublic: false,
        });

        savedImages.push({
          id: imageId,
          imageUrl,
          width: img.width,
          height: img.height,
        });
      }
    }

    // Update generation status back to completed
    await db
      .update(generation)
      .set({
        status: "completed",
        usedAppKey: result.usedAppKey,
      })
      .where(eq(generation.id, generationId));

    // Add refinement result to history
    await db.insert(generationHistory).values({
      id: nanoid(),
      generationId,
      role: "assistant",
      content: `Refined with ${savedImages.length} new image(s)`,
      imageUrls: savedImages.map((img) => img.imageUrl),
    });

    // Increment token usage if using app key
    if (result.usedAppKey) {
      await incrementTokenUsage(session.user.id, savedImages.length);
    }

    return NextResponse.json({
      success: true,
      images: savedImages,
      usedAppKey: result.usedAppKey,
    });
  } catch (error) {
    console.error("Refinement error:", error);
    return NextResponse.json(
      { error: "Failed to refine generation" },
      { status: 500 }
    );
  }
}
