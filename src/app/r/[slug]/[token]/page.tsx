import { notFound } from "next/navigation";
import Image from "next/image";

import { PoweredByBadge } from "@/components/marketing/powered-by-badge";
import {
  findRequestByToken,
  markRequestOpened,
} from "@/lib/services/review-collector";
import { StarRatingClient } from "./star-rating-client";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PublicReviewPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const found = await findRequestByToken(token);

  if (!found || found.business.slug !== slug) {
    notFound();
  }

  // Best-effort open tracking. Don't block render on it.
  if (found.request.status === "sent") {
    void markRequestOpened(found.request.id);
  }

  const brandColor =
    found.settings?.brandColor && /^#[0-9a-fA-F]{6}$/.test(found.settings.brandColor)
      ? found.settings.brandColor
      : "#0F766E";
  // Route Google clicks through /go so we can track conversion server-side.
  const googleReviewUrl = found.settings?.googleReviewUrl
    ? `/r/${slug}/${token}/go`
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            {found.settings?.logoUrl ? (
              <Image
                src={found.settings.logoUrl}
                alt={found.business.name}
                width={240}
                height={60}
                className="mx-auto mb-4 h-12 w-auto object-contain sm:h-14"
                unoptimized
              />
            ) : (
              <div
                className="mx-auto mb-4 h-2 w-16 rounded-full"
                style={{ background: brandColor }}
              />
            )}
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {found.business.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Hi {found.request.customerName.split(" ")[0]}, how was your experience?
            </p>
          </div>

          <StarRatingClient
            slug={slug}
            token={token}
            brandColor={brandColor}
            googleReviewUrl={googleReviewUrl}
          />
        </div>
      </main>

      <PoweredByBadge businessSlug={slug} />
    </div>
  );
}
