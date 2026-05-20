import Link from "next/link";

interface PoweredByBadgeProps {
  businessSlug: string;
  variant?: "light" | "dark";
}

/**
 * Footer attribution shown on every public Review Collector screen.
 * The `ref` and `business` query params let us track conversion from
 * customer-facing review pages back to the directory.
 */
export function PoweredByBadge({
  businessSlug,
  variant = "light",
}: PoweredByBadgeProps) {
  const href = `https://freddybeach.com/?ref=review-collector&business=${encodeURIComponent(businessSlug)}`;
  const color =
    variant === "dark"
      ? "text-white/70 hover:text-white"
      : "text-muted-foreground hover:text-foreground";

  return (
    <div className="w-full py-6 text-center text-xs">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 font-medium transition-colors ${color}`}
      >
        Powered by <span className="font-semibold">FreddyBeach</span>
      </Link>
    </div>
  );
}
