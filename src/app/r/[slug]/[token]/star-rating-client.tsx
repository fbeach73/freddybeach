"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

interface StarRatingClientProps {
  slug: string;
  token: string;
  brandColor: string;
  googleReviewUrl: string | null;
}

export function StarRatingClient({
  slug,
  token,
  brandColor,
  googleReviewUrl,
}: StarRatingClientProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRate(rating: number) {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/r/${slug}/${token}/rate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rating }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      if (data.next === "google" && data.googleUrl) {
        window.location.assign(data.googleUrl);
        return;
      }

      router.push(`/r/${slug}/${token}/feedback`);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div
        className="flex items-center justify-center gap-2 sm:gap-3"
        onMouseLeave={() => setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const isActive = (hovered ?? 0) >= n;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              disabled={submitting}
              onMouseEnter={() => setHovered(n)}
              onFocus={() => setHovered(n)}
              onClick={() => handleRate(n)}
              className="rounded-md p-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              style={
                {
                  "--ring": brandColor,
                } as React.CSSProperties
              }
            >
              <Star
                className="h-12 w-12 sm:h-14 sm:w-14 transition-colors"
                style={{
                  color: isActive ? brandColor : "#d4d4d8",
                  fill: isActive ? brandColor : "transparent",
                }}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="text-center text-sm text-red-600">{error}</p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Tap a star to share your experience.
        </p>
      )}

      {googleReviewUrl && (
        <p className="text-center text-xs text-muted-foreground">
          Prefer to leave a public review?{" "}
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Open Google Reviews
          </a>
        </p>
      )}
    </div>
  );
}
