import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { aiTools } from "@/lib/data/ai-tools";

const HIGHLIGHTED_SLUGS = [
  "review-responder",
  "social-post-generator",
  "image-generator",
];

export function LighterToolsGrid() {
  const tools = aiTools.filter((t) => HIGHLIGHTED_SLUGS.includes(t.slug));
  if (tools.length === 0) return null;

  return (
    <section className="py-12">
      <div className="mb-8">
        <div className="w-16 h-2 bg-nb-green mb-4" />
        <h2 className="text-2xl md:text-3xl font-black uppercase">
          More tools as you grow
        </h2>
        <p className="mt-2 text-muted-foreground">
          Every FreddyBeach account also gets:
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.id}
            href={`/ai-tools/${t.slug}`}
            className="nb-card bg-card p-5 group hover:bg-muted/50 transition-colors"
          >
            <h3 className="font-bold mb-1">{t.name}</h3>
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
