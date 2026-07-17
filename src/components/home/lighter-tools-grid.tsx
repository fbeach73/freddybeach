import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAvailableTools } from "@/lib/data/ai-tools";

export function LighterToolsGrid() {
  const tools = getAvailableTools();
  if (tools.length === 0) return null;

  return (
    <section className="py-12">
      <div className="mb-8">
        <div className="w-16 h-2 bg-nb-green mb-4" />
        <h2 className="text-2xl md:text-3xl font-black uppercase">
          The whole toolbox
        </h2>
        <p className="mt-2 text-muted-foreground">
          Six tools, one account. Every one works on the free plan.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.id}
            href={`/ai-tools/${t.slug}`}
            className="nb-card bg-card p-5 group hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold">{t.name}</h3>
              <span className="shrink-0 border-2 border-nb-border bg-background px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                {t.costLabel}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {t.shortDescription}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide">
              Open <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
