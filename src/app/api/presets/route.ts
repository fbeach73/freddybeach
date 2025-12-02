import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { preset, type PresetSettings } from "@/lib/schema";
import { nanoid } from "nanoid";
import type { CreatePresetInput } from "@/lib/types/image-generation";

const VALID_RESOLUTIONS = ["1K", "2K", "4K"];
const VALID_ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"];

/**
 * GET /api/presets
 * List user's presets
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const presets = await db
      .select()
      .from(preset)
      .where(eq(preset.userId, session.user.id))
      .orderBy(desc(preset.createdAt));

    return NextResponse.json({
      presets: presets.map((p) => ({
        id: p.id,
        name: p.name,
        settings: p.settings,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching presets:", error);
    return NextResponse.json(
      { error: "Failed to fetch presets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/presets
 * Create a new preset
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreatePresetInput = await request.json();
    const { name, settings } = body;

    // Validate name
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Validate settings
    if (!settings) {
      return NextResponse.json(
        { error: "Settings are required" },
        { status: 400 }
      );
    }

    if (!VALID_RESOLUTIONS.includes(settings.resolution)) {
      return NextResponse.json(
        { error: "Invalid resolution" },
        { status: 400 }
      );
    }

    if (!VALID_ASPECT_RATIOS.includes(settings.aspectRatio)) {
      return NextResponse.json(
        { error: "Invalid aspect ratio" },
        { status: 400 }
      );
    }

    if (
      typeof settings.imageCount !== "number" ||
      settings.imageCount < 1 ||
      settings.imageCount > 4
    ) {
      return NextResponse.json(
        { error: "Image count must be between 1 and 4" },
        { status: 400 }
      );
    }

    // Build preset settings
    const presetSettings: PresetSettings = {
      resolution: settings.resolution,
      aspectRatio: settings.aspectRatio,
      imageCount: settings.imageCount,
      style: settings.style,
      negativePrompt: settings.negativePrompt,
    };

    // Create preset
    const [newPreset] = await db
      .insert(preset)
      .values({
        id: nanoid(),
        userId: session.user.id,
        name: name.trim(),
        settings: presetSettings,
      })
      .returning();

    return NextResponse.json({
      success: true,
      preset: {
        id: newPreset.id,
        name: newPreset.name,
        settings: newPreset.settings,
        createdAt: newPreset.createdAt,
        updatedAt: newPreset.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating preset:", error);
    return NextResponse.json(
      { error: "Failed to create preset" },
      { status: 500 }
    );
  }
}
