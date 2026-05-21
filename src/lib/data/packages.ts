import type {
  BYOKOption,
  BYOKProPlan,
  ConsultationPackage,
  CreditPackage,
  PricingTier,
  SubscriptionPlan,
} from "@/lib/types";

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
      "All current AI tools unlocked",
      "100 AI generations per month",
      "Business Description Writer (coming soon)",
      "Email Template Generator (coming soon)",
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

// AI Tools Credit System

export const creditPackages: CreditPackage[] = [
  {
    id: "credits-10",
    name: "Starter Pack",
    credits: 10,
    price: 1.99,
    priceLabel: "$1.99",
    pricePerCredit: "$0.20",
    description: "Try AI image generation without commitment.",
    features: [
      "10 AI generations",
      "Use on any available AI tool",
      "Credits never expire",
      "No subscription required",
    ],
    isPopular: false,
  },
  {
    id: "credits-50",
    name: "Popular Pack",
    credits: 50,
    price: 6.99,
    priceLabel: "$6.99",
    pricePerCredit: "$0.14",
    description: "Most popular choice for regular users.",
    features: [
      "50 AI generations",
      "Use on any available AI tool",
      "Credits never expire",
      "No subscription required",
      "Save 30% vs Starter Pack",
    ],
    isPopular: true,
  },
  {
    id: "credits-100",
    name: "Value Pack",
    credits: 100,
    price: 9.99,
    priceLabel: "$9.99",
    pricePerCredit: "$0.10",
    description: "Best value for power users. Credits never expire.",
    features: [
      "100 AI generations",
      "Use on any available AI tool",
      "Credits never expire",
      "No subscription required",
      "Save 50% vs Starter Pack",
    ],
    isPopular: false,
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "unlimited-monthly",
    name: "Unlimited Monthly",
    price: 29,
    priceLabel: "$29",
    period: "monthly",
    description: "Unlimited access for power users who generate content daily.",
    features: [
      "Unlimited AI generations",
      "All available AI tools",
      "Priority processing",
      "Cancel anytime",
    ],
    softCapGenerations: 500,
    isPopular: false,
  },
  {
    id: "unlimited-yearly",
    name: "Unlimited Yearly",
    price: 199,
    priceLabel: "$199",
    period: "yearly",
    yearlyEquivalent: "$16.58/mo",
    description:
      "Best value for committed users. Save over 40% compared to monthly.",
    features: [
      "Unlimited AI generations",
      "All available AI tools",
      "Priority processing",
      "2 months free vs monthly",
    ],
    softCapGenerations: 500,
    isPopular: true,
  },
];

export const byokOption: BYOKOption = {
  id: "byok",
  name: "Bring Your Own Key",
  price: 0,
  priceLabel: "Free",
  description:
    "Use your own API keys for free, unlimited access. Perfect for developers and power users.",
  features: [
    "Unlimited generations",
    "Use your own API keys",
    "No usage tracking",
    "Full privacy control",
  ],
  requirements: [
    "Google Gemini API key (free tier available)",
    "Technical setup required",
  ],
};

export const byokProPlan: BYOKProPlan = {
  id: "byok-pro",
  name: "BYOK Pro",
  price: 7.99,
  priceLabel: "$7.99",
  period: "monthly",
  description:
    "Unlimited AI generations using your own API key. Best for power users and developers.",
  features: [
    "Unlimited image generations",
    "Use your own Google Gemini API key",
    "No per-image credits needed",
    "Higher resolution outputs (up to 4K)",
    "Priority processing queue",
    "Full privacy - your key, your data",
    "Cancel anytime",
  ],
  requirements: [
    "Google Gemini API key required",
    "You pay Google directly for API usage",
  ],
  isPopular: false,
};

export function getCreditPackageById(id: string): CreditPackage | undefined {
  return creditPackages.find((pkg) => pkg.id === id);
}

export function getSubscriptionPlanById(id: string): SubscriptionPlan | undefined {
  return subscriptionPlans.find((plan) => plan.id === id);
}
