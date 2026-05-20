import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { PoweredByBadge } from "@/components/marketing/powered-by-badge";
import { Button } from "@/components/ui/button";
import { findRequestByToken } from "@/lib/services/review-collector";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PublicThanksPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const found = await findRequestByToken(token);

  if (!found || found.business.slug !== slug) {
    notFound();
  }

  const brandColor =
    found.settings?.brandColor && /^#[0-9a-fA-F]{6}$/.test(found.settings.brandColor)
      ? found.settings.brandColor
      : "#0F766E";
  const googleReviewUrl = found.settings?.googleReviewUrl
    ? `/r/${slug}/${token}/go`
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
          <CheckCircle2
            className="mx-auto mb-4 h-14 w-14"
            style={{ color: brandColor }}
            strokeWidth={1.5}
          />
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Thank you
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We&rsquo;ve passed your message straight to {found.business.name}.
            Honest feedback is how local businesses get better &mdash; we appreciate it.
          </p>

          {googleReviewUrl && (
            <div className="mt-8 space-y-2">
              <p className="text-xs text-muted-foreground">
                Want to share your experience publicly too?
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Leave a Google review
                </a>
              </Button>
            </div>
          )}
        </div>
      </main>

      <PoweredByBadge businessSlug={slug} />
    </div>
  );
}
