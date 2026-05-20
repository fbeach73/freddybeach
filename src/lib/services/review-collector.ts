import "server-only";

import crypto from "node:crypto";
import { nanoid } from "nanoid";
import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  business,
  businessReviewSettings,
  reviewFeedback,
  reviewRequest,
} from "@/lib/schema";

export type ReviewRequestStatus = "sent" | "opened" | "submitted" | "expired";

export interface CreateReviewRequestInput {
  businessId: string;
  customerName: string;
  customerEmail: string;
}

/**
 * 32-character base64url token, ~144 bits of entropy.
 * Used in public /r/[slug]/[token] URLs — must be unguessable.
 */
export function generateRequestToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export async function createReviewRequest(input: CreateReviewRequestInput) {
  const [created] = await db
    .insert(reviewRequest)
    .values({
      id: nanoid(),
      businessId: input.businessId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      token: generateRequestToken(),
      status: "sent",
    })
    .returning();

  return created;
}

/**
 * Look up a request by token. Joins the business so the public page can
 * render branding and resolve the slug.
 */
export async function findRequestByToken(token: string) {
  const [row] = await db
    .select({
      request: reviewRequest,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
      },
      settings: businessReviewSettings,
    })
    .from(reviewRequest)
    .innerJoin(business, eq(reviewRequest.businessId, business.id))
    .leftJoin(
      businessReviewSettings,
      eq(businessReviewSettings.businessId, business.id)
    )
    .where(eq(reviewRequest.token, token))
    .limit(1);

  return row ?? null;
}

/**
 * Mark a request as opened on first view. Only updates if still in 'sent'.
 */
export async function markRequestOpened(id: string) {
  await db
    .update(reviewRequest)
    .set({ status: "opened", openedAt: new Date() })
    .where(and(eq(reviewRequest.id, id), eq(reviewRequest.status, "sent")));
}

/**
 * Records a star rating against the request. Idempotent against status —
 * if already submitted, returns the existing row without overwriting.
 */
export async function recordRating(id: string, rating: number) {
  const [updated] = await db
    .update(reviewRequest)
    .set({
      status: "submitted",
      rating,
      submittedAt: new Date(),
    })
    .where(eq(reviewRequest.id, id))
    .returning();

  return updated;
}

export async function submitFeedback(input: {
  requestId: string;
  businessId: string;
  rating: number;
  message: string;
}) {
  const [created] = await db
    .insert(reviewFeedback)
    .values({
      id: nanoid(),
      requestId: input.requestId,
      businessId: input.businessId,
      rating: input.rating,
      message: input.message,
    })
    .returning();

  return created;
}

/**
 * Stamp the moment a customer was redirected to Google. Idempotent —
 * only sets if not previously set. Used for conversion-rate math.
 */
export async function markGoogleClicked(id: string) {
  await db
    .update(reviewRequest)
    .set({ googleClickedAt: new Date() })
    .where(
      and(
        eq(reviewRequest.id, id),
        sql`${reviewRequest.googleClickedAt} is null`
      )
    );
}

export async function getSettings(businessId: string) {
  const [row] = await db
    .select()
    .from(businessReviewSettings)
    .where(eq(businessReviewSettings.businessId, businessId))
    .limit(1);

  return row ?? null;
}

export interface UpsertSettingsInput {
  businessId: string;
  googleReviewUrl?: string | null;
  brandColor?: string | null;
  logoUrl?: string | null;
  senderName?: string | null;
  senderSignature?: string | null;
  notificationEmail?: string | null;
}

export async function upsertSettings(input: UpsertSettingsInput) {
  const { businessId, ...values } = input;
  const [row] = await db
    .insert(businessReviewSettings)
    .values({ businessId, ...values })
    .onConflictDoUpdate({
      target: businessReviewSettings.businessId,
      set: { ...values, updatedAt: new Date() },
    })
    .returning();

  return row;
}

/**
 * Aggregate stats for the dashboard home tile.
 */
export async function getStatsForBusiness(businessId: string) {
  const [agg] = await db
    .select({
      sent: sql<number>`count(*)::int`,
      opened: sql<number>`count(*) filter (where ${reviewRequest.openedAt} is not null)::int`,
      submitted: sql<number>`count(*) filter (where ${reviewRequest.status} = 'submitted')::int`,
      avgRating: sql<number | null>`avg(${reviewRequest.rating})::float`,
      privateCount: sql<number>`count(*) filter (where ${reviewRequest.rating} between 1 and 3)::int`,
      publicCount: sql<number>`count(*) filter (where ${reviewRequest.rating} between 4 and 5)::int`,
      googleClicks: sql<number>`count(*) filter (where ${reviewRequest.googleClickedAt} is not null)::int`,
    })
    .from(reviewRequest)
    .where(eq(reviewRequest.businessId, businessId));

  return (
    agg ?? {
      sent: 0,
      opened: 0,
      submitted: 0,
      avgRating: null,
      privateCount: 0,
      publicCount: 0,
      googleClicks: 0,
    }
  );
}

export async function listRecentRequests(businessId: string, limit = 25) {
  return db
    .select({
      id: reviewRequest.id,
      customerName: reviewRequest.customerName,
      customerEmail: reviewRequest.customerEmail,
      status: reviewRequest.status,
      rating: reviewRequest.rating,
      sentAt: reviewRequest.sentAt,
      openedAt: reviewRequest.openedAt,
      submittedAt: reviewRequest.submittedAt,
    })
    .from(reviewRequest)
    .where(eq(reviewRequest.businessId, businessId))
    .orderBy(desc(reviewRequest.sentAt))
    .limit(limit);
}

export async function listFeedbackForBusiness(businessId: string, limit = 50) {
  return db
    .select({
      id: reviewFeedback.id,
      requestId: reviewFeedback.requestId,
      rating: reviewFeedback.rating,
      message: reviewFeedback.message,
      submittedAt: reviewFeedback.submittedAt,
      customerName: reviewRequest.customerName,
      customerEmail: reviewRequest.customerEmail,
    })
    .from(reviewFeedback)
    .innerJoin(reviewRequest, eq(reviewFeedback.requestId, reviewRequest.id))
    .where(eq(reviewFeedback.businessId, businessId))
    .orderBy(desc(reviewFeedback.submittedAt))
    .limit(limit);
}
