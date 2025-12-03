import type { AITool } from "@/lib/types";

export const aiTools: AITool[] = [
  {
    id: "review-responder",
    name: "Review Response Assistant",
    slug: "review-responder",
    description:
      "Generate professional, personalized responses to customer reviews in seconds. Our AI understands context, sentiment, and your brand voice to craft responses that build customer relationships and improve your online reputation.",
    shortDescription: "AI-powered review response generator",
    icon: "MessageSquareText",
    tier: "free",
    status: "coming-soon",
    usageCount: 12847,
    exampleInput:
      "Great food and atmosphere! The salmon was cooked perfectly and our server Alex was fantastic. Only giving 4 stars because the wait for a table was over 30 minutes even with a reservation. Will definitely come back though!",
    exampleOutput: `Thank you so much for your wonderful feedback! We're thrilled to hear that you enjoyed the salmon and that Alex took such great care of you - we'll be sure to pass along your kind words to him!

We sincerely apologize for the longer-than-expected wait time for your table. This isn't the experience we strive to provide, especially for guests with reservations. We're actively working to improve our table management during peak hours.

We truly appreciate your understanding and look forward to welcoming you back soon. Your next visit is on us - please reach out and we'll take care of that wait time issue personally.

Warm regards,
The Isaac's Way Team`,
    features: [
      "Sentiment analysis for appropriate tone",
      "Brand voice customization",
      "Multiple response variations",
      "One-click copy to clipboard",
      "Works with Google, Yelp, Facebook reviews",
    ],
  },
  {
    id: "social-post-generator",
    name: "Social Post Generator",
    slug: "social-post-generator",
    description:
      "Create engaging social media content tailored to your business. Generate posts for Instagram, Facebook, Twitter/X, and LinkedIn that capture your brand personality and drive engagement with your local audience.",
    shortDescription: "Create engaging social media content instantly",
    icon: "Share2",
    tier: "free",
    status: "coming-soon",
    usageCount: 8932,
    exampleInput:
      "We're a local coffee shop that just started carrying a new single-origin Ethiopian coffee. We want to announce it on Instagram.",
    exampleOutput: `NEW ARRIVAL ALERT! ☕✨

Say hello to our new single-origin Ethiopian Yirgacheffe - and trust us, your taste buds will thank you.

🫘 Tasting notes: Bright citrus, blueberry sweetness, and a smooth floral finish
🌍 Sourced directly from smallholder farmers in the Gedeo Zone
☕ Available now for drip, pour-over, or take home a bag

First 20 customers to try it get a FREE pastry pairing!

Stop by this weekend and taste what everyone's talking about. Your new favorite coffee is waiting.

📍 123 King Street, Fredericton
⏰ Open 7am-6pm

#FrederictonCoffee #SingleOrigin #EthiopianCoffee #LocalCoffeeShop #FreddyBeach #NewBrunswickFood #CoffeeLovers`,
    features: [
      "Platform-specific formatting",
      "Hashtag suggestions for local reach",
      "Emoji and tone customization",
      "Image caption generation",
      "Content calendar planning",
    ],
  },
  {
    id: "business-description-writer",
    name: "Business Description Writer",
    slug: "business-description-writer",
    description:
      "Craft compelling business descriptions that convert visitors into customers. Perfect for your website, Google Business Profile, directory listings, and marketing materials. SEO-optimized and locally relevant.",
    shortDescription: "Compelling business descriptions that convert",
    icon: "PenLine",
    tier: "enhanced",
    status: "coming-soon",
    usageCount: 4521,
    exampleInput:
      "We're a yoga studio in downtown Fredericton. We offer classes for all levels, from beginner to advanced. We have hot yoga, vinyasa, restorative, and prenatal classes. Our studio has been open for 5 years.",
    exampleOutput: `**The Yoga Loft - Your Downtown Fredericton Yoga Sanctuary**

For five years, The Yoga Loft has been Fredericton's welcoming space for mindful movement and transformation. Whether you're unrolling your mat for the first time or deepening a decades-long practice, our experienced instructors meet you exactly where you are.

**Our Classes:**
- **Vinyasa Flow** - Dynamic, breath-linked movement for strength and flexibility
- **Hot Yoga** - Detoxifying practice in our infrared-heated studio
- **Restorative** - Gentle, prop-supported poses for deep relaxation
- **Prenatal** - Safe, nurturing practice for expecting mothers

**What Sets Us Apart:**
Located in the heart of downtown, our light-filled second-floor studio offers an escape from the everyday. Small class sizes ensure personalized attention, and our diverse schedule fits every lifestyle.

Drop in anytime or explore our unlimited monthly membership for the full Yoga Loft experience. Your mat is waiting.

*New students: Your first class is always free.*`,
    features: [
      "SEO keyword optimization",
      "Multiple format outputs (short/long)",
      "Tone matching (professional, casual, luxury)",
      "Local SEO focus for Fredericton",
      "Google Business Profile formatting",
    ],
  },
  {
    id: "email-template-generator",
    name: "Email Template Generator",
    slug: "email-template-generator",
    description:
      "Create professional email templates for every business need. From appointment confirmations to promotional campaigns, generate emails that get opened, read, and acted upon.",
    shortDescription: "Professional email templates for every occasion",
    icon: "Mail",
    tier: "enhanced",
    status: "coming-soon",
    usageCount: 3187,
    exampleInput:
      "I need an appointment reminder email for my dental clinic. The appointment is tomorrow and I want to remind them to arrive 10 minutes early.",
    exampleOutput: `**Subject: Your Appointment Tomorrow at Downtown Family Dental**

Hi [Patient Name],

This is a friendly reminder about your upcoming appointment:

📅 **Date:** [Tomorrow's Date]
🕐 **Time:** [Appointment Time]
📍 **Location:** 89 Smythe Street, Fredericton

**Please arrive 10 minutes early** to complete any necessary paperwork and ensure we can start your appointment on time.

**Before Your Visit:**
- Bring your insurance card and photo ID
- Let us know about any changes to your health or medications
- Feel free to bring headphones if you'd like to listen to music during your treatment

**Need to Reschedule?**
We understand plans change! Please call us at (506) 555-0502 or reply to this email at least 24 hours in advance if you need to reschedule.

We look forward to seeing you tomorrow!

Warm regards,

The Downtown Family Dental Team
📞 (506) 555-0502
🌐 downtownfamilydental.ca`,
    features: [
      "Appointment reminders & confirmations",
      "Promotional campaign templates",
      "Follow-up sequences",
      "Re-engagement emails",
      "Seasonal & holiday templates",
    ],
  },
  {
    id: "image-generator",
    name: "AI Image Generator",
    slug: "image-generator",
    description:
      "Create stunning AI-generated images with Google's Gemini. Use avatars for consistent characters across generations, refine your creations with natural language, and share your best work to the community gallery. Perfect for social media graphics, marketing materials, and creative projects.",
    shortDescription: "Generate professional images with AI",
    icon: "Image",
    tier: "free",
    status: "available",
    usageCount: 2156,
    exampleInput:
      "A cozy coffee shop interior in downtown Fredericton, warm lighting, exposed brick walls, customers enjoying their drinks, autumn leaves visible through the window",
    exampleOutput:
      "Your AI-generated image shows a beautifully rendered coffee shop scene with warm amber lighting casting soft shadows across exposed red brick walls. A few patrons sit at wooden tables, steam rising from their cups. Through the large storefront window, golden and crimson autumn leaves drift past, and the Saint John River is visible in the distance.",
    features: [
      "High-resolution image generation (1K, 2K, 4K)",
      "Multiple aspect ratios for different platforms",
      "Avatar system for consistent characters",
      "Conversational refinement of images",
      "Save presets for quick generation",
      "Share to community gallery",
    ],
  },
];

export function getToolBySlug(slug: string): AITool | undefined {
  return aiTools.find((tool) => tool.slug === slug);
}

export function getToolById(id: string): AITool | undefined {
  return aiTools.find((tool) => tool.id === id);
}

export function getFreeTools(): AITool[] {
  return aiTools.filter((tool) => tool.tier === "free");
}

export function getPremiumTools(): AITool[] {
  return aiTools.filter((tool) => tool.tier !== "free");
}

export function getAvailableTools(): AITool[] {
  return aiTools.filter((tool) => tool.status === "available");
}

export function getComingSoonTools(): AITool[] {
  return aiTools.filter((tool) => tool.status === "coming-soon");
}

export function getSortedTools(): AITool[] {
  // Return available tools first, then coming soon
  return [...getAvailableTools(), ...getComingSoonTools()];
}
