import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userApiKey } from "@/lib/schema";
import { nanoid } from "nanoid";
import { encrypt, getKeyHint, isValidGoogleApiKey } from "@/lib/encryption";

/**
 * GET /api/user/api-key
 * Check if user has a stored API key (returns keyHint)
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [key] = await db
      .select({
        keyHint: userApiKey.keyHint,
        provider: userApiKey.provider,
        updatedAt: userApiKey.updatedAt,
      })
      .from(userApiKey)
      .where(
        and(
          eq(userApiKey.userId, session.user.id),
          eq(userApiKey.provider, "google")
        )
      );

    if (!key) {
      return NextResponse.json({
        hasKey: false,
        provider: "google",
      });
    }

    return NextResponse.json({
      hasKey: true,
      keyHint: key.keyHint,
      provider: key.provider,
      updatedAt: key.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching API key status:", error);
    return NextResponse.json(
      { error: "Failed to fetch API key status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/api-key
 * Encrypt and store a new API key
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { apiKey } = body;

    // Validate API key
    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    const trimmedKey = apiKey.trim();

    if (!isValidGoogleApiKey(trimmedKey)) {
      return NextResponse.json(
        {
          error:
            "Invalid Google API key format. Keys typically start with 'AIza' and are about 39 characters.",
        },
        { status: 400 }
      );
    }

    // Encrypt the key
    const encryptedData = encrypt(trimmedKey);

    if (!encryptedData) {
      return NextResponse.json(
        { error: "Failed to encrypt API key" },
        { status: 500 }
      );
    }

    const keyHintValue = getKeyHint(trimmedKey);

    // Check if user already has a key
    const [existing] = await db
      .select()
      .from(userApiKey)
      .where(
        and(
          eq(userApiKey.userId, session.user.id),
          eq(userApiKey.provider, "google")
        )
      );

    if (existing) {
      // Update existing key
      await db
        .update(userApiKey)
        .set({
          encryptedKey: encryptedData.encrypted,
          iv: encryptedData.iv,
          keyHint: keyHintValue,
        })
        .where(eq(userApiKey.id, existing.id));
    } else {
      // Create new key
      await db.insert(userApiKey).values({
        id: nanoid(),
        userId: session.user.id,
        provider: "google",
        encryptedKey: encryptedData.encrypted,
        iv: encryptedData.iv,
        keyHint: keyHintValue,
      });
    }

    return NextResponse.json({
      success: true,
      keyHint: keyHintValue,
    });
  } catch (error) {
    console.error("Error saving API key:", error);
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/api-key
 * Remove stored API key
 */
export async function DELETE() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db
      .delete(userApiKey)
      .where(
        and(
          eq(userApiKey.userId, session.user.id),
          eq(userApiKey.provider, "google")
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "No API key found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
