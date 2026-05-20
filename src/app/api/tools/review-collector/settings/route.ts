import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq, or } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { hasToolAccess } from "@/lib/auth/tool-access";
import { getSettings, upsertSettings } from "@/lib/services/review-collector";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const URL_RE = /^https?:\/\/.+/i;

async function authorize(userId: string, businessId: string) {
  const [biz] = await db
    .select({ id: business.id, slug: business.slug, name: business.name })
    .from(business)
    .where(
      and(
        eq(business.id, businessId),
        or(eq(business.ownerId, userId), eq(business.submittedById, userId))
      )
    )
    .limit(1);

  if (!biz) return null;

  const access = await hasToolAccess(biz.id, "review-collector");
  if (!access.allowed) return null;
  return biz;
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businessId = new URL(request.url).searchParams.get("businessId");
  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const biz = await authorize(session.user.id, businessId);
  if (!biz) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await getSettings(biz.id);
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    businessId,
    googleReviewUrl,
    brandColor,
    logoUrl,
    senderName,
    senderSignature,
    notificationEmail,
  } = body as {
    businessId?: string;
    googleReviewUrl?: string | null;
    brandColor?: string | null;
    logoUrl?: string | null;
    senderName?: string | null;
    senderSignature?: string | null;
    notificationEmail?: string | null;
  };

  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const biz = await authorize(session.user.id, businessId);
  if (!biz) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (googleReviewUrl && !URL_RE.test(googleReviewUrl)) {
    return NextResponse.json(
      { error: "Google review URL must start with http(s)://" },
      { status: 400 }
    );
  }
  if (brandColor && !HEX_RE.test(brandColor)) {
    return NextResponse.json(
      { error: "Brand color must be a 6-digit hex like #0F766E" },
      { status: 400 }
    );
  }
  if (logoUrl && !URL_RE.test(logoUrl)) {
    return NextResponse.json(
      { error: "Logo URL must start with http(s)://" },
      { status: 400 }
    );
  }
  if (notificationEmail && !EMAIL_RE.test(notificationEmail)) {
    return NextResponse.json(
      { error: "Notification email is invalid" },
      { status: 400 }
    );
  }

  const settings = await upsertSettings({
    businessId: biz.id,
    googleReviewUrl: googleReviewUrl?.trim() || null,
    brandColor: brandColor?.trim() || null,
    logoUrl: logoUrl?.trim() || null,
    senderName: senderName?.trim() || null,
    senderSignature: senderSignature?.trim() || null,
    notificationEmail: notificationEmail?.trim().toLowerCase() || null,
  });

  return NextResponse.json({ success: true, settings });
}
