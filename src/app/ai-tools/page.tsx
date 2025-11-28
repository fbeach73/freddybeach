import type { Metadata } from "next";
import { SectionHero } from "@/components/marketing/section-hero";
import { PricingGrid } from "@/components/marketing/pricing-grid";
import { AIToolsShowcase } from "./ai-tools-showcase";

export const metadata: Metadata = {
  title: "AI Tools for Local Businesses | FreddyBeach Directory",
  description:
    "Save hours every week with AI-powered tools designed for Fredericton businesses. Generate review responses, social posts, business descriptions, and more.",
  openGraph: {
    title: "AI Tools for Local Businesses | FreddyBeach Directory",
    description:
      "Save hours every week with AI-powered tools designed for Fredericton businesses.",
  },
};

export default function AIToolsPage() {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <SectionHero
        title="AI Tools That Work While You Run Your Business"
        subtitle="Save hours every week with AI-powered tools designed specifically for Fredericton local businesses. Respond to reviews, create social content, and market your business—all in seconds."
        badges={["Free Tools Available", "No Credit Card Required"]}
        gradient
        primaryCTA={{
          text: "Get Started Free",
          href: "/claim",
        }}
        secondaryCTA={{
          text: "View Pricing",
          href: "#pricing",
        }}
      />

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground">
              Start free and upgrade as your business grows. All plans include
              our core business listing features.
            </p>
          </div>
          <PricingGrid className="mx-auto max-w-5xl" />
        </div>
      </section>

      {/* Interactive Demos & All Tools - Client Component */}
      <AIToolsShowcase />
    </div>
  );
}
