import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { avatar } from "@/lib/schema";
import { deleteImage } from "@/lib/services/blob-storage";
import type { UpdateAvatarInput } from "@/lib/types/image-generation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/avatars/[id]
 * Get a single avatar
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [a] = await db
      .select()
      .from(avatar)
      .where(and(eq(avatar.id, id), eq(avatar.userId, session.user.id)));

    if (!a) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    return NextResponse.json({
      avatar: {
        id: a.id,
        name: a.name,
        type: a.type,
        imageUrl: a.imageUrl,
        description: a.description,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatar" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/avatars/[id]
 * Update avatar metadata (not the image)
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body: UpdateAvatarInput = await request.json();

    // Verify ownership
    const [existing] = await db
      .select()
      .from(avatar)
      .where(and(eq(avatar.id, id), eq(avatar.userId, session.user.id)));

    if (!existing) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    // Build update object
    const updateData: Partial<{
      name: string;
      type: "human" | "object";
      description: string | null;
    }> = {};

    if (body.name !== undefined) {
      if (body.name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.type !== undefined) {
      if (!["human", "object"].includes(body.type)) {
        return NextResponse.json(
          { error: "Type must be 'human' or 'object'" },
          { status: 400 }
        );
      }
      updateData.type = body.type;
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Update avatar
    const [updated] = await db
      .update(avatar)
      .set(updateData)
      .where(eq(avatar.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      avatar: {
        id: updated.id,
        name: updated.name,
        type: updated.type,
        imageUrl: updated.imageUrl,
        description: updated.description,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    return NextResponse.json(
      { error: "Failed to update avatar" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/avatars/[id]
 * Delete an avatar and its image
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get avatar to verify ownership and get image URL
    const [a] = await db
      .select()
      .from(avatar)
      .where(and(eq(avatar.id, id), eq(avatar.userId, session.user.id)));

    if (!a) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
    }

    // Delete image from blob storage
    await deleteImage(a.imageUrl);

    // Delete avatar record
    await db.delete(avatar).where(eq(avatar.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 }
    );
  }
}
