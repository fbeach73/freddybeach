import { NextRequest, NextResponse } from "next/server";

import {
  findRequestByToken,
  recordRating,
} from "@/lib/services/review-collector";
import { getClientIp, rateLimit } from "@/lib/utils/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
) {
  const { slug, token } = await params;

  const ip = getClientIp(request.headers);
  const limit = rateLimit(`rate:${token}:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a moment." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const rating = Number(body?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be an integer between 1 and 5." },
      { status: 400 }
    );
  }

  const found = await findRequestByToken(token);
  if (!found || found.business.slug !== slug) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If they already rated, just respect the original rating to keep the
  // routing decision stable and avoid duplicate downstream events.
  const effectiveRating = found.request.rating ?? rating;
  if (found.request.rating == null) {
    await recordRating(found.request.id, rating);
  }

  const next = effectiveRating >= 4 ? "google" : "feedback";
  const googleUrl = found.settings?.googleReviewUrl
    ? `/r/${slug}/${token}/go`
    : null;

  return NextResponse.json({
    next,
    rating: effectiveRating,
    googleUrl,
    feedbackUrl: `/r/${slug}/${token}/feedback`,
  });
}
