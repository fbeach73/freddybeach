# Batch 2: Marketing Pages - Implementation Plan

## Overview
Build three marketing pages: AI Tools Showcase, Success Stories, and Consultation Services.

---

## Phase 1: Foundation Components

### 1.1 Create Marketing Components Directory
- [x] Create `src/components/marketing/` directory

### 1.2 Section Hero Component
**File:** `src/components/marketing/section-hero.tsx`
- [x] Create SectionHero component with props: title, subtitle, badges, primaryCTA, secondaryCTA
- [x] Add gradient background option
- [x] Implement responsive layout (text-center on mobile, larger on desktop)
- [x] Add dark mode support

### 1.3 Pricing Card Component
**File:** `src/components/marketing/pricing-card.tsx`
- [x] Create PricingCard accepting PricingTier type from packages.ts
- [x] Display price, period, description, features list
- [x] Add "Popular" badge variant
- [x] Style CTA button with tier-appropriate colors
- [x] Add checkmark icons for features

### 1.4 Pricing Grid Component
**File:** `src/components/marketing/pricing-grid.tsx`
- [x] Create PricingGrid that maps over pricingTiers
- [x] Three-column responsive layout (stack on mobile)
- [x] Highlight middle column as recommended
- [x] Import and use PricingCard component

### 1.5 Trust Signals Component
**File:** `src/components/marketing/trust-signals.tsx`
- [x] Create TrustSignals with stats display
- [x] Props: stats array with label, value, icon
- [x] Horizontal layout on desktop, grid on mobile
- [x] Optional testimonial quote slot

### 1.6 CTA Section Component
**File:** `src/components/marketing/cta-section.tsx`
- [x] Create CTASection with gradient background
- [x] Props: headline, subheadline, primaryCTA, secondaryCTA
- [x] Include TrustSignals below CTAs
- [x] Dark mode gradient variant

---

## Phase 2: AI Tool Demo Components

### 2.1 AI Tool Demo Component
**File:** `src/components/marketing/ai-tool-demo.tsx`
- [x] Create AIToolDemo component accepting AITool type
- [x] Left panel: Input textarea with example pre-filled
- [x] Right panel: Output display area
- [x] "Generate" button with loading state
- [x] Mock response flow: click → skeleton → show exampleOutput after 1.5s delay
- [x] Tier badge showing "Free" or "Premium"

### 2.2 Demo Response Card Component
**File:** `src/components/marketing/demo-response-card.tsx`
- [x] Create DemoResponseCard for displaying generated responses
- [x] Copy button with success feedback
- [x] "Regenerate" button (shuffles to show same response)
- [x] Character/word count display

### 2.3 Tool Preview Card Component
**File:** `src/components/marketing/tool-preview-card.tsx`
- [x] Create ToolPreviewCard for the "All Tools" grid
- [x] Display icon, name, short description
- [x] Tier badge
- [x] CTA button based on tier

---

## Phase 3: AI Tools Showcase Page

### 3.1 Create Page File
**File:** `src/app/ai-tools/page.tsx`
- [x] Create page.tsx with metadata (title, description)
- [x] Import all required components and data

### 3.2 Hero Section
- [x] Add SectionHero with AI tools value proposition
- [x] Primary CTA: "Get Started Free" linking to claim flow
- [x] Secondary CTA: "View Pricing" anchor to pricing section

### 3.3 Pricing Comparison Section
- [x] Add section with id="pricing" for anchor link
- [x] Add SectionHeader: "Choose Your Plan"
- [x] Render PricingGrid component

### 3.4 Interactive Demos Section
- [x] Add SectionHeader: "See AI Tools in Action"
- [x] Render two AIToolDemo components:
  - [x] Review Response Assistant (id: "review-responder")
  - [x] Social Post Generator (id: "social-post-generator")
- [x] Use Tabs component to switch between demos on mobile

### 3.5 All Tools Grid Section
- [x] Add SectionHeader: "All AI Tools"
- [x] Map over aiTools and render ToolPreviewCard for each
- [x] 2-column grid on tablet, 4-column on desktop

### 3.6 Bottom CTA Section
- [x] Add CTASection with "Ready to Save Hours?" messaging
- [x] Include trust signals with mock stats

---

## Phase 4: Case Studies Data & Components

### 4.1 Create Case Studies Data
**File:** `src/lib/data/case-studies.ts`
- [x] Define CaseStudy interface
- [x] Create 5 case study objects with:
  - [x] Coastal Cuts Barbershop (Beauty)
  - [x] Maritime Tech Solutions (Professional Services)
  - [x] The Green Plate Bistro (Restaurants)
  - [x] Sunrise Yoga Studio (Fitness)
  - [x] Northside Auto Detailing (Automotive)
- [x] Include challenge, solution, results arrays, testimonial
- [x] Export helper functions: getCaseStudies(), getCaseStudyById()

### 4.2 Add CaseStudy Type
**File:** `src/lib/types/index.ts`
- [x] Add CaseStudy interface export
- [x] Add Result type with metric, value, description

### 4.3 Case Study Card Component
**File:** `src/components/marketing/case-study-card.tsx`
- [x] Create CaseStudyCard accepting CaseStudy type
- [x] Business image and name header
- [x] Category badge
- [x] "The Challenge" section with bullet points
- [x] "The Solution" section with tool badges
- [x] "The Results" section with metric highlight boxes
- [x] Testimonial quote with owner name/title
- [x] Responsive: full width on mobile, cards on desktop

### 4.4 Result Metric Component
**File:** `src/components/marketing/result-metric.tsx`
- [x] Create ResultMetric component
- [x] Large value display (e.g., "8 hours")
- [x] Metric label below
- [x] Optional description tooltip
- [x] Highlight background color

---

## Phase 5: Success Stories Page

### 5.1 Create Page File
**File:** `src/app/success-stories/page.tsx`
- [x] Create page.tsx with metadata
- [x] Import case studies data and components

### 5.2 Hero Section
- [x] Add SectionHero: "Real Results from Real Fredericton Businesses"
- [x] Stats bar below hero: businesses helped, hours saved, avg ROI

### 5.3 Case Studies Grid
- [x] Add SectionHeader: "Featured Success Stories"
- [x] Map over case studies and render CaseStudyCard
- [x] Single column layout (each case study is full-width card)
- [x] Alternating layout option (image left/right)

### 5.4 "Your Story" CTA Section
- [x] Add CTASection: "Your Success Story Starts Here"
- [x] Primary CTA: "Book Free AI Audit" → /consultation
- [x] Secondary CTA: "Browse AI Tools" → /ai-tools

---

## Phase 6: Consultation Components

### 6.1 Consultation Card Component
**File:** `src/components/marketing/consultation-card.tsx`
- [x] Create ConsultationCard accepting ConsultationPackage type
- [x] Header with name, price, timeline badge
- [x] "Perfect for:" tagline
- [x] Features list with checkmarks
- [x] Expected outcomes list
- [x] CTA button
- [x] "Most Popular" highlight variant

### 6.2 Booking Calendar Component
**File:** `src/components/marketing/booking-calendar.tsx`
- [x] Create BookingCalendar component
- [x] Display 2-week date grid
- [x] Time slot buttons for each day (9am, 10am, 11am, 2pm, 3pm, 4pm)
- [x] State: selectedDate, selectedTime
- [x] Disable unavailable slots (use mock data)
- [x] Highlight selected slot
- [x] "Book This Time" button
- [x] Success dialog/toast on booking (mock)

### 6.3 Create Booking Slots Data
**File:** `src/lib/data/booking-slots.ts`
- [x] Define BookingSlot interface
- [x] Generate 2 weeks of mock slots
- [x] Mix of available/unavailable for realism
- [x] Export getAvailableSlots(), isSlotAvailable()

### 6.4 Contact Form Component
**File:** `src/components/marketing/contact-form.tsx`
- [x] Create ContactForm using react-hook-form + zod
- [x] Fields: name, email, businessName, challenge (textarea), preferredPackage (select)
- [x] Validation schema with error messages
- [x] Submit handler shows success toast (mock)
- [x] Loading state on submit button

---

## Phase 7: Consultation Page

### 7.1 Create Page File
**File:** `src/app/consultation/page.tsx`
- [x] Create page.tsx with metadata
- [x] Import packages data and components

### 7.2 Hero Section
- [x] Add SectionHero: "Custom AI Solutions for Your Business"
- [x] Trust badges: "Locally Owned", "15+ Years Experience"

### 7.3 Packages Section
- [x] Add SectionHeader: "Choose Your Package"
- [x] Three-column grid of ConsultationCard components
- [x] Highlight "Automation Blueprint" as most popular

### 7.4 Booking Section
- [x] Add SectionHeader: "Book Your Consultation"
- [x] Two-column layout: BookingCalendar | ContactForm
- [x] Stack on mobile

### 7.5 Trust Signals Section
- [x] Add TrustSignals component
- [x] Local business messaging
- [x] Experience stats
- [x] Money-back guarantee badge
- [x] Optional: Testimonial slider (reuse TestimonialSection)

---

## Phase 8: Navigation & Polish

### 8.1 Update Site Header
**File:** `src/components/site-header.tsx`
- [x] Verify "AI Tools" nav item links to /ai-tools
- [x] Verify "Success Stories" nav item links to /success-stories
- [x] Add "Consultation" link if not present

### 8.2 Run Lint & Typecheck
- [x] Run `npm run lint` and fix any errors
- [x] Run `npm run typecheck` and fix any type errors

### 8.3 Responsive Testing
- [x] Test all three pages on mobile viewport (375px)
- [x] Test all three pages on tablet viewport (768px)
- [x] Test all three pages on desktop viewport (1280px)

### 8.4 Dark Mode Testing
- [x] Test all three pages in dark mode
- [x] Verify contrast and readability
- [x] Fix any dark mode styling issues

---

## File Summary

### New Files to Create
```
src/components/marketing/
├── section-hero.tsx
├── pricing-card.tsx
├── pricing-grid.tsx
├── trust-signals.tsx
├── cta-section.tsx
├── ai-tool-demo.tsx
├── demo-response-card.tsx
├── tool-preview-card.tsx
├── case-study-card.tsx
├── result-metric.tsx
├── consultation-card.tsx
├── booking-calendar.tsx
└── contact-form.tsx

src/lib/data/
├── case-studies.ts
└── booking-slots.ts

src/app/
├── ai-tools/
│   └── page.tsx
├── success-stories/
│   └── page.tsx
└── consultation/
    └── page.tsx
```

### Files to Modify
```
src/lib/types/index.ts (add CaseStudy, BookingSlot types)
src/components/site-header.tsx (verify nav links)
```

### Existing Files to Reference
```
src/lib/data/packages.ts (pricingTiers, consultationPackages)
src/lib/data/ai-tools.ts (aiTools)
src/components/shared/page-header.tsx (PageHeader, SectionHeader patterns)
src/components/home/testimonial-section.tsx (testimonial patterns)
```
