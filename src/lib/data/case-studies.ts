import type { CaseStudy } from "@/lib/types";

export const caseStudies: CaseStudy[] = [
  {
    id: "coastal-cuts",
    businessName: "Coastal Cuts Barbershop",
    businessSlug: "coastal-cuts-barbershop",
    category: "Beauty & Personal Care",
    categorySlug: "beauty",
    heroImage: "/images/case-studies/coastal-cuts.jpg",
    ownerName: "Marcus Thompson",
    ownerTitle: "Owner & Master Barber",
    challenge: [
      "Spending 2+ hours daily responding to Google reviews and social media comments",
      "Struggling to maintain consistent brand voice across all review responses",
      "Missing opportunities to turn negative reviews into positive customer experiences",
      "No time left for actual barbering after handling admin tasks",
    ],
    solution: [
      "Implemented Review Response Assistant for all Google and Facebook reviews",
      "Set up Social Post Generator for weekly Instagram content",
      "Created templated responses that match their laid-back, professional brand voice",
      "Established a 15-minute daily review routine instead of scattered responses",
    ],
    toolsUsed: ["review-responder", "social-post-generator"],
    results: [
      {
        metric: "Time Saved Weekly",
        value: "8 hours",
        description: "From 2+ hours daily to just 15 minutes",
      },
      {
        metric: "Review Response Rate",
        value: "100%",
        description: "Every review gets a thoughtful response within 24 hours",
      },
      {
        metric: "Google Rating Increase",
        value: "+0.4 stars",
        description: "From 4.2 to 4.6 stars in 3 months",
      },
      {
        metric: "New Bookings",
        value: "+23%",
        description: "Attributed to improved online presence",
      },
    ],
    testimonial:
      "I used to dread checking my phone in the morning because I knew there'd be reviews waiting. Now I actually look forward to it. The AI gets my voice perfectly - customers can't tell the difference. It's like having a social media manager who actually knows barbering.",
    isFeatured: true,
  },
  {
    id: "maritime-tech",
    businessName: "Maritime Tech Solutions",
    businessSlug: "maritime-tech-solutions",
    category: "Professional Services",
    categorySlug: "professional-services",
    heroImage: "/images/case-studies/maritime-tech.jpg",
    ownerName: "Sarah Chen",
    ownerTitle: "Founder & CEO",
    challenge: [
      "Client communication taking up 40% of billable hours",
      "Inconsistent follow-up emails leading to lost opportunities",
      "Difficulty explaining technical services to non-technical prospects",
      "Website copy wasn't converting visitors to consultation requests",
    ],
    solution: [
      "Deployed Email Template Generator for all client touchpoints",
      "Created Business Description Writer content for service pages",
      "Built a library of explanation templates for common technical questions",
      "Automated appointment reminder and follow-up sequences",
    ],
    toolsUsed: ["email-template-generator", "business-description-writer"],
    results: [
      {
        metric: "Client Response Time",
        value: "< 2 hours",
        description: "Down from average 24-48 hours",
      },
      {
        metric: "Proposal Win Rate",
        value: "+35%",
        description: "Better communication = better close rates",
      },
      {
        metric: "Hours Saved Monthly",
        value: "32 hours",
        description: "Reclaimed billable time worth $4,800",
      },
      {
        metric: "Website Conversions",
        value: "+67%",
        description: "More visitors becoming leads",
      },
    ],
    testimonial:
      "As a tech company, we were so focused on our clients' automation that we forgot about our own. The email generator alone paid for itself in the first week. Now my team spends time on actual consulting work, not writing the same email for the hundredth time.",
    isFeatured: true,
  },
  {
    id: "green-plate-bistro",
    businessName: "The Green Plate Bistro",
    businessSlug: "the-green-plate-bistro",
    category: "Restaurants & Cafes",
    categorySlug: "restaurants",
    heroImage: "/images/case-studies/green-plate.jpg",
    ownerName: "Chef Antoine Leblanc",
    ownerTitle: "Owner & Executive Chef",
    challenge: [
      "Negative reviews about wait times damaging reputation",
      "Social media presence was inconsistent and uninspiring",
      "Couldn't afford a dedicated marketing person",
      "Menu descriptions weren't capturing the farm-to-table story",
    ],
    solution: [
      "Used Review Response Assistant to address concerns professionally",
      "Social Post Generator creates 3 posts per week highlighting daily specials",
      "Business Description Writer crafted compelling menu descriptions",
      "Turned negative reviews into opportunities to showcase customer service",
    ],
    toolsUsed: [
      "review-responder",
      "social-post-generator",
      "business-description-writer",
    ],
    results: [
      {
        metric: "Negative Review Turnaround",
        value: "78%",
        description: "Converted to returning customers",
      },
      {
        metric: "Instagram Engagement",
        value: "+156%",
        description: "More likes, comments, and shares",
      },
      {
        metric: "Weekend Reservations",
        value: "+40%",
        description: "Consistently fully booked",
      },
      {
        metric: "Marketing Time",
        value: "3 hrs/week",
        description: "Down from 10+ hours weekly",
      },
    ],
    testimonial:
      "I'm a chef, not a marketer. But now our Instagram looks like we have a professional team. The best part? When someone complains about wait times, I have a response ready that turns them into regulars. Three people have come back specifically because of how we handled their review.",
    isFeatured: true,
  },
  {
    id: "sunrise-yoga",
    businessName: "Sunrise Yoga Studio",
    businessSlug: "sunrise-yoga-studio",
    category: "Fitness & Wellness",
    categorySlug: "fitness",
    heroImage: "/images/case-studies/sunrise-yoga.jpg",
    ownerName: "Emma Hartwell",
    ownerTitle: "Studio Owner & Lead Instructor",
    challenge: [
      "Email newsletters were taking entire Sundays to write",
      "Class descriptions weren't attracting the right students",
      "Struggling to maintain the warm, welcoming tone across all communications",
      "Reviews were going unanswered for weeks at a time",
    ],
    solution: [
      "Email Template Generator now handles weekly newsletters and class reminders",
      "Business Description Writer created SEO-optimized class descriptions",
      "Review Response Assistant maintains the studio's peaceful, positive voice",
      "Created a content library for seasonal promotions and workshops",
    ],
    toolsUsed: [
      "email-template-generator",
      "business-description-writer",
      "review-responder",
    ],
    results: [
      {
        metric: "Newsletter Time",
        value: "30 min",
        description: "Down from 4+ hours every Sunday",
      },
      {
        metric: "Email Open Rate",
        value: "52%",
        description: "Industry average is 21%",
      },
      {
        metric: "New Student Signups",
        value: "+28%",
        description: "Better descriptions = better fit",
      },
      {
        metric: "Review Response Time",
        value: "< 24 hrs",
        description: "Was averaging 2+ weeks",
      },
    ],
    testimonial:
      "Sunday used to be my admin day. Now I actually get to rest and practice what I preach. The AI somehow captures that calm, welcoming energy we try to create in the studio. My students have even complimented our 'new marketing person' - they don't know it's AI!",
    isFeatured: false,
  },
  {
    id: "northside-auto",
    businessName: "Northside Auto Detailing",
    businessSlug: "northside-auto-detailing",
    category: "Automotive",
    categorySlug: "automotive",
    heroImage: "/images/case-studies/northside-auto.jpg",
    ownerName: "Jake Morrison",
    ownerTitle: "Owner & Lead Detailer",
    challenge: [
      "Price-focused competition was killing margins",
      "Couldn't articulate the value of premium detailing services",
      "Social media showed work but didn't drive bookings",
      "Review responses sounded generic and unprofessional",
    ],
    solution: [
      "Business Description Writer positioned services as premium experiences",
      "Social Post Generator creates before/after content with compelling stories",
      "Review Response Assistant showcases expertise in every response",
      "Email templates for quotes that justify premium pricing",
    ],
    toolsUsed: [
      "business-description-writer",
      "social-post-generator",
      "review-responder",
      "email-template-generator",
    ],
    results: [
      {
        metric: "Average Ticket",
        value: "+45%",
        description: "Customers choosing premium packages",
      },
      {
        metric: "Quote Conversions",
        value: "68%",
        description: "Up from 34% before",
      },
      {
        metric: "Social Followers",
        value: "+2,100",
        description: "In just 4 months",
      },
      {
        metric: "Price Objections",
        value: "-60%",
        description: "Better value communication",
      },
    ],
    testimonial:
      "I was competing on price with guys working out of their driveways. Now I'm positioned as THE premium detailer in Fredericton. The business description alone made people understand why we charge what we charge. My average job went from $150 to over $200.",
    isFeatured: false,
  },
];

export function getCaseStudies(): CaseStudy[] {
  return caseStudies;
}

export function getFeaturedCaseStudies(): CaseStudy[] {
  return caseStudies.filter((cs) => cs.isFeatured);
}

export function getCaseStudyById(id: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.id === id);
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.businessSlug === slug);
}
