import { Mail, Star, Inbox } from "lucide-react";

const STEPS = [
  {
    icon: Mail,
    title: "1. Send",
    body: "Paste customer email, hit send. Branded request goes out in seconds.",
  },
  {
    icon: Star,
    title: "2. Customer rates",
    body: "One tap on five stars. Branches automatically based on the rating.",
  },
  {
    icon: Inbox,
    title: "3. You get the result",
    body: "Public Google review, or private feedback emailed straight to you.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-12">
      <div className="mb-8">
        <div className="w-16 h-2 bg-nb-blue mb-4" />
        <h2 className="text-2xl md:text-3xl font-black uppercase">
          How it works
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.title} className="nb-card bg-card p-6">
            <s.icon className="h-8 w-8 mb-3" aria-hidden="true" />
            <h3 className="font-bold text-lg mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
