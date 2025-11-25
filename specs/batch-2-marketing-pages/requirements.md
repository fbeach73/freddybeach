# Batch 2: Marketing Pages - Requirements

## Overview

Build three marketing pages for the FreddyBeach Directory to showcase AI tools, display success stories, and offer consultation services. All pages should follow the existing design system, support dark mode, and be mobile-first responsive.

---

## Page 1: AI Tools Showcase (`/ai-tools`)

### Purpose
Showcase the AI-powered tools available to businesses and drive conversions for paid tiers.

### Sections

#### 1.1 Hero Section
- Headline: "AI-Powered Tools for Fredericton Businesses"
- Subheadline explaining the three-tier value proposition
- Primary CTA: "Get Started Free"
- Secondary CTA: "View Pricing"

#### 1.2 Pricing Comparison Grid
Three columns displaying tiers from `packages.ts`:

| FREE | Enhanced ($99/yr) | Featured ($199/yr) |
|------|-------------------|---------------------|
| Basic listing | Enhanced listing | Featured listing |
| 2 AI tools | All 4 AI tools | All AI tools |
| 5 generations/mo | 100 generations/mo | Unlimited |
| Community support | Email support | Priority support |

- Enhanced column highlighted as "Best Value"
- Each tier has CTA button matching `pricingTiers.ctaText`

#### 1.3 Interactive Tool Demos
Display 2 tool demos using data from `ai-tools.ts`:

**Review Response Assistant Demo:**
- Sample review input (pre-filled from `exampleInput`)
- "Generate Responses" button
- On click: Show loading skeleton, then display `exampleOutput`
- Generate 3 response variations with copy buttons
- Badge: "Free Tool"

**Social Post Generator Demo:**
- Business description input (pre-filled from `exampleInput`)
- Platform selector (Instagram, Facebook, Twitter)
- "Generate Post" button
- Display `exampleOutput` with copy button
- Badge: "Free Tool"

#### 1.4 All Tools Preview
Grid showing all 4 AI tools with:
- Icon, name, short description
- Tier badge (Free or Enhanced)
- "Try Free" or "Unlock with Enhanced" button

#### 1.5 CTA Section
- Gradient background
- Headline: "Ready to Save Hours Every Week?"
- Subheadline: "Join 50+ Fredericton businesses already using AI"
- Primary CTA: "Claim Your Business Today"
- Trust signals: Local business count, hours saved, money saved stats

---

## Page 2: Success Stories (`/success-stories`)

### Purpose
Build trust through real-world case studies showing measurable results.

### Sections

#### 2.1 Hero Section
- Headline: "Real Results from Real Fredericton Businesses"
- Subheadline about local success stories
- Stats bar: Total hours saved, businesses helped, average ROI

#### 2.2 Case Study Cards (5 total)
Create NEW fictional businesses (not from existing mock data):

**Case Study 1: Coastal Cuts Barbershop**
- Category: Beauty & Personal Care
- Challenge: Spending 2+ hours weekly responding to Google reviews
- Solution: Review Response Assistant
- Results:
  - "8 hours saved per month"
  - "Response time: 2 days → 2 hours"
  - "4.8 → 4.9 star rating"
- Testimonial: Owner quote about time savings

**Case Study 2: Maritime Tech Solutions**
- Category: Professional Services
- Challenge: Inconsistent social media presence
- Solution: Social Post Generator
- Results:
  - "200% increase in engagement"
  - "12 posts/week (up from 2)"
  - "$3,200 saved on marketing agency"
- Testimonial: Owner quote about growth

**Case Study 3: The Green Plate Bistro**
- Category: Restaurants
- Challenge: Generic, outdated business descriptions
- Solution: Business Description Writer
- Results:
  - "30% more profile clicks"
  - "15% increase in reservations"
  - "SEO ranking improved"
- Testimonial: Owner quote about visibility

**Case Study 4: Sunrise Yoga Studio**
- Category: Fitness & Sports
- Challenge: Manual appointment confirmations eating time
- Solution: Full automation package (consultation)
- Results:
  - "15 hours saved per week"
  - "No-show rate: 25% → 8%"
  - "$18,000 annual savings"
- Testimonial: Owner quote about transformation

**Case Study 5: Northside Auto Detailing**
- Category: Automotive
- Challenge: Low email open rates, no templates
- Solution: Email Template Generator
- Results:
  - "50% increase in bookings"
  - "Open rate: 12% → 45%"
  - "Customer retention up 30%"
- Testimonial: Owner quote about customer engagement

#### 2.3 Bottom CTA Section
- Headline: "Your Success Story Starts Here"
- Subheadline about getting started
- Primary CTA: "Book Free AI Audit"
- Secondary CTA: "Browse AI Tools"

---

## Page 3: Consultation Services (`/consultation`)

### Purpose
Drive high-value consultation bookings with clear package offerings.

### Sections

#### 3.1 Hero Section
- Headline: "Custom AI Solutions for Your Business"
- Subheadline about local, personalized service
- Trust badges: "Locally Owned", "15+ Years Experience"

#### 3.2 Consultation Package Cards
Three cards using data from `consultationPackages` in `packages.ts`:

**AI Quick Start ($500)**
- "Perfect for: First-time AI users"
- Features list from `consultationPackages[0].features`
- Outcomes list from `consultationPackages[0].outcomes`
- Timeline badge: "1-2 weeks"
- CTA: "Get Started"

**Automation Blueprint ($2,500)** - Highlighted as "Most Popular"
- "Perfect for: Growing businesses"
- Features list from `consultationPackages[1].features`
- Outcomes list from `consultationPackages[1].outcomes`
- Timeline badge: "4-6 weeks"
- CTA: "Schedule Discovery Call"

**Done-For-You ($5,000+)**
- "Perfect for: Businesses ready to scale"
- Features list from `consultationPackages[2].features`
- Outcomes list from `consultationPackages[2].outcomes`
- Timeline badge: "8-12 weeks"
- CTA: "Let's Talk"

#### 3.3 Booking Calendar
Functional calendar widget with:
- 2-week view of available time slots
- Morning (9am-12pm) and afternoon (1pm-5pm) slots on weekdays
- Some slots marked as unavailable for realism
- Click to select slot
- Selected slot confirmation UI
- "Book This Time" button (shows success toast, mock only)

#### 3.4 Contact Form
For custom inquiries:
- Fields: Name, Email, Business Name, Current Challenge (textarea), Preferred Package (dropdown)
- Validation using react-hook-form + zod
- Submit shows success message (mock only)

#### 3.5 Trust Signals Section
- "Locally owned and operated in Fredericton"
- "15+ years combined AI/automation experience"
- Client testimonial slider (reuse from homepage or create 2-3 new)
- "Money-back guarantee if not satisfied"

---

## Technical Requirements

### Data Sources
- Pricing tiers: `src/lib/data/packages.ts` → `pricingTiers`
- Consultation packages: `src/lib/data/packages.ts` → `consultationPackages`
- AI tools: `src/lib/data/ai-tools.ts` → `aiTools`
- New case studies: Create `src/lib/data/case-studies.ts`
- Booking slots: Create `src/lib/data/booking-slots.ts`

### Components to Use
- shadcn/ui: Card, Button, Badge, Tabs, Input, Textarea, Select, Skeleton, Dialog
- Existing: PageHeader, SectionHeader, TierBadge
- New: Create reusable marketing components

### Design Requirements
- Follow OKLCH color system from globals.css
- Dark mode support for all components
- Mobile-first responsive (breakpoints: sm, md, lg)
- Consistent spacing using Tailwind defaults
- Use existing font families (Oxanium, Merriweather)

### Accessibility
- Proper heading hierarchy (h1 → h2 → h3)
- Keyboard navigation for interactive elements
- ARIA labels for buttons and forms
- Color contrast compliance

---

## Out of Scope
- Backend API integration (all mock data)
- Payment processing
- Actual calendar booking functionality
- Email sending
- User authentication checks on pages (public pages)
