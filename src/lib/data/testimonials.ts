import type { Testimonial } from "@/lib/types";

export const testimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    businessId: "isaacs-way",
    businessName: "Isaac's Way",
    businessCategory: "Restaurants",
    personName: "Sarah Mitchell",
    personTitle: "Owner & Head Chef",
    personImage: "https://picsum.photos/seed/sarah/200/200",
    quote:
      "The AI tools have completely transformed how we handle customer feedback. What used to take hours now takes minutes, and our response rate has gone through the roof.",
    challenge:
      "As a busy restaurant owner, I was spending 3-4 hours every week just responding to online reviews. I knew engagement was important, but it was eating into time I needed for menu planning and staff management.",
    solution:
      "FreddyBeach's Review Response Assistant generates personalized, professional responses in seconds. I review them, make minor tweaks, and post. The AI captures our restaurant's voice perfectly.",
    results: [
      "Response time reduced from 3 days to same-day",
      "Review response rate increased from 40% to 95%",
      "Overall rating improved from 4.5 to 4.8 stars",
      "Saved approximately 12 hours per month",
    ],
    isFeatured: true,
  },
  {
    id: "testimonial-2",
    businessId: "reads-beans",
    businessName: "Read's Beans Coffee",
    businessCategory: "Cafes & Bakeries",
    personName: "Marcus Chen",
    personTitle: "Founder & Roaster",
    personImage: "https://picsum.photos/seed/marcus/200/200",
    quote:
      "I'm a coffee roaster, not a marketer. The Social Post Generator helps me share our story consistently without spending hours I don't have on social media.",
    challenge:
      "We're a small team focused on roasting great coffee. Social media felt like a full-time job we couldn't afford. Our online presence was inconsistent at best.",
    solution:
      "The AI generates a week's worth of engaging posts in about 10 minutes. It knows our brand voice, highlights our specialties, and even suggests optimal posting times.",
    results: [
      "Instagram followers grew 150% in 6 months",
      "Consistent 5 posts per week (up from 1-2)",
      "Foot traffic increased 25% from social referrals",
      "Saved 8+ hours per week on content creation",
    ],
    isFeatured: true,
  },
  {
    id: "testimonial-3",
    businessId: "wellness-collective",
    businessName: "Fredericton Wellness Collective",
    businessCategory: "Healthcare & Wellness",
    personName: "Dr. Emily Tran",
    personTitle: "Naturopathic Doctor & Clinic Director",
    personImage: "https://picsum.photos/seed/emily/200/200",
    quote:
      "The Done-For-You automation package was exactly what our growing practice needed. We've streamlined everything from appointment reminders to follow-up emails.",
    challenge:
      "Our clinic was growing rapidly, but our administrative processes couldn't keep up. We were losing potential patients due to slow response times and inconsistent follow-ups.",
    solution:
      "The FreddyBeach team implemented a complete automation system: intake forms, appointment reminders, follow-up sequences, and review requests. Everything runs smoothly now.",
    results: [
      "No-show rate dropped from 15% to under 3%",
      "New patient inquiries handled within 2 hours",
      "Administrative time reduced by 20 hours/week",
      "Patient satisfaction scores up 40%",
    ],
    isFeatured: true,
  },
  {
    id: "testimonial-4",
    businessId: "atlantic-threads",
    businessName: "Atlantic Threads Boutique",
    businessCategory: "Retail & Shopping",
    personName: "Jennifer MacNeil",
    personTitle: "Owner & Buyer",
    personImage: "https://picsum.photos/seed/jennifer/200/200",
    quote:
      "The Business Description Writer helped us completely revamp our online presence. Our website copy finally sounds as good as our store looks.",
    challenge:
      "I have an eye for fashion but struggle with words. Our website descriptions were bland and didn't capture what makes our boutique special. We were losing online sales to competitors.",
    solution:
      "The AI generated compelling descriptions for all our products and services. It captured our brand essence—sustainable, curated, Atlantic Canadian—in every word.",
    results: [
      "Website conversion rate increased 45%",
      "Average time on site doubled",
      "Online sales grew 60% quarter-over-quarter",
      "Updated 200+ product descriptions in 2 days",
    ],
    isFeatured: false,
  },
  {
    id: "testimonial-5",
    businessId: "freddy-plumbing",
    businessName: "Freddy Beach Plumbing",
    businessCategory: "Home Services",
    personName: "Mike Thompson",
    personTitle: "Owner & Master Plumber",
    personImage: "https://picsum.photos/seed/mike/200/200",
    quote:
      "I was skeptical about AI for a trades business, but the review responses alone have been worth it. Customers appreciate the quick, professional follow-ups.",
    challenge:
      "Between running jobs and managing a crew, I had zero time for marketing. Our Google reviews were going unanswered, and we weren't getting the word out about our services.",
    solution:
      "Started with the free tier to test the waters. Within a month, I upgraded to Enhanced because the time savings were undeniable. Now we respond to every review within 24 hours.",
    results: [
      "Google rating improved from 4.2 to 4.6 stars",
      "Inbound calls increased 30%",
      "Review volume doubled in 3 months",
      "ROI of 10x on the Enhanced subscription",
    ],
    isFeatured: false,
  },
];

export function getFeaturedTestimonials(): Testimonial[] {
  return testimonials.filter((t) => t.isFeatured);
}

export function getTestimonialById(id: string): Testimonial | undefined {
  return testimonials.find((t) => t.id === id);
}

export function getTestimonialByBusinessId(businessId: string): Testimonial | undefined {
  return testimonials.find((t) => t.businessId === businessId);
}
