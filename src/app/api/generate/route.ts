import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, desc, sql } from "drizzle-orm";
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
import {
  VALID_RESOLUTIONS,
  VALID_ASPECT_RATIOS,
} from "@/lib/constants/validation";
import type {
  GenerateRequestBody,
  GenerationSettings,
} from "@/lib/types/image-generation";

/**
 * GET /api/generate
 * List user's generations with pagination
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
    const offset = (page - 1) * pageSize;

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(generation)
      .where(eq(generation.userId, session.user.id));

    const total = countResult?.count || 0;

    // Get paginated generations with first image as thumbnail
    const generations = await db
      .select({
        id: generation.id,
        prompt: generation.prompt,
        status: generation.status,
        createdAt: generation.createdAt,
      })
      .from(generation)
      .where(eq(generation.userId, session.user.id))
      .orderBy(desc(generation.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Get image counts and thumbnails for each generation
    const generationsWithDetails = await Promise.all(
      generations.map(async (gen) => {
        const images = await db
          .select({ imageUrl: generatedImage.imageUrl })
          .from(generatedImage)
          .where(eq(generatedImage.generationId, gen.id))
          .limit(1);

        const [countResult] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(generatedImage)
          .where(eq(generatedImage.generationId, gen.id));

        return {
          ...gen,
          imageCount: countResult?.count || 0,
          thumbnailUrl: images[0]?.imageUrl || null,
        };
      })
    );

    return NextResponse.json({
      generations: generationsWithDetails,
      total,
      page,
      pageSize,
      hasMore: offset + generations.length < total,
    });
  } catch (error) {
    console.error("Error fetching generations:", error);
    return NextResponse.json(
      { error: "Failed to fetch generations" },
      { status: 500 }
    );
  }
}

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

    // Parse and validate JSON body
    let body: GenerateRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
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
    if (!VALID_RESOLUTIONS.includes(settings.resolution as typeof VALID_RESOLUTIONS[number])) {
      return NextResponse.json(
        { error: "Invalid resolution" },
        { status: 400 }
      );
    }

    if (!VALID_ASPECT_RATIOS.includes(settings.aspectRatio as typeof VALID_ASPECT_RATIOS[number])) {
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

      if (!imageUrl) {
        console.error(`Failed to upload image ${i + 1} for generation ${generationId}`);
        // Update generation status to failed
        await db
          .update(generation)
          .set({
            status: "failed",
            errorMessage: `Failed to upload image ${i + 1}`,
          })
          .where(eq(generation.id, generationId));

        return NextResponse.json(
          { error: `Failed to upload image ${i + 1}` },
          { status: 500 }
        );
      }

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
