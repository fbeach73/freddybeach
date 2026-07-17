import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFoundingMemberCount } from "@/lib/services/token-system";

const FOUNDING_CAP = 100;
// Below this count we lead with the invitation instead of a counter —
// honest copy only, never fabricated numbers.
const COUNTER_THRESHOLD = 10;

interface FoundingMemberBannerProps {
  /** "full" for homepage/pricing, "compact" strip for tools hub/dashboard */
  variant?: "full" | "compact";
  /** Hide the "See plans" link (e.g. when already on /pricing) */
  showCta?: boolean;
  className?: string;
}

/**
 * Founding-member banner + counter (server component).
 * Reads the real founding-member count; renders nothing once all
 * 100 spots are claimed.
 */
export async function FoundingMemberBanner({
  variant = "full",
  showCta = true,
  className,
}: FoundingMemberBannerProps) {
  const count = await getFoundingMemberCount();

  if (count >= FOUNDING_CAP) {
    return null;
  }

  const showCounter = count >= COUNTER_THRESHOLD;

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-2 border-2 border-nb-border bg-nb-yellow px-4 py-2 text-sm font-bold text-black",
          className
        )}
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        <span>
          {showCounter
            ? `${count} of ${FOUNDING_CAP} founding spots claimed — founding prices locked in for life.`
            : "Get in early — the first 100 businesses lock in founding prices for life."}
        </span>
        {showCta && (
          <Link href="/pricing" className="underline underline-offset-2 hover:no-underline">
            See plans
          </Link>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "nb-card border-2 border-nb-border bg-nb-yellow p-6 text-black sm:p-8",
        className
      )}
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Founding members
          </p>
          <p className="text-xl font-bold sm:text-2xl">
            {showCounter
              ? `${count} of ${FOUNDING_CAP} founding spots claimed`
              : `Be one of the first ${FOUNDING_CAP} Fredericton businesses`}
          </p>
          <p className="text-sm">
            Founding members lock in founding prices for life. When prices go
            up later, yours never does.
          </p>
        </div>
        {showCta && (
          <Link
            href="/pricing"
            className="shrink-0 border-2 border-nb-border bg-black px-5 py-2.5 font-bold text-white shadow-nb-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:bg-white dark:text-black"
          >
            See plans
          </Link>
        )}
      </div>
    </div>
  );
}
