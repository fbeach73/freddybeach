# Batch 1: Category & Business Pages - Requirements

## Overview

Implement the core browsing experience for FreddyBeach.com business directory by creating category listing pages and individual business detail pages.

---

## Functional Requirements

### FR-1: Category Pages

**FR-1.1**: Users can browse businesses by category via direct URLs (e.g., `/restaurants`, `/cafes`)

**FR-1.2**: Category page displays:
- Category name, icon, and description
- Total count of businesses in category
- Grid of business cards (all businesses in that category)

**FR-1.3**: Users can filter businesses by:
- Sort order: Rating (high to low), Rating (low to high), Name A-Z, Name Z-A
- Open Now: Toggle to show only currently open businesses

**FR-1.4**: Active filters are displayed as removable badges

**FR-1.5**: Empty state shown when no businesses match filters

### FR-2: Business Detail Pages

**FR-2.1**: Users can view individual business pages via nested URLs (e.g., `/restaurants/isaacs-way`)

**FR-2.2**: Business detail page displays:
- Hero image with business name, rating, and badges overlay
- Contact information (address, phone, website, email)
- Business hours (today's hours + expandable full week)
- Map placeholder (for future Google Maps integration)
- Full business description
- Photo gallery with lightbox view

**FR-2.3**: Breadcrumb navigation shows: Home > Category > Business Name

**FR-2.4**: For unclaimed businesses: Display "Claim This Business" CTA card

**FR-2.5**: For claimed businesses: Display "Contact Owner" button

### FR-3: Navigation Integration

**FR-3.1**: BusinessCard component links to `/${categorySlug}/${businessSlug}` format

**FR-3.2**: All category and business pages are statically generated at build time

---

## Non-Functional Requirements

### NFR-1: Performance
- Pages should be server-rendered (Next.js Server Components)
- Use `generateStaticParams` for static generation

### NFR-2: Responsive Design
- Mobile-first approach
- Grid layouts: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)

### NFR-3: Accessibility
- Semantic HTML structure
- Proper heading hierarchy
- Clickable phone numbers (`tel:`) and emails (`mailto:`)

### NFR-4: Design Consistency
- Use existing shadcn/ui components
- Maintain warm coastal color theme
- Support light and dark modes

---

## Data Requirements

### Existing Data Sources
- `src/lib/data/businesses.ts` - 20 mock businesses
- `src/lib/data/categories.ts` - 10 categories

### Required Data Fields (Business)
- `slug`, `name`, `categorySlug`
- `heroImage`, `gallery[]`
- `shortDescription`, `longDescription`
- `address`, `phone`, `email`, `website`
- `hours` (7-day schedule)
- `rating`, `reviewCount`
- `tier` (free/enhanced/featured)
- `isClaimed`, `isVerified`

### Required Data Fields (Category)
- `slug`, `name`, `description`
- `icon` (Lucide icon name)

---

## URL Structure

| Page | URL Pattern | Example |
|------|-------------|---------|
| Category | `/[category]` | `/restaurants` |
| Business | `/[category]/[slug]` | `/restaurants/isaacs-way` |

---

## Out of Scope

- Backend API integration (using mock data)
- Google Maps embed (placeholder only)
- Business claim flow (CTA button only)
- Contact form submission (UI only)
- Search functionality (separate batch)
- User authentication requirements for viewing
