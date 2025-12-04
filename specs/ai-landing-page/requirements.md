# AI-Focused Landing Page - Requirements

## Overview
Create a new landing page to replace the current homepage, repositioning the site's primary focus from directory listings to AI-powered business tools. The main "hook" is the AI Image Generator (Nano Banana Pro/Gemini), with the directory becoming a secondary feature.

## Business Goals
- Drive user sign-ups through compelling AI tool value proposition
- Showcase the AI Image Generator as the primary product offering
- Maintain visibility of the business directory as a secondary feature
- Encourage consultation bookings for custom AI solutions
- Build trust through testimonials from local businesses

## User Requirements

### Target Audience
- Local businesses in Fredericton, NB
- Business owners looking for automation/AI solutions
- Users interested in AI image generation for marketing materials

### Key User Actions
1. Sign up for free account to access AI tools
2. Try the AI Image Generator
3. Explore the business directory
4. Book a consultation for custom solutions

## Page Sections (Top to Bottom)

### 1. AI Hero Section
- **Purpose**: Lead with the AI Image Generator value proposition
- **Content**:
  - Badge: "AI-Powered Business Tools"
  - Headline: "Create Stunning AI Images for Your Business"
  - Subheadline: Focus on helping businesses with automation/AI challenges
  - Hero visual: Static image showcasing AI-generated results (not interactive demo)
  - Primary CTA: "Get Started Free" → Opens AuthDialog (sign-up tab)
  - Secondary CTA: "See Our Tools" → Scrolls to AI tools section

### 2. Featured Businesses Section
- **Purpose**: Maintain directory presence without overwhelming the AI focus
- **Content**:
  - Section header: "Featured Local Businesses"
  - Carousel of featured business listings (reuse existing component)
  - Link: "Explore the full directory" → `/search`

### 3. AI Tools Grid Section
- **Purpose**: Showcase all available and upcoming AI tools
- **Content**:
  - Section header: "AI Tools for Your Business"
  - 4-column responsive grid of tool cards
  - Display order: AI Image Generator first, then other tools
  - Badges:
    - "Live" (green) for available tools
    - "Coming Soon" (amber) for upcoming tools
  - Tools to display:
    1. AI Image Generator (Live)
    2. Review Response Assistant (Coming Soon)
    3. Social Post Generator (Coming Soon)
    4. Business Description Writer (Coming Soon)
    5. Email Template Generator (Coming Soon)

### 4. Testimonials Slider Section
- **Purpose**: Build trust and social proof
- **Content**:
  - Section header: "What Local Businesses Are Saying"
  - Carousel slider with all 5 existing testimonials
  - Dot indicators for navigation
  - Responsive arrows on tablet/desktop
- **Testimonials to use** (from existing data):
  1. Sarah Mitchell - Isaac's Way (Restaurant)
  2. Marcus Chen - Read's Beans Coffee (Cafe)
  3. Dr. Emily Tran - Wellness Collective (Healthcare)
  4. Jennifer MacNeil - Atlantic Threads (Retail)
  5. Mike Thompson - Freddy Beach Plumbing (Home Services)

### 5. Consultation CTA Section
- **Purpose**: Drive high-intent users to book expert consultations
- **Content**:
  - Full-width section with gradient background
  - Headline: "Ready to Transform Your Business with AI?"
  - Subheadline: Value proposition for consultation services
  - CTA: "Book a Free Consultation" → `/consultation`
  - Optional: Trust signals (years experience, businesses helped)

## Design Requirements

### Visual Style
- Consistent with existing site design (shadcn/ui, Tailwind CSS)
- Engaging and modern feel
- Hero section should feel premium/innovative

### Responsive Breakpoints
| Section | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) |
|---------|-----------------|---------------------|-------------------|
| Hero | Stacked layout, full-width CTAs | Side-by-side CTAs | 2-column layout |
| Featured | 1 card visible | 2 cards visible | 3 cards visible |
| AI Tools | 1 column | 2 columns | 4 columns |
| Testimonials | 1/slide + dots | 1/slide + arrows + dots | 1/slide + arrows + dots |
| Consultation | Centered, stacked | Centered | Centered |

## Constraints

### Must NOT Include
- Pricing section or pricing information
- Interactive demo of the image generator (just visual + CTA)
- Any new shadcn/ui components (use existing)

### Must Include
- Backup of current homepage at `/home-12-04-25`
- Sign-up/Sign-in CTAs as primary conversion paths
- All 5 existing testimonials (already reference AI tools)

## Technical Requirements

### Components to Reuse
- `AuthDialog` - Sign up/sign in modal
- `FeaturedBusinessesCarousel` - Business carousel
- `ToolPreviewCard` - Tool cards with badges
- `TestimonialCard` - Individual testimonial display
- `SectionHeader` - Consistent section headers
- shadcn/ui: `Button`, `Badge`, `Card`, `Carousel`

### Data Sources
- Featured businesses: `getFeaturedBusinessesFromDb()` from `src/lib/data/businesses-db.ts`
- AI tools: `getSortedTools()` from `src/lib/data/ai-tools.ts`
- Testimonials: `testimonials` array from `src/lib/data/testimonials.ts`

### Badge Update
- Change "Available Now" badge text to "Live" in `ToolPreviewCard`
- Keep green styling for "Live" badge
- Keep amber styling for "Coming Soon" badge

## Success Criteria
- Page loads without errors
- All responsive breakpoints work correctly
- AuthDialog opens from hero CTA
- All navigation links work
- Testimonial slider functions with touch/swipe on mobile
- Backup page accessible at `/home-12-04-25`
- `pnpm lint` and `pnpm typecheck` pass
