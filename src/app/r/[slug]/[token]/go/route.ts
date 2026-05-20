import { NextRequest, NextResponse } from "next/server";

import {
  findRequestByToken,
  markGoogleClicked,
} from "@/lib/services/review-collector";

/**
 * Click-tracking redirect. Records the Google click-through and 302s to the
 * business's configured review URL. Falls back to a sensible Google URL if
 * settings are missing so the customer never hits a dead link.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
) {
  const { slug, token } = await params;
  const found = await findRequestByToken(token);

  if (!found || found.business.slug !== slug) {
    return new NextResponse("Not found", { status: 404 });
  }

  const dest =
    found.settings?.googleReviewUrl ||
    `https://www.google.com/search?q=${encodeURIComponent(found.business.name + " Fredericton review")}`;

  // Best-effort tracking — don't block the redirect.
  void markGoogleClicked(found.request.id);

  return NextResponse.redirect(dest, { status: 302 });
}
