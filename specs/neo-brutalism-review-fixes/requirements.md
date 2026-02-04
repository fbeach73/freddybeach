# Neo-Brutalism Review Fixes - Requirements

## Background

A comprehensive code review was conducted across 6 commits (135 files, +2,029/-1,165 lines) implementing the neo-brutalism design system conversion from standard shadcn/ui styling. The review identified no critical/blocking issues but surfaced several warnings and optimizations that should be addressed for production quality.

**Current Status:**
- `pnpm lint`: 0 errors (1 pre-existing GA warning)
- `pnpm typecheck`: 0 errors
- No security vulnerabilities found
- No broken functionality

## Requirements

### R1: Fix Search Bar Focus Layout Shift
The search bar input uses `focus:translate-x-[2px] focus:translate-y-[2px]` which causes a jarring layout shift when the user clicks or tabs into the search field. This transform is appropriate for cards/buttons but not for input fields.

**File:** `src/components/search/search-bar.tsx`

### R2: Replace `window.location.reload()` with `router.refresh()`
After review submission, the reviews section forces a full page reload instead of using Next.js client-side navigation, causing a flash of white screen and losing scroll position.

**File:** `src/components/business/reviews-section.tsx`

### R3: Add Focus-Visible Ring to Gallery Thumbnails
Gallery thumbnail buttons use `focus:outline-none` without a replacement focus indicator, violating WCAG 2.1 SC 2.4.7 (Focus Visible) for keyboard navigation.

**File:** `src/components/business/business-photo-gallery.tsx`

### R4: Memoize Claims Filtering
Three `.filter()` calls in the claims page client component run on every render without memoization.

**File:** `src/components/admin/claims/claims-page-client.tsx`

### R5: Replace `window.history.pushState` with `replaceState` in TOC
Table of Contents link clicks use `pushState` which bloats browser history when users click many TOC links, making the back button unusable.

**File:** `src/components/blog/table-of-contents.tsx`

### R6: Fix Hero Badge Text Contrast
The hero section social proof badge uses `text-black/70` which may fail WCAG AA contrast requirements on the yellow background.

**File:** `src/components/home/ai-hero-section.tsx`

### R7: Memoize SEO Analyzer Progress Style
Inline style object creation in the SEO analyzer creates a new object on every render, breaking React memoization patterns.

**File:** `src/components/admin/blog/seo-analyzer.tsx`

### R8: Fix Scroll Area `rounded-[inherit]`
The scroll area viewport uses `rounded-[inherit]` which could inherit rounded corners from parent containers, breaking the neo-brutalism `rounded-none` aesthetic.

**File:** `src/components/ui/scroll-area.tsx`

## Out of Scope
- Hardcoded `text-black` on accent backgrounds (intentional neo-brutalism pattern; black on bright colors has adequate contrast)
- Ghost/link button variant styling (intentional differentiation)
- Switch/slider `rounded-full` (UX affordance exception)
- ACCENT_COLORS extraction to shared constants (nice-to-have, separate PR)
- IconBox shared component extraction (nice-to-have, separate PR)
