import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { preset, type PresetSettings } from "@/lib/schema";
import type { UpdatePresetInput } from "@/lib/types/image-generation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_RESOLUTIONS = ["1K", "2K", "4K"];
const VALID_ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"];

/**
 * GET /api/presets/[id]
 * Get a single preset
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [p] = await db
      .select()
      .from(preset)
      .where(and(eq(preset.id, id), eq(preset.userId, session.user.id)));

    if (!p) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    return NextResponse.json({
      preset: {
        id: p.id,
        name: p.name,
        settings: p.settings,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching preset:", error);
    return NextResponse.json(
      { error: "Failed to fetch preset" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/presets/[id]
 * Update a preset
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body: UpdatePresetInput = await request.json();

    // Verify ownership
    const [existing] = await db
      .select()
      .from(preset)
      .where(and(eq(preset.id, id), eq(preset.userId, session.user.id)));

    if (!existing) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    // Build update object
    const updateData: Partial<{ name: string; settings: PresetSettings }> = {};

    if (body.name !== undefined) {
      if (body.name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.settings !== undefined) {
      // Validate settings
      if (!VALID_RESOLUTIONS.includes(body.settings.resolution)) {
        return NextResponse.json(
          { error: "Invalid resolution" },
          { status: 400 }
        );
      }

      if (!VALID_ASPECT_RATIOS.includes(body.settings.aspectRatio)) {
        return NextResponse.json(
          { error: "Invalid aspect ratio" },
          { status: 400 }
        );
      }

      if (
        typeof body.settings.imageCount !== "number" ||
        body.settings.imageCount < 1 ||
        body.settings.imageCount > 4
      ) {
        return NextResponse.json(
          { error: "Image count must be between 1 and 4" },
          { status: 400 }
        );
      }

      updateData.settings = {
        resolution: body.settings.resolution,
        aspectRatio: body.settings.aspectRatio,
        imageCount: body.settings.imageCount,
        style: body.settings.style,
        negativePrompt: body.settings.negativePrompt,
      };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Update preset
    const [updated] = await db
      .update(preset)
      .set(updateData)
      .where(eq(preset.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      preset: {
        id: updated.id,
        name: updated.name,
        settings: updated.settings,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating preset:", error);
    return NextResponse.json(
      { error: "Failed to update preset" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/presets/[id]
 * Delete a preset
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(preset)
      .where(and(eq(preset.id, id), eq(preset.userId, session.user.id)));

    if (!existing) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    }

    // Delete preset
    await db.delete(preset).where(eq(preset.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting preset:", error);
    return NextResponse.json(
      { error: "Failed to delete preset" },
      { status: 500 }
    );
  }
}
