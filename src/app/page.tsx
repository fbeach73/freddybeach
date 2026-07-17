import Link from "next/link";
import { Sparkles, Check, ArrowRight, Star } from "lucide-react";
import { generateHomepageSchema } from "@/lib/seo/json-ld";
import { getFeaturedBusinessesFromDb } from "@/lib/data/businesses-db";
import { getCategoriesWithCounts } from "@/lib/data/categories-db";
import { PLANS } from "@/lib/data/plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { FoundingMemberBanner } from "@/components/marketing/founding-member-banner";
import { ReviewCollectorDemoWidget } from "@/components/home/review-collector-demo-widget";
import { LighterToolsGrid } from "@/components/home/lighter-tools-grid";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedBusinessesWrapper } from "@/components/home/featured-businesses-wrapper";
import { CategoryGrid } from "@/components/home/category-grid";
import { HomepageFaq } from "@/components/home/homepage-faq";
import { getHomepageFaqEntities } from "@/components/home/homepage-faq-data";

export const revalidate = 60;

const TEASER_PLAN_IDS = ["free", "starter", "pro"] as const;

export default async function Home() {
  const [featuredBusinesses, categoriesWithCounts] = await Promise.all([
    getFeaturedBusinessesFromDb(),
    getCategoriesWithCounts(),
  ]);
  const jsonLd = generateHomepageSchema(getHomepageFaqEntities());

  return (
    <div className="flex-1 bg-nb-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <div className="container mx-auto px-4">
        {/* Section 1 · Platform hero */}
        <section className="py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <Badge className="bg-nb-yellow text-black gap-1.5">
              <Sparkles className="h-3 w-3" />
              Built in Fredericton, for Fredericton
            </Badge>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl uppercase">
              AI tools for Fredericton businesses — get in early.
            </h1>
            <p className="text-lg text-foreground font-medium md:text-xl">
              Review replies, social posts, emails, and images — done in
              seconds, not evenings. Built for local businesses. No dev team
              needed.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <AuthDialog defaultTab="sign-up">
                <Button
                  size="lg"
                  className="nb-btn bg-nb-yellow text-black px-8 py-6 gap-2 hover:bg-nb-yellow"
                >
                  <Sparkles className="h-4 w-4" />
                  Start free
                </Button>
              </AuthDialog>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="nb-btn bg-background px-8 py-6"
              >
                <Link href="/ai-tools">Explore the tools</Link>
              </Button>
            </div>
          </div>
          <FoundingMemberBanner className="mt-10 mx-auto max-w-3xl" />
        </section>

        {/* Section 2 · Flagship: Review Collector */}
        <section className="py-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="w-16 h-2 bg-nb-yellow" />
              <Badge className="bg-nb-yellow text-black gap-1.5">
                <Star className="h-3 w-3" />
                Flagship tool
              </Badge>
              <h2 className="text-3xl font-black tracking-tight md:text-4xl uppercase">
                Turn happy customers into 5★ Google reviews.
              </h2>
              <p className="text-lg text-foreground font-medium">
                Send a one-tap review request after every job. Happy customers
                go to Google. Unhappy ones stay private — and email you
                instead.
              </p>
              <Button asChild className="nb-btn bg-nb-yellow text-black hover:bg-nb-yellow gap-2">
                <Link href="/ai-tools/review-collector">
                  See how it works <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="max-w-md mx-auto w-full lg:max-w-none">
              <ReviewCollectorDemoWidget />
            </div>
          </div>
        </section>

        {/* Section 3 · Toolbox grid */}
        <LighterToolsGrid />
      </div>

      {/* Section 4 · Directory */}
      <section id="directory" className="border-y-4 border-nb-border bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-4">
            <div className="w-16 h-2 bg-nb-orange mb-4" />
            <h2 className="text-2xl md:text-3xl font-black uppercase">
              Fredericton&apos;s local business directory
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              The directory is free for every Fredericton business — your
              listing includes a dofollow backlink to your website, so being
              here helps your Google ranking too.{" "}
              <Link href="/add-business" className="font-bold underline underline-offset-2 hover:no-underline">
                Add your business
              </Link>
            </p>
          </div>
          <HeroSection />
          <FeaturedBusinessesWrapper businesses={featuredBusinesses} />
          <div id="categories">
            <CategoryGrid categories={categoriesWithCounts} />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Section 5 · Pricing teaser */}
        <section className="py-12">
          <div className="mb-8">
            <div className="w-16 h-2 bg-nb-yellow mb-4" />
            <h2 className="text-2xl md:text-3xl font-black uppercase">
              Simple pricing
            </h2>
            <p className="mt-2 text-muted-foreground">
              Start free. Upgrade when your business is ready — founding
              members lock in their price for life.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TEASER_PLAN_IDS.map((id) => {
              const plan = PLANS[id];
              return (
                <div
                  key={plan.id}
                  className={`nb-card bg-card p-6 ${plan.isPopular ? "border-nb-yellow" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-black uppercase">{plan.name}</h3>
                    {plan.isPopular && (
                      <Badge className="bg-nb-yellow text-black">Popular</Badge>
                    )}
                  </div>
                  <p className="mt-2 text-3xl font-black">{plan.priceLabel}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0 mt-0.5 text-nb-green" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <Button asChild variant="outline" className="nb-btn bg-background gap-2">
              <Link href="/pricing">
                See full pricing <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Section 6 · FAQ */}
        <HomepageFaq />
      </div>
    </div>
  );
}
