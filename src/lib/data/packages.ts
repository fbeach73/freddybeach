import type { ConsultationPackage, PricingTier } from "@/lib/types";

export const consultationPackages: ConsultationPackage[] = [
  {
    id: "quick-start",
    name: "AI Quick Start",
    slug: "quick-start",
    price: 500,
    priceLabel: "$500",
    description:
      "Perfect for businesses ready to dip their toes into AI automation. Get a personalized roadmap and hands-on training to start saving time immediately.",
    timeline: "1-2 weeks",
    features: [
      "90-minute discovery call",
      "AI readiness assessment",
      "Custom automation roadmap",
      "Tool selection guidance",
      "1 hour of hands-on training",
      "30-day email support",
    ],
    outcomes: [
      "Clear understanding of AI opportunities",
      "Prioritized list of quick wins",
      "Confidence to implement first automation",
      "Resource list for continued learning",
    ],
    isPopular: false,
  },
  {
    id: "automation-blueprint",
    name: "Automation Blueprint",
    slug: "automation-blueprint",
    price: 2500,
    priceLabel: "$2,500",
    description:
      "Comprehensive automation strategy with implementation support. We'll design and help you build systems that transform your daily operations.",
    timeline: "4-6 weeks",
    features: [
      "Full business process audit",
      "Custom automation strategy",
      "3 automation implementations",
      "Team training sessions (up to 5 people)",
      "Integration setup & testing",
      "90-day priority support",
      "Monthly check-in calls (3 months)",
    ],
    outcomes: [
      "10-20 hours saved per week",
      "Documented SOPs for all automations",
      "Team confident in using new systems",
      "Measurable ROI within 90 days",
    ],
    isPopular: true,
  },
  {
    id: "done-for-you",
    name: "Done-For-You",
    slug: "done-for-you",
    price: 5000,
    priceLabel: "$5,000+",
    description:
      "Complete digital transformation with white-glove service. We handle everything from strategy to implementation to ongoing optimization.",
    timeline: "8-12 weeks",
    features: [
      "Executive strategy sessions",
      "Complete tech stack audit",
      "Unlimited automation implementations",
      "Custom AI tool development",
      "Full team training program",
      "Data migration & integration",
      "6 months of dedicated support",
      "Quarterly optimization reviews",
    ],
    outcomes: [
      "20-40+ hours saved per week",
      "Fully integrated automation ecosystem",
      "Custom dashboards & reporting",
      "Scalable systems for growth",
      "Competitive advantage in your market",
    ],
    isPopular: false,
  },
];

export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "Free",
    period: "forever",
    description: "Get started with essential AI tools at no cost. Perfect for trying out automation.",
    features: [
      "Basic business listing",
      "Review Response Assistant",
      "Social Post Generator",
      "5 AI generations per month",
      "Community support",
    ],
    ctaText: "Get Started Free",
    isPopular: false,
  },
  {
    id: "enhanced",
    name: "Enhanced",
    price: 99,
    priceLabel: "$99",
    period: "per year",
    description:
      "Unlock premium tools and higher limits. Best value for growing businesses.",
    features: [
      "Enhanced business listing",
      "Priority placement in search",
      "All 4 AI tools unlocked",
      "100 AI generations per month",
      "Business Description Writer",
      "Email Template Generator",
      "Analytics dashboard",
      "Email support",
    ],
    ctaText: "Upgrade to Enhanced",
    isPopular: true,
  },
  {
    id: "featured",
    name: "Featured",
    price: 199,
    priceLabel: "$199",
    period: "per year",
    description:
      "Maximum visibility and unlimited access. For businesses serious about growth.",
    features: [
      "Featured listing with badge",
      "Homepage carousel placement",
      "Top of category results",
      "Unlimited AI generations",
      "All premium tools",
      "Custom branding options",
      "Detailed analytics & insights",
      "Priority phone & email support",
      "Quarterly strategy call",
    ],
    ctaText: "Go Featured",
    isPopular: false,
  },
];

export function getPackageBySlug(slug: string): ConsultationPackage | undefined {
  return consultationPackages.find((pkg) => pkg.slug === slug);
}

export function getTierById(id: string): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.id === id);
}
