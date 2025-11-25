# Homepage & Layout Components - Implementation Plan

## Overview

Phased implementation plan for building the FreddyBeach.com homepage and layout components. UI/UX prototyping with mock data.

---

## Phase 1: Foundation & Utilities ✅

### Tasks

- [x] Create `src/lib/utils/icons.tsx` - Icon name to Lucide component mapping
  - Map category icon strings (e.g., "UtensilsCrossed") to React components
  - Export `getIconByName(name: string)` function
  - Fallback to default icon if name not found

### Files to Create

| File | Description |
|------|-------------|
| `src/lib/utils/icons.tsx` | Dynamic icon mapping utility |

---

## Phase 2: Layout Components ✅

### Tasks

- [x] Update `src/components/site-header.tsx`
  - Add "Browse" nav item linking to `/search`
  - Keep AI Tools and Success Stories
  - Remove Consultation (simplify to 3 nav items)

- [x] Rewrite `src/components/site-footer.tsx`
  - Create 4-column grid layout (stacked on mobile)
  - Column 1: FreddyBeach logo + tagline
  - Column 2: Directory links (Browse, Categories, Add Business)
  - Column 3: Company links (About, Contact, Advertise)
  - Column 4: Legal links (Privacy, Terms)
  - Add separator and bottom bar with copyright

- [x] Verify mobile navigation works correctly
  - Test Sheet component opens/closes
  - Verify nav links work

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/site-header.tsx` | Add Browse nav item |
| `src/components/site-footer.tsx` | Complete rewrite |

---

## Phase 3: Homepage Card Components ✅

### Tasks

- [x] Create `src/components/home/business-card.tsx`
  - Card with Link wrapper to `/business/[slug]`
  - Hero image with aspect-video
  - TierBadge overlay (for enhanced/featured)
  - Business name, RatingStars, shortDescription
  - Address with MapPin icon
  - OpenStatus badge

- [x] Create `src/components/home/category-card.tsx`
  - Card with Link wrapper to `/category/[slug]`
  - Dynamic Lucide icon using `DynamicIcon` component
  - Category name
  - Business count text

- [x] Create `src/components/home/ai-tool-card.tsx`
  - Card with Link wrapper to `/ai-tools`
  - Dynamic icon + tool name + "Free" badge
  - Short description
  - Features list (first 3)
  - "Try it free" button

- [x] Create `src/components/home/testimonial-card.tsx`
  - Quote icon decoration
  - Blockquote with testimonial text
  - Avatar image
  - Person name, title, business name

### Files to Create

| File | Description |
|------|-------------|
| `src/components/home/business-card.tsx` | Featured business card |
| `src/components/home/category-card.tsx` | Category browse card |
| `src/components/home/ai-tool-card.tsx` | AI tool preview card |
| `src/components/home/testimonial-card.tsx` | Testimonial quote card |

---

## Phase 4: Homepage Section Components ✅

### Tasks

- [x] Create `src/components/home/hero-section.tsx`
  - Badge: "Fredericton's Local Business Directory"
  - H1: "Discover Local Businesses in Freddy Beach"
  - Subtitle paragraph
  - Search form with Input + Button
  - Button navigates to `/search`

- [x] Create `src/components/home/featured-businesses-carousel.tsx`
  - SectionHeader with title and "View all" link
  - Carousel component from shadcn/ui
  - Responsive card widths: basis-full / sm:basis-1/2 / lg:basis-1/3
  - CarouselPrevious and CarouselNext buttons
  - Data from `getFeaturedBusinesses()`

- [x] Create `src/components/home/category-grid.tsx`
  - SectionHeader: "Browse by Category"
  - Grid: grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
  - Render CategoryCard for each category
  - Data from `categories`

- [x] Create `src/components/home/ai-tools-teaser.tsx`
  - SectionHeader: "Free AI Tools for Local Businesses"
  - "See all tools" action link
  - Grid: grid-cols-1 md:grid-cols-2
  - Display first 2 tools from `getFreeTools()`

- [x] Create `src/components/home/testimonial-section.tsx`
  - SectionHeader: "What Local Businesses Are Saying"
  - Single TestimonialCard (first featured)
  - Link to success stories page
  - Data from `getFeaturedTestimonials()[0]`

- [x] Create `src/components/home/seo-content.tsx`
  - H2: "Supporting Fredericton's Local Economy"
  - 2-3 static paragraphs about Fredericton
  - Prose styling with muted text

### Files to Create

| File | Description |
|------|-------------|
| `src/components/home/hero-section.tsx` | Hero with search |
| `src/components/home/featured-businesses-carousel.tsx` | Business carousel |
| `src/components/home/category-grid.tsx` | Category grid section |
| `src/components/home/ai-tools-teaser.tsx` | AI tools preview |
| `src/components/home/testimonial-section.tsx` | Testimonial section |
| `src/components/home/seo-content.tsx` | SEO content section |

---

## Phase 5: Page Assembly ✅

### Tasks

- [x] Rewrite `src/app/page.tsx`
  - Import all section components
  - Compose sections in order:
    1. HeroSection
    2. FeaturedBusinessesCarousel
    3. CategoryGrid
    4. AIToolsTeaser
    5. TestimonialSection
    6. SEOContent

- [x] Create `src/app/search/page.tsx`
  - PageHeader: "Search Businesses"
  - EmptyState component with Search icon
  - Title: "Search Coming Soon"
  - Description: "Full search functionality is being built"

- [x] Update `src/app/layout.tsx` metadata
  - Title: "FreddyBeach - Fredericton Business Directory"
  - Description: "Discover local businesses in Fredericton, NB"

### Files to Modify/Create

| File | Changes |
|------|---------|
| `src/app/page.tsx` | Complete rewrite |
| `src/app/search/page.tsx` | New placeholder page |
| `src/app/layout.tsx` | Update metadata |

---

## Phase 6: Verification ✅

### Tasks

- [x] Run `npm run lint` - fix any ESLint errors
- [x] Run `npm run typecheck` - fix any TypeScript errors
- [x] Manual testing:
  - [x] Homepage loads without errors
  - [x] All sections render correctly
  - [x] Dark mode works on all sections
  - [x] Mobile navigation works
  - [x] Carousel navigation works
  - [x] Links navigate correctly (404 expected for detail pages)
  - [x] Search form navigates to /search

---

## File Summary

### New Files (12)

```
src/
├── lib/utils/
│   └── icons.tsx
├── components/home/
│   ├── hero-section.tsx
│   ├── business-card.tsx
│   ├── featured-businesses-carousel.tsx
│   ├── category-card.tsx
│   ├── category-grid.tsx
│   ├── ai-tool-card.tsx
│   ├── ai-tools-teaser.tsx
│   ├── testimonial-card.tsx
│   ├── testimonial-section.tsx
│   └── seo-content.tsx
└── app/search/
    └── page.tsx
```

### Modified Files (4)

```
src/
├── components/
│   ├── site-header.tsx      (add Browse nav)
│   └── site-footer.tsx      (complete rewrite)
└── app/
    ├── page.tsx             (complete rewrite)
    └── layout.tsx           (update metadata)
```

---

## Dependencies

All dependencies already installed:
- shadcn/ui components (Carousel, Card, Badge, Button, Input, etc.)
- lucide-react icons
- Mock data in `src/lib/data/`
- Shared components in `src/components/shared/`

---

## Notes

- All cards link to proper routes (`/business/[slug]`, `/category/[slug]`)
- Detail pages will 404 until Phase 2 of the project
- Mock data uses picsum.photos for images - may need `remotePatterns` in next.config.ts
