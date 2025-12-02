import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  generation,
  generatedImage,
  generationHistory,
} from "@/lib/schema";
import { nanoid } from "nanoid";
import { generateWithUserKey } from "@/lib/gemini";
import { uploadGeneratedImage } from "@/lib/services/blob-storage";
import {
  canGenerateCount,
  incrementTokenUsage,
  hasOwnApiKey,
} from "@/lib/services/token-system";
import type {
  GenerateRequestBody,
  GenerationSettings,
} from "@/lib/types/image-generation";

/**
 * POST /api/generate
 * Generate images using AI
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GenerateRequestBody = await request.json();
    const { prompt, settings } = body;

    // Validate input
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!settings) {
      return NextResponse.json(
        { error: "Settings are required" },
        { status: 400 }
      );
    }

    // Validate settings
    const validResolutions = ["1K", "2K", "4K"];
    const validAspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"];

    if (!validResolutions.includes(settings.resolution)) {
      return NextResponse.json(
        { error: "Invalid resolution" },
        { status: 400 }
      );
    }

    if (!validAspectRatios.includes(settings.aspectRatio)) {
      return NextResponse.json(
        { error: "Invalid aspect ratio" },
        { status: 400 }
      );
    }

    const imageCount = settings.imageCount || 1;
    if (imageCount < 1 || imageCount > 4) {
      return NextResponse.json(
        { error: "Image count must be between 1 and 4" },
        { status: 400 }
      );
    }

    // Check token availability (skip if user has their own API key)
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

    // Create generation record
    const generationId = nanoid();
    const generationSettings: GenerationSettings = {
      resolution: settings.resolution,
      aspectRatio: settings.aspectRatio,
      imageCount,
      style: settings.style,
      negativePrompt: settings.negativePrompt,
      avatarIds: settings.avatarIds,
    };

    await db.insert(generation).values({
      id: generationId,
      userId: session.user.id,
      prompt: prompt.trim(),
      status: "processing",
      settings: generationSettings,
      usedAppKey: !userHasOwnKey,
    });

    // Generate images
    const result = await generateWithUserKey({
      prompt: prompt.trim(),
      userId: session.user.id,
      settings: generationSettings,
      avatarIds: settings.avatarIds,
    });

    if (!result.success || !result.images || result.images.length === 0) {
      // Update generation status to failed
      await db
        .update(generation)
        .set({
          status: "failed",
          errorMessage: result.error || "Generation failed",
        })
        .where(eq(generation.id, generationId));

      return NextResponse.json(
        { error: result.error || "Generation failed" },
        { status: 500 }
      );
    }

    // Upload images to blob storage and save to database
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
        i
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

    // Update generation status to completed
    await db
      .update(generation)
      .set({
        status: "completed",
        usedAppKey: result.usedAppKey,
      })
      .where(eq(generation.id, generationId));

    // Add to generation history
    await db.insert(generationHistory).values({
      id: nanoid(),
      generationId,
      role: "user",
      content: prompt.trim(),
    });

    await db.insert(generationHistory).values({
      id: nanoid(),
      generationId,
      role: "assistant",
      content: `Generated ${savedImages.length} image(s)`,
      imageUrls: savedImages.map((img) => img.imageUrl),
    });

    // Increment token usage if using app key
    if (result.usedAppKey) {
      await incrementTokenUsage(session.user.id, savedImages.length);
    }

    return NextResponse.json({
      success: true,
      generationId,
      images: savedImages,
      usedAppKey: result.usedAppKey,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate images" },
      { status: 500 }
    );
  }
}
