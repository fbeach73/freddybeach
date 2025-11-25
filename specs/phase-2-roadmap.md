# FreddyBeach.com - Phase 2 Roadmap

## Overview

This document provides a high-level overview of Batches 2-4, to be implemented after Batch 1 (Category & Business Pages) is complete.

**Total Remaining Scope**: ~40 files across 3 batches
**Prerequisites**: Batch 1 must be complete first

---

## Batch 2: Marketing Pages

**Scope**: ~12 files
**Estimated Effort**: 3-4 hours
**Purpose**: Convert visitors into leads via compelling marketing content

### Routes

| Route | Purpose |
|-------|---------|
| `/ai-tools` | Showcase AI tools and pricing tiers |
| `/success-stories` | Case studies and testimonials |
| `/consultation` | Consultation packages and booking |

### Components

```
src/components/ai-tools/
├── pricing-tier-card.tsx       # Single tier (Free/Enhanced/Featured)
├── pricing-tier-grid.tsx       # 3-column comparison layout
├── tool-demo-card.tsx          # Tool preview with example I/O
└── ai-cta-section.tsx          # "Claim Your Business" CTA

src/components/success-stories/
├── case-study-card.tsx         # Challenge/Solution/Results format
├── case-study-results.tsx      # Metrics with checkmarks
└── success-cta-section.tsx     # "Book AI Audit" CTA

src/components/consultation/
├── package-card.tsx            # Package details + features
├── package-grid.tsx            # 3 packages comparison
├── calendar-placeholder.tsx    # Booking widget placeholder
├── contact-form.tsx            # Inquiry form (UI only)
└── trust-signals.tsx           # Local business badges
```

### Key Features

**AI Tools Page (`/ai-tools`)**:
- 3-tier pricing comparison (Free, Enhanced $99/yr, Featured $199/yr)
- Interactive tool demos with example inputs/outputs
- Feature breakdown per tier
- CTA to claim business

**Success Stories Page (`/success-stories`)**:
- 3-5 case study cards from testimonials data
- Challenge → Solution → Results format
- Time/money saved metrics
- Testimonial quotes with photos
- CTA to book consultation

**Consultation Page (`/consultation`)**:
- 3 packages: AI Quick Start ($500), Automation Blueprint ($2,500), Done-For-You ($5k+)
- What's included, timeline, expected outcomes
- Calendar booking placeholder
- Contact inquiry form
- Trust signals (local focus, experience)

### Data Sources

- `src/lib/data/ai-tools.ts` - Tool definitions with examples
- `src/lib/data/testimonials.ts` - Case studies with results
- `src/lib/data/packages.ts` - Consultation packages & pricing tiers

---

## Batch 3: Dashboard

**Scope**: ~23 files
**Estimated Effort**: 6-8 hours
**Purpose**: User portal for managing businesses and accessing AI tools

### Route Structure

```
src/app/dashboard/
├── layout.tsx                  # Sidebar + auth wrapper
├── page.tsx                    # Overview/home
├── my-businesses/
│   └── page.tsx               # Claimed business management
├── ai-tools/
│   ├── page.tsx               # Tool grid
│   └── [tool]/
│       └── page.tsx           # Individual tool interface
├── analytics/
│   └── page.tsx               # Placeholder
├── billing/
│   └── page.tsx               # Placeholder
└── settings/
    └── page.tsx               # Placeholder
```

### Components

```
src/components/dashboard/
├── dashboard-sidebar.tsx       # Persistent sidebar nav
├── dashboard-header.tsx        # Top bar + mobile toggle
│
├── overview/
│   ├── stats-cards.tsx         # Quick metrics grid
│   ├── claimed-business-list.tsx
│   ├── tool-usage-summary.tsx
│   └── upsell-card.tsx         # Premium upgrade prompt
│
├── my-businesses/
│   ├── business-management-card.tsx
│   └── claim-new-business-cta.tsx
│
└── ai-tools/
    ├── tool-grid.tsx           # Available tools
    ├── tool-card-dashboard.tsx # Tool with usage stats
    ├── tool-interface.tsx      # Generic tool wrapper
    └── review-responder/
        ├── review-input.tsx
        ├── response-output.tsx
        └── response-card.tsx
```

### Key Features

**Dashboard Layout**:
- Persistent sidebar (collapsible on mobile)
- Uses shadcn/ui Sidebar component
- Top header with user info
- Active route highlighting

**Sidebar Navigation**:
```typescript
[
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Businesses", href: "/dashboard/my-businesses", icon: Building2 },
  { title: "AI Tools", href: "/dashboard/ai-tools", icon: Sparkles },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]
```

**Overview Page**:
- Stats cards (claimed businesses, tool uses, savings)
- Quick access to claimed businesses
- Recent tool usage
- Premium upsell card
- "Book Consultation" CTA

**My Businesses Page**:
- List of user's claimed businesses
- Edit/manage actions per business
- View analytics per business
- CTA to claim more businesses

**AI Tools Interface**:
- Grid of available tools
- Free vs Premium badges
- Usage statistics per tool
- Tool interface with:
  - Input area (textarea/form)
  - Generate button
  - Output area with multiple responses
  - Copy buttons

**Placeholder Pages** (Analytics, Billing, Settings):
- "Coming Soon" styled placeholder
- Brief description of future features

### Mock Data Strategy

- Filter businesses where `isClaimed: true` for user's businesses
- Hardcoded usage statistics
- Simulated logged-in user state

---

## Batch 4: Search & Legal Pages

**Scope**: ~8 files
**Estimated Effort**: 2-3 hours
**Purpose**: Complete search functionality and legal compliance

### Routes

| Route | Purpose |
|-------|---------|
| `/search` | Full search with filters |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/refund` | Refund policy |

### Components

```
src/components/search/
├── search-page-header.tsx      # Large search bar
├── search-filters.tsx          # Filter controls
├── search-results.tsx          # Results grid
├── search-suggestions.tsx      # "Did you mean..."
└── search-client.tsx           # Client state wrapper

src/components/legal/
└── legal-page-layout.tsx       # TOC sidebar + content
```

### Key Features

**Search Page (`/search`)**:
- Prominent search bar at top
- Real-time filtering as you type
- Filters: Category dropdown, Rating minimum, "Open Now" toggle
- Sort: Rating, Name
- Results grid using BusinessCard
- "Did you mean..." suggestions for typos
- Empty state with helpful suggestions

**Legal Pages**:
- Consistent two-column layout
- Sticky table of contents sidebar
- Scrollable content area
- Clean typography for readability
- Standard legal content (placeholder text)

### Data Sources

- `src/lib/utils/search.ts` - Search and filter utilities
- `src/lib/data/businesses.ts` - Business data to search

---

## Implementation Order

```
Batch 1 (Current) ─────────────────────────────────────────────┐
  Category Pages + Business Detail Pages                       │
  ~15 files, 4-6 hours                                        │
                                                              ▼
Batch 2 ──────────────────────────────────────────────────────┐
  Marketing Pages (AI Tools, Success Stories, Consultation)    │
  ~12 files, 3-4 hours                                        │
                                                              ▼
Batch 3 ──────────────────────────────────────────────────────┐
  Dashboard (Complete rebuild with sidebar)                    │
  ~23 files, 6-8 hours                                        │
                                                              ▼
Batch 4 ──────────────────────────────────────────────────────┐
  Search Page + Legal Pages                                    │
  ~8 files, 2-3 hours                                         │
                                                              ▼
                        UI COMPLETE
```

---

## Dependencies Between Batches

| Batch | Depends On | Notes |
|-------|------------|-------|
| Batch 2 | Batch 1 | Uses BusinessCard with fixed URLs |
| Batch 3 | Batch 1 | Links to business detail pages |
| Batch 4 | Batch 1 | Search results link to business pages |

Batches 2, 3, and 4 are relatively independent of each other and could theoretically be done in parallel, but the recommended order ensures a logical user flow.

---

## Total Project Summary

| Batch | Pages | Components | Files | Hours |
|-------|-------|------------|-------|-------|
| 1 (Current) | 2 routes | 14 | ~16 | 4-6 |
| 2 | 3 routes | 12 | ~15 | 3-4 |
| 3 | 6 routes | 17 | ~23 | 6-8 |
| 4 | 4 routes | 6 | ~10 | 2-3 |
| **Total** | **15 routes** | **49** | **~64** | **15-21** |

---

## Notes

- All implementations are UI-only (no backend logic)
- Use existing mock data throughout
- Maintain design consistency with Homepage
- Mobile-responsive and dark-mode compatible
- Run `npm run lint && npm run typecheck` after each batch
