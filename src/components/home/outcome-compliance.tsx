import { ShieldCheck } from "lucide-react";

export function OutcomeCompliance() {
  return (
    <section className="py-12">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="nb-card bg-card p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
            What changes
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span aria-hidden>→</span>
              <span>More 5★ reviews from your existing customer base — no new marketing.</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>→</span>
              <span>Unhappy customers email you privately instead of posting publicly.</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>→</span>
              <span>Owner sees ratings + feedback in one dashboard.</span>
            </li>
          </ul>
        </div>
        <div className="nb-card bg-nb-yellow/30 p-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-wide">
              Google-policy compliant
            </p>
          </div>
          <p className="text-sm">
            The public Google review link is shown on every screen — even the private feedback path.
            No review gating.
          </p>
        </div>
      </div>
    </section>
  );
}
