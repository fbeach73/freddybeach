import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Business } from "@/lib/types";

interface TrustStripProps {
  businesses: Business[];
}

export function TrustStrip({ businesses }: TrustStripProps) {
  if (businesses.length === 0) return null;

  const visible = businesses.slice(0, 12);

  return (
    <section className="py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
        Trusted by Atlantic Canada businesses
      </p>
      <div className="flex flex-wrap gap-2">
        {visible.map((b) => (
          <Link
            key={b.id}
            href={`/${b.categorySlug}/${b.slug}`}
            className="inline-flex items-center border-2 border-nb-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-nb-yellow hover:text-black transition-colors"
          >
            {b.name}
          </Link>
        ))}
        <Link
          href="/search"
          className="inline-flex items-center gap-1 border-2 border-nb-border bg-nb-yellow text-black px-3 py-1.5 text-sm font-bold hover:bg-nb-yellow/80"
        >
          See the full directory <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
