import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { avatar } from "@/lib/schema";
import { nanoid } from "nanoid";
import { uploadAvatarImage } from "@/lib/services/blob-storage";
import type { CreateAvatarInput } from "@/lib/types/image-generation";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * GET /api/avatars
 * List user's avatars
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const avatars = await db
      .select()
      .from(avatar)
      .where(eq(avatar.userId, session.user.id))
      .orderBy(desc(avatar.createdAt));

    return NextResponse.json({
      avatars: avatars.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        imageUrl: a.imageUrl,
        description: a.description,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching avatars:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatars" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/avatars
 * Create a new avatar with file upload
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string | null;
    const type = formData.get("type") as string | null;
    const description = formData.get("description") as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!type || !["human", "object"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'human' or 'object'" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        { error: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    // Generate avatar ID
    const avatarId = nanoid();

    // Upload image to blob storage
    const fileBuffer = await file.arrayBuffer();
    const imageUrl = await uploadAvatarImage(
      fileBuffer,
      file.type,
      session.user.id,
      avatarId
    );

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Create avatar record
    const [newAvatar] = await db
      .insert(avatar)
      .values({
        id: avatarId,
        userId: session.user.id,
        name: name.trim(),
        type: type as "human" | "object",
        imageUrl,
        description: description?.trim() || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      avatar: {
        id: newAvatar.id,
        name: newAvatar.name,
        type: newAvatar.type,
        imageUrl: newAvatar.imageUrl,
        description: newAvatar.description,
        createdAt: newAvatar.createdAt,
        updatedAt: newAvatar.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating avatar:", error);
    return NextResponse.json(
      { error: "Failed to create avatar" },
      { status: 500 }
    );
  }
}
