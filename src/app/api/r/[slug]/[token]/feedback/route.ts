import { NextRequest, NextResponse } from "next/server";

import {
  findRequestByToken,
  submitFeedback,
} from "@/lib/services/review-collector";
import { getClientIp, rateLimit } from "@/lib/utils/rate-limit";
import {
  getReviewFeedbackEmailHtml,
  getReviewFeedbackEmailSubject,
  sendEmail,
} from "@/lib/email";

function getBaseUrl(req: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("host") ?? "freddybeach.com";
  return `${proto}://${host}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
) {
  const { slug, token } = await params;

  const ip = getClientIp(request.headers);
  const limit = rateLimit(`feedback:${token}:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a moment." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const message = String(body?.message ?? "").trim();
  if (message.length < 1 || message.length > 4000) {
    return NextResponse.json(
      { error: "Please write a few words (up to 4000 characters)." },
      { status: 400 }
    );
  }

  const found = await findRequestByToken(token);
  if (!found || found.business.slug !== slug) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rating = found.request.rating;
  if (rating == null) {
    return NextResponse.json(
      { error: "Please pick a star rating before sending feedback." },
      { status: 400 }
    );
  }

  await submitFeedback({
    requestId: found.request.id,
    businessId: found.business.id,
    rating,
    message,
  });

  const recipient =
    found.settings?.notificationEmail ?? null;

  if (recipient) {
    try {
      const baseUrl = getBaseUrl(request);
      await sendEmail({
        to: recipient,
        subject: getReviewFeedbackEmailSubject({
          customerName: found.request.customerName,
          rating,
        }),
        html: getReviewFeedbackEmailHtml({
          businessName: found.business.name,
          customerName: found.request.customerName,
          rating,
          message,
          dashboardUrl: `${baseUrl}/ai-tools/review-collector/feedback?businessId=${encodeURIComponent(found.business.id)}`,
        }),
      });
    } catch (emailError) {
      // Don't fail the customer's submission if owner notification breaks.
      console.error("Failed to send feedback notification:", emailError);
    }
  }

  return NextResponse.json({ success: true });
}
