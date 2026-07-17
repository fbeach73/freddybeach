import { CTASection } from "@/components/marketing/cta-section";
import { SectionHero } from "@/components/marketing/section-hero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Success Stories | FreddyBeach Directory",
  description:
    "FreddyBeach is just getting started. Our founding members will be our first success stories — see how Fredericton businesses use our AI tools.",
  openGraph: {
    title: "Success Stories | FreddyBeach Directory",
    description:
      "FreddyBeach is just getting started. Our founding members will be our first success stories — see how Fredericton businesses use our AI tools.",
  },
};

// Honest placeholder page: fabricated stats and example case studies were
// unpublished pending real numbers from real customers. The case-study data
// (src/lib/data/case-studies.ts) and card components remain in the repo for
// the owner to swap in real stories later.
export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <SectionHero
        title="We're Just Getting Started"
        subtitle="FreddyBeach is new, and we won't show you made-up numbers. Our founding members will be our first success stories — real Fredericton businesses, real results, published here as they happen."
        gradient
        primaryCTA={{
          text: "Become a Founding Member",
          href: "/pricing",
        }}
        secondaryCTA={{
          text: "Try the Tools Free",
          href: "/ai-tools",
        }}
      />

      {/* Your Story CTA Section */}
      <CTASection
        headline="Your Success Story Starts Here"
        subheadline="Be one of the first Fredericton businesses on the platform. Book a free consultation to discover what's possible."
        primaryCTA={{
          text: "Book Free AI Audit",
          href: "/consultation",
        }}
        secondaryCTA={{
          text: "Browse AI Tools",
          href: "/ai-tools",
        }}
        stats={[
          { label: "Free Consultation", value: "30 min", icon: "clock" },
          { label: "No Obligation", value: "100%", icon: "shield" },
          { label: "Local Support", value: "Always", icon: "users" },
        ]}
      />
    </div>
  );
}
