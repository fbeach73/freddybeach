import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq, or } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { hasToolAccess } from "@/lib/auth/tool-access";
import {
  createReviewRequest,
  getSettings,
} from "@/lib/services/review-collector";
import {
  getReviewRequestEmailHtml,
  getReviewRequestEmailSubject,
  sendEmail,
} from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getBaseUrl(req: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("host") ?? "freddybeach.com";
  return `${proto}://${host}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, customerName, customerEmail } = body as {
      businessId?: string;
      customerName?: string;
      customerEmail?: string;
    };

    if (!businessId || !customerName?.trim() || !customerEmail?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields: businessId, customerName, customerEmail" },
        { status: 400 }
      );
    }

    const trimmedEmail = customerEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Invalid customer email" },
        { status: 400 }
      );
    }

    const [biz] = await db
      .select({
        id: business.id,
        name: business.name,
        slug: business.slug,
        ownerId: business.ownerId,
        submittedById: business.submittedById,
      })
      .from(business)
      .where(
        and(
          eq(business.id, businessId),
          or(
            eq(business.ownerId, session.user.id),
            eq(business.submittedById, session.user.id)
          )
        )
      )
      .limit(1);

    if (!biz) {
      return NextResponse.json(
        { error: "Business not found or you do not have access" },
        { status: 404 }
      );
    }

    const access = await hasToolAccess(biz.id, "review-collector");
    if (!access.allowed) {
      return NextResponse.json(
        { error: "Review Collector is not unlocked for this business" },
        { status: 403 }
      );
    }

    const settings = await getSettings(biz.id);
    if (!settings?.googleReviewUrl) {
      return NextResponse.json(
        {
          error:
            "Add your Google review URL in Review Collector settings before sending requests.",
        },
        { status: 400 }
      );
    }

    const created = await createReviewRequest({
      businessId: biz.id,
      customerName: customerName.trim(),
      customerEmail: trimmedEmail,
    });

    const baseUrl = getBaseUrl(request);
    const reviewUrl = `${baseUrl}/r/${biz.slug}/${created.token}`;

    try {
      await sendEmail({
        to: trimmedEmail,
        subject: getReviewRequestEmailSubject(biz.name),
        html: getReviewRequestEmailHtml({
          customerName: customerName.trim(),
          businessName: biz.name,
          reviewUrl,
          brandColor: settings.brandColor,
          logoUrl: settings.logoUrl,
          senderName: settings.senderName,
          senderSignature: settings.senderSignature,
          businessSlug: biz.slug,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send review request email:", emailError);
      return NextResponse.json(
        { error: "Saved the request, but the email failed to send." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      request: {
        id: created.id,
        sentAt: created.sentAt,
        customerName: created.customerName,
      },
    });
  } catch (error) {
    console.error("Send review request error:", error);
    return NextResponse.json(
      { error: "Failed to send review request" },
      { status: 500 }
    );
  }
}
