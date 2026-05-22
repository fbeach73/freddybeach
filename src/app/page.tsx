import { Sparkles } from "lucide-react";
import { generateHomepageSchema } from "@/lib/seo/json-ld";
import { getFeaturedBusinessesFromDb } from "@/lib/data/businesses-db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { ReviewCollectorDemoWidget } from "@/components/home/review-collector-demo-widget";
import { TrustStrip } from "@/components/home/trust-strip";
import { HowItWorks } from "@/components/home/how-it-works";
import { OutcomeCompliance } from "@/components/home/outcome-compliance";
import { LighterToolsGrid } from "@/components/home/lighter-tools-grid";
import { ConsultationCTA } from "@/components/home/consultation-cta";
import { HomepageFaq } from "@/components/home/homepage-faq";
import { getHomepageFaqEntities } from "@/components/home/homepage-faq-data";

export const revalidate = 60;

export default async function Home() {
  const featuredBusinesses = await getFeaturedBusinessesFromDb();
  const jsonLd = generateHomepageSchema(getHomepageFaqEntities());

  return (
    <div className="flex-1 bg-nb-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <div className="container mx-auto px-4">
        {/* Section A · Hero */}
        <section className="py-12 md:py-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-nb-yellow text-black gap-1.5">
                <Sparkles className="h-3 w-3" />
                Review Collector · Live now
              </Badge>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl uppercase">
                Turn happy customers into 5★ Google reviews.
              </h1>
              <p className="text-lg text-foreground font-medium md:text-xl">
                Send a one-tap review request after every job. Happy customers
                go to Google. Unhappy ones stay private — and email you instead.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <AuthDialog defaultTab="sign-up">
                  <Button
                    size="lg"
                    className="nb-btn bg-nb-yellow text-black px-8 py-6 gap-2 hover:bg-nb-yellow"
                  >
                    <Sparkles className="h-4 w-4" />
                    Try it free
                  </Button>
                </AuthDialog>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="nb-btn bg-background px-8 py-6"
                >
                  <a href="#rc-demo">See it in 60 seconds</a>
                </Button>
              </div>
            </div>
            <div id="rc-demo" className="max-w-md mx-auto w-full lg:max-w-none">
              <ReviewCollectorDemoWidget />
            </div>
          </div>
        </section>

        {/* Section B · Trust strip */}
        <TrustStrip businesses={featuredBusinesses} />

        {/* Section C · How it works */}
        <HowItWorks />

        {/* Section D · Outcome + compliance */}
        <OutcomeCompliance />

        {/* Section E · Lighter tools grid */}
        <LighterToolsGrid />
      </div>

      {/* Section F · Consultation tier (full width) */}
      <ConsultationCTA />

      <div className="container mx-auto px-4">
        {/* Section G · FAQ */}
        <HomepageFaq />
      </div>
    </div>
  );
}
