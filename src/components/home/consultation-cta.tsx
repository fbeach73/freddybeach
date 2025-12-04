import Link from "next/link";
import { Calendar, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConsultationCTA() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent" />

      <div className="relative mx-auto max-w-4xl text-center px-4">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          Ready to Transform Your Business with AI?
        </h2>

        <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
          Book a free 30-minute consultation with our team. We&apos;ll show you
          how AI tools can save you time and grow your business.
        </p>

        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/consultation" className="gap-2">
              <Calendar className="h-4 w-4" />
              Book a Free Consultation
            </Link>
          </Button>
        </div>

        {/* Trust Signals */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>30-minute session</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>50+ local businesses helped</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>No obligation</span>
          </div>
        </div>
      </div>
    </section>
  );
}
