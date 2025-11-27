import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { review, business, user } from "@/lib/schema";
import { eq, and, desc, avg, count } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET - Fetch reviews for a business
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return NextResponse.json(
      { error: "Business ID is required" },
      { status: 400 }
    );
  }

  try {
    const reviews = await db
      .select({
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        ownerResponse: review.ownerResponse,
        ownerRespondedAt: review.ownerRespondedAt,
        createdAt: review.createdAt,
        userName: user.name,
        userImage: user.image,
      })
      .from(review)
      .innerJoin(user, eq(review.userId, user.id))
      .where(and(eq(review.businessId, businessId), eq(review.isApproved, true)))
      .orderBy(desc(review.createdAt));

    // Get aggregate stats
    const [stats] = await db
      .select({
        averageRating: avg(review.rating),
        totalReviews: count(review.id),
      })
      .from(review)
      .where(and(eq(review.businessId, businessId), eq(review.isApproved, true)));

    const formattedReviews = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      content: r.content,
      ownerResponse: r.ownerResponse,
      ownerRespondedAt: r.ownerRespondedAt,
      createdAt: r.createdAt,
      user: {
        name: r.userName,
        image: r.userImage,
      },
    }));

    return NextResponse.json({
      reviews: formattedReviews,
      averageRating: stats?.averageRating
        ? parseFloat(stats.averageRating.toString())
        : 0,
      totalReviews: stats?.totalReviews || 0,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Create a new review
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, rating, title, content } = body;

    // Validate input
    if (!businessId || !rating || !content) {
      return NextResponse.json(
        { error: "Business ID, rating, and content are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (content.trim().length < 10) {
      return NextResponse.json(
        { error: "Review must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Check if business exists
    const [existingBusiness] = await db
      .select({ id: business.id })
      .from(business)
      .where(eq(business.id, businessId));

    if (!existingBusiness) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Check if user already reviewed this business
    const [existingReview] = await db
      .select({ id: review.id })
      .from(review)
      .where(
        and(eq(review.businessId, businessId), eq(review.userId, session.user.id))
      );

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this business" },
        { status: 400 }
      );
    }

    // Create the review
    const reviewId = nanoid();
    const [newReview] = await db
      .insert(review)
      .values({
        id: reviewId,
        businessId,
        userId: session.user.id,
        rating,
        title: title?.trim() || null,
        content: content.trim(),
      })
      .returning();

    // Update business rating stats
    const [stats] = await db
      .select({
        averageRating: avg(review.rating),
        totalReviews: count(review.id),
      })
      .from(review)
      .where(and(eq(review.businessId, businessId), eq(review.isApproved, true)));

    await db
      .update(business)
      .set({
        rating: stats?.averageRating
          ? parseFloat(stats.averageRating.toString())
          : rating,
        reviewCount: stats?.totalReviews || 1,
      })
      .where(eq(business.id, businessId));

    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
