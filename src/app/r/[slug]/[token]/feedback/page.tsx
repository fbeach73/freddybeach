import Link from "next/link";
import { notFound } from "next/navigation";

import { PoweredByBadge } from "@/components/marketing/powered-by-badge";
import { findRequestByToken } from "@/lib/services/review-collector";
import { FeedbackForm } from "./feedback-form";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PublicFeedbackPage({
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
        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              We&rsquo;d love to make it right
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your feedback goes straight to {found.business.name}. Share whatever
              you&rsquo;re comfortable with &mdash; the more we know, the more we can
              do about it.
            </p>
          </div>

          <FeedbackForm slug={slug} token={token} brandColor={brandColor} />

          {googleReviewUrl && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              You can also{" "}
              <Link
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                leave a public review on Google
              </Link>
              .
            </p>
          )}
        </div>
      </main>

      <PoweredByBadge businessSlug={slug} />
    </div>
  );
}
