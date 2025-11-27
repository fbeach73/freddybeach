import { db } from "@/lib/db";
import { review, user } from "@/lib/schema";
import { eq, and, desc, avg, count } from "drizzle-orm";

export interface ReviewWithUser {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  ownerResponse: string | null;
  ownerRespondedAt: Date | null;
  createdAt: Date;
  user: {
    name: string;
    image: string | null;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

/**
 * Get all approved reviews for a business
 */
export async function getReviewsForBusiness(
  businessId: string
): Promise<ReviewWithUser[]> {
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

  return reviews.map((r) => ({
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
}

/**
 * Get review stats for a business
 */
export async function getReviewStats(businessId: string): Promise<ReviewStats> {
  const [stats] = await db
    .select({
      averageRating: avg(review.rating),
      totalReviews: count(review.id),
    })
    .from(review)
    .where(and(eq(review.businessId, businessId), eq(review.isApproved, true)));

  return {
    averageRating: stats?.averageRating
      ? parseFloat(stats.averageRating.toString())
      : 0,
    totalReviews: stats?.totalReviews || 0,
  };
}

/**
 * Check if a user has already reviewed a business
 */
export async function hasUserReviewedBusiness(
  businessId: string,
  userId: string
): Promise<boolean> {
  const [existingReview] = await db
    .select({ id: review.id })
    .from(review)
    .where(and(eq(review.businessId, businessId), eq(review.userId, userId)));

  return !!existingReview;
}
