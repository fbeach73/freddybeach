import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SectionHero } from "@/components/marketing/section-hero";
import { AIPricingSection } from "@/components/marketing/ai-pricing-section";
import { FoundingMemberBanner } from "@/components/marketing/founding-member-banner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PLANS, creditPacks } from "@/lib/data/plans";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://freddybeach.com";

export const metadata: Metadata = {
  title: "Pricing | FreddyBeach AI Tools for Fredericton Businesses",
  description:
    "Simple pricing for Fredericton businesses. Start free with 10 credits a month, or go Starter ($9/mo) or Pro ($29/mo). Founding members lock in their price for life.",
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
};

const PRICING_FAQ = [
  {
    question: "What's a credit?",
    answer:
      "One credit = one AI generation. Write a review reply, a social post, or an email — each one costs a single credit. Bigger images can cost a little more (2 credits for 2K, 4 for 4K).",
  },
  {
    question: "What can I do on the free plan?",
    answer:
      "Everything. Free accounts get 10 credits every month and every tool works exactly the same — no watered-down demo. No credit card needed.",
  },
  {
    question: "What does being a founding member get me?",
    answer:
      "The first 100 businesses to subscribe lock in their founding price for life. If prices go up later, yours never does. That's it — no fine print.",
  },
  {
    question: "Do my credits expire?",
    answer:
      "Purchased credit packs never expire. Monthly plan credits (free top-ups and Starter's 100) refresh each month.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel from your billing page in two clicks. You keep access until the end of the period you've already paid for.",
  },
  {
    question: "What does \"unlimited\" mean on Pro?",
    answer:
      "Use the tools as much as your business needs. There's a fair-use guideline of 500 generations a month so a handful of accounts can't slow things down for everyone.",
  },
];

// Product + Offer structured data built from the canonical plans
function generatePricingSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "FreddyBeach AI Tools",
    description:
      "AI tools for Fredericton businesses — review replies, social posts, emails, images, and more.",
    brand: {
      "@type": "Organization",
      name: "FreddyBeach",
    },
    url: `${SITE_URL}/pricing`,
    offers: [
      ...[PLANS.free, PLANS.starter, PLANS.pro, PLANS.byokPro].map((plan) => ({
        "@type": "Offer",
        name: `${plan.name} plan`,
        price: plan.price.toFixed(2),
        priceCurrency: "CAD",
        description: plan.description,
        url: `${SITE_URL}/pricing`,
      })),
      ...creditPacks.map((pack) => ({
        "@type": "Offer",
        name: `${pack.credits} credit pack`,
        price: pack.price.toFixed(2),
        priceCurrency: "CAD",
        description: pack.description,
        url: `${SITE_URL}/pricing`,
      })),
    ],
  };
}

function generateFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRICING_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export default async function PricingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([generatePricingSchema(), generateFaqSchema()]),
        }}
      />

      {/* Hero */}
      <SectionHero
        title="Simple Pricing, No Surprises"
        subtitle="Start free with 10 credits every month. Upgrade when your business is ready — founding members lock in their price for life."
        badges={["No credit card to start", "Cancel anytime"]}
        gradient
      />

      {/* Founding member banner */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <FoundingMemberBanner
            variant="full"
            showCta={false}
            className="mx-auto max-w-5xl"
          />
        </div>
      </section>

      {/* Plans + credit packs + BYOK */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <AIPricingSection
            className="mx-auto max-w-5xl"
            isAuthenticated={!!session}
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t-2 border-nb-border bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-2xl font-bold uppercase tracking-tight md:text-3xl">
                Pricing Questions
              </h2>
              <p className="text-muted-foreground">
                Plain answers, no jargon.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {PRICING_FAQ.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-bold">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
}
