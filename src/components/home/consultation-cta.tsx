import Link from "next/link";
import { Calendar, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConsultationCTA() {
  return (
    <section className="relative py-20 overflow-hidden bg-nb-orange">
      <div className="relative mx-auto max-w-4xl text-center px-4">
        <h2 className="text-3xl font-black tracking-tight md:text-4xl lg:text-5xl uppercase text-black">
          Want this set up FOR you?
        </h2>

        <p className="mt-6 text-lg text-black/80 font-medium md:text-xl max-w-2xl mx-auto">
          We do the integration, the email writing, and the first 30 days of monitoring. Packages from $500 — book a discovery call.
        </p>

        <div className="mt-8">
          <Button size="lg" asChild className="nb-btn bg-black text-white border-white shadow-[4px_4px_0_0_#fff] px-10 py-6 text-lg hover:bg-black">
            <Link href="/consultation" className="gap-2">
              <Calendar className="h-4 w-4" />
              Book a discovery call
            </Link>
          </Button>
        </div>

        {/* Trust Signals */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 border-2 border-black bg-white/90 px-4 py-2">
            <Clock className="h-4 w-4 text-black" />
            <span className="font-bold text-black">90-min discovery call</span>
          </div>
          <div className="flex items-center gap-2 border-2 border-black bg-white/90 px-4 py-2">
            <Users className="h-4 w-4 text-black" />
            <span className="font-bold text-black">Atlantic Canada small business</span>
          </div>
          <div className="flex items-center gap-2 border-2 border-black bg-white/90 px-4 py-2">
            <Calendar className="h-4 w-4 text-black" />
            <span className="font-bold text-black">No obligation</span>
          </div>
        </div>
      </div>
    </section>
  );
}
