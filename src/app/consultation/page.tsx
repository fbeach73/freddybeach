import { BookingSection } from "@/components/marketing/booking-section";
// import { ConsultationCard } from "@/components/marketing/consultation-card";
import { SectionHero } from "@/components/marketing/section-hero";
import { TrustSignals } from "@/components/marketing/trust-signals";
// import { consultationPackages } from "@/lib/data/packages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultation Services | FreddyBeach Directory",
  description:
    "Custom AI solutions for your Fredericton business. Book a consultation to discover how automation can save you time and grow your business.",
  openGraph: {
    title: "Consultation Services | FreddyBeach Directory",
    description:
      "Custom AI solutions for your Fredericton business. Book a consultation to discover how automation can save you time and grow your business.",
  },
};

const trustStats = [
  {
    label: "Years Experience",
    value: "15+",
    icon: "award",
  },
  {
    label: "Businesses Helped",
    value: "150+",
    icon: "building",
  },
  {
    label: "Hours Saved",
    value: "5,000+",
    icon: "clock",
  },
  {
    label: "Satisfaction Rate",
    value: "98%",
    icon: "star",
  },
];

const testimonial = {
  quote:
    "Working with FreddyBeach was a game-changer for our business. They helped us implement AI tools that now save us over 20 hours every week. The ROI was evident within the first month.",
  author: "Sarah Mitchell",
  title: "Owner, Maritime Tech Solutions",
};

export default function ConsultationPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <SectionHero
        title="Custom AI Solutions for Your Business"
        subtitle="Partner with Fredericton's AI automation experts. We'll analyze your operations, identify opportunities, and implement systems that save you time and money."
        badges={["Locally Owned", "15+ Years Experience", "Money-Back Guarantee"]}
        gradient
        primaryCTA={{
          text: "Book Free Consultation",
          href: "#booking",
        }}
      />

      {/* Packages Section - Hidden for now, keeping for future use
      <section id="packages" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
              Choose Your Package
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              From quick-start guidance to complete digital transformation, we
              have a solution that fits your needs and budget.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {consultationPackages.map((pkg) => (
              <ConsultationCard key={pkg.id} package_={pkg} />
            ))}
          </div>
        </div>
      </section>
      */}

      {/* Booking Section */}
      <section
        id="booking"
        className="bg-muted/50 py-16 dark:bg-muted/20 md:py-24"
      >
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
              Book Your Consultation
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Select a time that works for you and tell us about your business.
              We&apos;ll come prepared with insights tailored to your needs.
            </p>
          </div>

          {/* Two-column layout: BookingCalendar | ContactForm */}
          <BookingSection />
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
              Why Fredericton Businesses Trust Us
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              We&apos;re not just consultants—we&apos;re your neighbors. As a
              locally-owned business, we&apos;re invested in the success of our
              community.
            </p>
          </div>

          <TrustSignals stats={trustStats} testimonial={testimonial} />

          {/* Money-Back Guarantee Badge */}
          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border bg-card px-6 py-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg
                  className="h-5 w-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold">100% Satisfaction Guarantee</p>
                <p className="text-sm text-muted-foreground">
                  Not happy? Full refund within 30 days, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
