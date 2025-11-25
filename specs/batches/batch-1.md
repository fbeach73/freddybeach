# Batch 1: Category & Business Pages

**Status**: Ready for Implementation
**Scope**: ~15 files
**Estimated Effort**: 4-6 hours
**Prerequisites**: Homepage complete (done)

---

## Overview

Batch 1 establishes the core browsing experience for FreddyBeach.com by implementing:
1. Category listing pages (e.g., `/restaurants`, `/cafes`)
2. Individual business detail pages (e.g., `/restaurants/isaacs-way`)

---

## URL Structure

| Page Type | Pattern | Example |
|-----------|---------|---------|
| Category | `/[category]` | `/restaurants`, `/cafes` |
| Business | `/[category]/[slug]` | `/restaurants/isaacs-way` |

---

## Step-by-Step Implementation

### Step 1: Fix BusinessCard URL Pattern (CRITICAL - Do First)

**File**: `src/components/home/business-card.tsx`

**Changes Required**:
- Add `categorySlug` prop to component interface
- Update Link href from `/business/${slug}` to `/${categorySlug}/${slug}`
- Update all existing usages to pass `categorySlug`

**Affected Files**:
- `src/components/home/featured-businesses-carousel.tsx`
- Any other components using BusinessCard

---

### Step 2: Create Category Page Components

**Directory**: `src/components/category/`

#### 2.1 `category-page-header.tsx`
- Category icon (from lucide-react)
- Category name (h1)
- Category description
- Business count badge (e.g., "24 businesses")

#### 2.2 `business-list-filters.tsx` (Client Component)
- Sort dropdown: "Rating (High to Low)", "Rating (Low to High)", "Name A-Z", "Name Z-A"
- "Open Now" toggle switch
- Filter state management with useState
- Callback props for filter changes

#### 2.3 `business-list.tsx`
- Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
- Maps over filtered businesses
- Uses BusinessCard component
- Empty state when no results match filters

#### 2.4 `filter-badge.tsx`
- Active filter pill with X button
- Shows current filter values
- Click to remove filter

#### 2.5 `index.ts`
- Barrel export for all category components

---

### Step 3: Create Category Page Route

**File**: `src/app/[category]/page.tsx`

**Implementation**:
```typescript
// Server component
// generateStaticParams from categories array
// Fetch category by slug
// Fetch businesses by category
// 404 if category not found
// Pass data to client wrapper for filtering
```

**Data Functions Used**:
- `getCategoryBySlug(slug)` from `src/lib/data/categories.ts`
- `getBusinessesByCategory(categorySlug)` from `src/lib/data/businesses.ts`

**Layout**:
```
┌─────────────────────────────────────┐
│ CategoryPageHeader                  │
│ (icon, name, description, count)    │
├─────────────────────────────────────┤
│ BusinessListFilters                 │
│ [Sort: Rating ▼] [Open Now: ○]      │
├─────────────────────────────────────┤
│ FilterBadge (if filters active)     │
├─────────────────────────────────────┤
│ BusinessList                        │
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │Card │ │Card │ │Card │            │
│ └─────┘ └─────┘ └─────┘            │
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │Card │ │Card │ │Card │            │
│ └─────┘ └─────┘ └─────┘            │
└─────────────────────────────────────┘
```

---

### Step 4: Create Business Detail Components

**Directory**: `src/components/business/`

#### 4.1 `business-hero.tsx`
- Full-width hero image (from `business.heroImage`)
- Gradient overlay for text readability
- Business name (h1)
- Rating stars + review count
- TierBadge (Free/Enhanced/Featured)
- OpenStatus badge

#### 4.2 `business-info-card.tsx`
- Card component with sections:
  - Address with MapPin icon (full address)
  - Phone with Phone icon (clickable `tel:` link)
  - Website with Globe icon (clickable external link)
  - Email with Mail icon (clickable `mailto:` link)
  - Hours summary (today's hours with "See all hours" expand)

#### 4.3 `business-hours-table.tsx`
- 7-day hours table
- Current day highlighted
- Shows "Closed" for closed days
- Uses `formatHours()` utility

#### 4.4 `business-map-placeholder.tsx`
- Styled placeholder box (aspect-video)
- Map icon centered
- "Map coming soon" text
- Light gray background with border
- Will be replaced with Google Maps embed later

#### 4.5 `business-photo-gallery.tsx`
- Grid of images from `business.gallery`
- 2x2 or 3x3 grid depending on image count
- Click opens Dialog with larger image
- Uses shadcn Dialog component for lightbox

#### 4.6 `business-description.tsx`
- Section header "About {business.name}"
- Full description text (`business.longDescription`)
- Proper paragraph formatting

#### 4.7 `claim-business-cta.tsx`
- Only renders if `!business.isClaimed`
- Card with prominent styling
- Headline: "Own this business?"
- Description explaining benefits of claiming
- "Claim This Business" button (links to future claim flow)

#### 4.8 `contact-owner-button.tsx`
- Only renders if `business.isClaimed`
- "Contact Owner" button
- Opens modal or links to contact form (placeholder for now)

#### 4.9 `business-breadcrumb.tsx`
- Uses shadcn Breadcrumb component
- Path: Home > {Category} > {Business Name}
- Links to home and category page

#### 4.10 `index.ts`
- Barrel export for all business components

---

### Step 5: Create Business Detail Page Route

**File**: `src/app/[category]/[slug]/page.tsx`

**Implementation**:
```typescript
// Server component
// generateStaticParams from all businesses
// Fetch business by slug
// Verify category matches
// 404 if not found or category mismatch
```

**Data Functions Used**:
- `getBusinessBySlug(slug)` from `src/lib/data/businesses.ts`
- `getCategoryBySlug(categorySlug)` from `src/lib/data/categories.ts`

**Layout**:
```
┌─────────────────────────────────────┐
│ Breadcrumb: Home > Category > Name  │
├─────────────────────────────────────┤
│ BusinessHero (full width)           │
│ [Hero Image with overlay]           │
│ Name, Rating, Badges                │
├─────────────────────────────────────┤
│ ┌─────────────────┬────────────────┐│
│ │ BusinessInfoCard│ MapPlaceholder ││
│ │ Address         │                ││
│ │ Phone           │    [Map Icon]  ││
│ │ Website         │                ││
│ │ Hours           │                ││
│ └─────────────────┴────────────────┘│
├─────────────────────────────────────┤
│ BusinessDescription                 │
│ About {name}                        │
│ [Long description text...]          │
├─────────────────────────────────────┤
│ BusinessPhotoGallery                │
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │     │ │     │ │     │            │
│ └─────┘ └─────┘ └─────┘            │
├─────────────────────────────────────┤
│ ClaimBusinessCTA (if unclaimed)     │
│ OR ContactOwnerButton (if claimed)  │
└─────────────────────────────────────┘
```

---

### Step 6: Test & Verify

**Commands**:
```bash
npm run lint && npm run typecheck
```

**Manual Testing**:
- [ ] Navigate to `/restaurants` - should show all restaurants
- [ ] Navigate to `/cafes` - should show all cafes
- [ ] Test sort by rating (high to low, low to high)
- [ ] Test "Open Now" filter toggle
- [ ] Click a business card - should navigate to `/[category]/[slug]`
- [ ] Verify business detail page shows all sections
- [ ] Test photo gallery lightbox
- [ ] Verify breadcrumb navigation works
- [ ] Test on mobile viewport
- [ ] Test dark mode

---

## Files Summary

### Files to Create (16)

```
src/components/category/
├── category-page-header.tsx
├── business-list-filters.tsx
├── business-list.tsx
├── filter-badge.tsx
└── index.ts

src/components/business/
├── business-hero.tsx
├── business-info-card.tsx
├── business-hours-table.tsx
├── business-map-placeholder.tsx
├── business-photo-gallery.tsx
├── business-description.tsx
├── claim-business-cta.tsx
├── contact-owner-button.tsx
├── business-breadcrumb.tsx
└── index.ts

src/app/[category]/
├── page.tsx
└── [slug]/
    └── page.tsx
```

### Files to Modify (1-2)

- `src/components/home/business-card.tsx` - Add categorySlug prop, fix URL
- `src/components/home/featured-businesses-carousel.tsx` - Pass categorySlug

---

## Data Dependencies

**Existing Mock Data**:
- `src/lib/data/businesses.ts` - 20 businesses with full data
- `src/lib/data/categories.ts` - 10 categories

**Existing Utilities**:
- `src/lib/utils/business.ts` - `isOpenNow()`, `formatHours()`
- `src/lib/utils/search.ts` - `filterByCategory()`, `filterOpenNow()`, `sortByRating()`

**Existing Components to Reuse**:
- `BusinessCard` (after URL fix)
- `RatingStars`
- `OpenStatus`
- `TierBadge`
- `PageHeader`
- `EmptyState`
- All shadcn/ui components

---

## Design Notes

- Maintain warm coastal color theme (oklch colors)
- Use existing shadcn/ui components
- Mobile-first responsive design
- Support dark mode throughout
- Clear visual hierarchy
- Prominent CTAs for business claims
