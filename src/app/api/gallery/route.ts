import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, desc, sql, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generatedImage, generation, user, imageLike } from "@/lib/schema";

/**
 * GET /api/gallery
 * List public images with pagination
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10))
    );
    const sort = searchParams.get("sort") || "recent"; // "recent" | "popular"

    const offset = (page - 1) * pageSize;

    // Get current user for "isLiked" status
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;

    // Build the query based on sort type
    let images;
    if (sort === "popular") {
      // Query with like count, sorted by popularity
      images = await db
        .select({
          id: generatedImage.id,
          imageUrl: generatedImage.imageUrl,
          width: generatedImage.width,
          height: generatedImage.height,
          createdAt: generatedImage.createdAt,
          generationId: generatedImage.generationId,
          prompt: generation.prompt,
          userId: generatedImage.userId,
          userName: user.name,
          userImage: user.image,
          likeCount: sql<number>`CAST(COUNT(DISTINCT ${imageLike.id}) AS INTEGER)`,
        })
        .from(generatedImage)
        .innerJoin(generation, eq(generatedImage.generationId, generation.id))
        .innerJoin(user, eq(generatedImage.userId, user.id))
        .leftJoin(imageLike, eq(generatedImage.id, imageLike.imageId))
        .where(eq(generatedImage.isPublic, true))
        .groupBy(
          generatedImage.id,
          generation.prompt,
          user.name,
          user.image
        )
        .orderBy(sql`COUNT(DISTINCT ${imageLike.id}) DESC`, desc(generatedImage.createdAt))
        .limit(pageSize)
        .offset(offset);
    } else {
      // Query sorted by creation date
      images = await db
        .select({
          id: generatedImage.id,
          imageUrl: generatedImage.imageUrl,
          width: generatedImage.width,
          height: generatedImage.height,
          createdAt: generatedImage.createdAt,
          generationId: generatedImage.generationId,
          prompt: generation.prompt,
          userId: generatedImage.userId,
          userName: user.name,
          userImage: user.image,
          likeCount: sql<number>`CAST(COUNT(DISTINCT ${imageLike.id}) AS INTEGER)`,
        })
        .from(generatedImage)
        .innerJoin(generation, eq(generatedImage.generationId, generation.id))
        .innerJoin(user, eq(generatedImage.userId, user.id))
        .leftJoin(imageLike, eq(generatedImage.id, imageLike.imageId))
        .where(eq(generatedImage.isPublic, true))
        .groupBy(
          generatedImage.id,
          generation.prompt,
          user.name,
          user.image
        )
        .orderBy(desc(generatedImage.createdAt))
        .limit(pageSize)
        .offset(offset);
    }

    // Get liked status for current user if logged in
    let userLikes: Set<string> = new Set();
    if (currentUserId && images.length > 0) {
      const imageIds = images.map((img) => img.id);
      const likes = await db
        .select({ imageId: imageLike.imageId })
        .from(imageLike)
        .where(
          and(
            eq(imageLike.userId, currentUserId),
            sql`${imageLike.imageId} IN (${sql.join(
              imageIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
        );
      userLikes = new Set(likes.map((l) => l.imageId));
    }

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(generatedImage)
      .where(eq(generatedImage.isPublic, true));

    const total = countResult?.count || 0;
    const hasMore = offset + images.length < total;

    return NextResponse.json({
      images: images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        width: img.width,
        height: img.height,
        createdAt: img.createdAt,
        prompt: img.prompt,
        userName: img.userName,
        userImage: img.userImage,
        likeCount: img.likeCount,
        isLiked: userLikes.has(img.id),
      })),
      total,
      page,
      pageSize,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}
