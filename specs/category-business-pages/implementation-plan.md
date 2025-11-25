# Batch 1: Category & Business Pages - Implementation Plan

## Overview

**Estimated Effort**: 4-6 hours
**Total Files**: ~16 new files, 1-2 modified files
**Prerequisites**: Homepage complete (done)

---

## Phase 1: BusinessCard URL Fix (Critical)

**Goal**: Update existing BusinessCard component to use correct URL pattern

### Tasks

- [x] Read `src/components/home/business-card.tsx` to understand current implementation
- [x] Add `categorySlug` prop to BusinessCard interface
- [x] Update Link href from `/business/${slug}` to `/${categorySlug}/${slug}`
- [x] Update `src/components/home/featured-businesses-carousel.tsx` to pass `categorySlug`
- [x] Search for any other BusinessCard usages and update them
- [x] Run `npm run lint && npm run typecheck` to verify no errors

**Files to Modify**:
- `src/components/home/business-card.tsx`
- `src/components/home/featured-businesses-carousel.tsx`

---

## Phase 2: Category Page Components

**Goal**: Create reusable components for the category listing page

### Tasks

- [x] Create `src/components/category/` directory
- [x] Create `category-page-header.tsx`:
  - Display category icon (dynamic from Lucide)
  - Category name as h1
  - Category description
  - Business count badge
- [x] Create `business-list-filters.tsx` (client component):
  - Sort dropdown with options: Rating High→Low, Rating Low→High, Name A-Z, Name Z-A
  - "Open Now" toggle switch
  - useState for filter state
  - onChange callbacks to parent
- [x] Create `filter-badge.tsx`:
  - Pill component showing active filter
  - X button to remove filter
- [x] Create `business-list.tsx`:
  - Responsive grid (1/2/3 columns)
  - Map over businesses with BusinessCard
  - Accept filtered/sorted business array
- [x] Create `index.ts` barrel export
- [x] Run `npm run lint && npm run typecheck`

**Files to Create**:
```
src/components/category/
├── category-page-header.tsx
├── business-list-filters.tsx
├── business-list.tsx
├── filter-badge.tsx
└── index.ts
```

---

## Phase 3: Category Page Route

**Goal**: Create the dynamic category page with filtering functionality

### Tasks

- [x] Create `src/app/[category]/` directory
- [x] Create `src/app/[category]/page.tsx`:
  - Server component structure
  - Import `getCategoryBySlug` from categories data
  - Import `getBusinessesByCategory` from businesses data
  - Implement `generateStaticParams` from categories array
  - Return 404 (notFound) if category doesn't exist
  - Pass category and businesses to client wrapper
- [x] Create client wrapper component for filter state management:
  - useState for sort option
  - useState for openNow filter
  - Filter/sort logic using existing utilities
  - Render CategoryPageHeader, BusinessListFilters, FilterBadge, BusinessList
- [x] Verify page renders at `/restaurants`, `/cafes-bakeries`, etc.
- [x] Run `npm run lint && npm run typecheck`

**Files Created**:
```
src/app/[category]/
├── page.tsx
└── category-page-client.tsx
```

---

## Phase 4: Business Detail Components

**Goal**: Create all components needed for the business detail page

### Tasks

- [x] Create `src/components/business/` directory
- [x] Create `business-breadcrumb.tsx`:
  - Use shadcn Breadcrumb component
  - Path: Home > {Category} > {Business}
  - Links to / and /{category}
- [x] Create `business-hero.tsx`:
  - Full-width hero image container
  - Gradient overlay for text readability
  - Business name (h1)
  - RatingStars + review count
  - TierBadge component
  - OpenStatus badge
- [x] Create `business-info-card.tsx`:
  - Card with contact information sections
  - MapPin icon + full address
  - Phone icon + clickable tel: link
  - Globe icon + external website link
  - Mail icon + mailto: link
  - Clock icon + today's hours summary
- [x] Create `business-hours-table.tsx`:
  - 7-day table layout
  - Highlight current day
  - Show "Closed" for closed days
  - Use formatHours utility
- [x] Create `business-map-placeholder.tsx`:
  - Styled placeholder box (aspect-video)
  - Centered map icon
  - "Map coming soon" text
  - Gray background with border
- [x] Create `business-photo-gallery.tsx`:
  - Grid of gallery images
  - Click opens Dialog lightbox
  - Navigation between images in lightbox
- [x] Create `business-description.tsx`:
  - Section with "About {name}" heading
  - Full longDescription text
  - Proper paragraph formatting
- [x] Create `claim-business-cta.tsx`:
  - Conditional render (!isClaimed)
  - Prominent card styling
  - Headline + benefits description
  - "Claim This Business" button
- [x] Create `contact-owner-button.tsx`:
  - Conditional render (isClaimed)
  - Styled button
  - Placeholder onClick (future modal/form)
- [x] Create `index.ts` barrel export
- [x] Run `npm run lint && npm run typecheck`

**Files Created**:
```
src/components/business/
├── business-breadcrumb.tsx
├── business-hero.tsx
├── business-info-card.tsx
├── business-hours-table.tsx
├── business-map-placeholder.tsx
├── business-photo-gallery.tsx
├── business-description.tsx
├── claim-business-cta.tsx
├── contact-owner-button.tsx
└── index.ts
```

---

## Phase 5: Business Detail Page Route

**Goal**: Create the dynamic business detail page

### Tasks

- [x] Create `src/app/[category]/[slug]/` directory
- [x] Create `src/app/[category]/[slug]/page.tsx`:
  - Server component structure
  - Import `getBusinessBySlug` from businesses data
  - Import `getCategoryBySlug` from categories data
  - Implement `generateStaticParams` from all businesses
  - Validate category matches business.categorySlug
  - Return 404 if not found or category mismatch
  - Compose page layout with all business components
- [x] Implement page layout:
  - BusinessBreadcrumb at top
  - BusinessHero full width
  - 2-column grid: BusinessInfoCard + BusinessMapPlaceholder
  - BusinessDescription section
  - BusinessPhotoGallery
  - ClaimBusinessCta OR ContactOwnerButton based on isClaimed
- [x] Verify pages render at `/restaurants/isaacs-way`, etc.
- [x] Run `npm run lint && npm run typecheck`

**Files Created**:
```
src/app/[category]/[slug]/
└── page.tsx
```

---

## Phase 6: Final Verification

**Goal**: Ensure all pages work correctly and pass quality checks

### Tasks

- [x] Run full lint check: `npm run lint`
- [x] Run full typecheck: `npm run typecheck`
- [x] Manual testing - Category pages:
  - [x] Navigate to `/restaurants` - shows restaurant businesses
  - [x] Navigate to `/cafes-bakeries` - shows cafe businesses
  - [x] Test sort by rating (both directions)
  - [x] Test sort by name (both directions)
  - [x] Test "Open Now" filter
  - [x] Verify filter badges appear/remove correctly
  - [x] Verify empty state when no matches
- [x] Manual testing - Business pages:
  - [x] Click business card navigates to correct URL
  - [x] Hero image displays with overlay
  - [x] Contact info is clickable (phone, email, website)
  - [x] Hours table shows correctly
  - [x] Photo gallery opens lightbox
  - [x] Breadcrumb links work
  - [x] Claim CTA shows for unclaimed businesses
  - [x] Contact button shows for claimed businesses
- [x] Responsive testing:
  - [x] Test mobile viewport (375px)
  - [x] Test tablet viewport (768px)
  - [x] Test desktop viewport (1280px)
- [x] Dark mode testing:
  - [x] Toggle dark mode
  - [x] Verify all components render correctly

---

## File Summary

### New Files (17)

```
src/components/category/
├── category-page-header.tsx
├── business-list-filters.tsx
├── business-list.tsx
├── filter-badge.tsx
└── index.ts

src/components/business/
├── business-breadcrumb.tsx
├── business-hero.tsx
├── business-info-card.tsx
├── business-hours-table.tsx
├── business-map-placeholder.tsx
├── business-photo-gallery.tsx
├── business-description.tsx
├── claim-business-cta.tsx
├── contact-owner-button.tsx
└── index.ts

src/app/[category]/
├── page.tsx
├── category-page-client.tsx
└── [slug]/
    └── page.tsx
```

### Modified Files (2)

- `src/components/home/business-card.tsx`
- `src/components/home/featured-businesses-carousel.tsx`

---

## Dependencies

### Existing Components to Reuse
- `BusinessCard` (after URL fix)
- `RatingStars` from `src/components/shared/`
- `OpenStatus` from `src/components/shared/`
- `TierBadge` from `src/components/shared/`
- `EmptyState` from `src/components/shared/`
- shadcn/ui: Card, Button, Badge, Dialog, Breadcrumb, Select, Switch

### Existing Utilities to Use
- `isOpenNow()` from `src/lib/utils/business.ts`
- `formatHours()` from `src/lib/utils/business.ts`
- `filterOpenNow()` from `src/lib/utils/search.ts`
- `sortByRating()` from `src/lib/utils/search.ts`

### Data Functions to Use
- `getCategoryBySlug()` from `src/lib/data/categories.ts`
- `getBusinessesByCategory()` from `src/lib/data/businesses.ts`
- `getBusinessBySlug()` from `src/lib/data/businesses.ts`
