import { CaseStudyCard } from "@/components/marketing/case-study-card";
import { CTASection } from "@/components/marketing/cta-section";
import { SectionHero } from "@/components/marketing/section-hero";
import { TrustSignals } from "@/components/marketing/trust-signals";
import { getCaseStudies } from "@/lib/data/case-studies";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Success Stories | FreddyBeach Directory",
  description:
    "See how Fredericton businesses are saving time and growing with AI-powered tools. Real results from real local businesses.",
  openGraph: {
    title: "Success Stories | FreddyBeach Directory",
    description:
      "See how Fredericton businesses are saving time and growing with AI-powered tools. Real results from real local businesses.",
  },
};

const heroStats = [
  {
    label: "Businesses Helped",
    value: "150+",
    icon: "building",
  },
  {
    label: "Hours Saved Weekly",
    value: "500+",
    icon: "clock",
  },
  {
    label: "Average ROI",
    value: "340%",
    icon: "trending",
  },
  {
    label: "Satisfaction Rate",
    value: "98%",
    icon: "star",
  },
];

export default function SuccessStoriesPage() {
  const caseStudies = getCaseStudies();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <SectionHero
        title="Real Results from Real Fredericton Businesses"
        subtitle="Discover how local businesses are transforming their operations, saving hours every week, and growing their customer base with our AI-powered tools."
        gradient
        primaryCTA={{
          text: "Start Your Success Story",
          href: "/consultation",
        }}
        secondaryCTA={{
          text: "Try Free Tools",
          href: "/ai-tools",
        }}
      >
        {/* Stats Bar Below Hero */}
        <div className="mt-12">
          <TrustSignals stats={heroStats} />
        </div>
      </SectionHero>

      {/* Case Studies Grid Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
              Featured Success Stories
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              From barbershops to tech companies, see how businesses across
              Fredericton are using AI to work smarter, not harder.
            </p>
          </div>

          {/* Case Studies - Single column with alternating layout feel */}
          <div className="mx-auto max-w-4xl space-y-8">
            {caseStudies.map((caseStudy) => (
              <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
            ))}
          </div>
        </div>
      </section>

      {/* Your Story CTA Section */}
      <CTASection
        headline="Your Success Story Starts Here"
        subheadline="Join the growing community of Fredericton businesses saving time and money with AI-powered tools. Book a free consultation to discover what's possible."
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
    </main>
  );
}
