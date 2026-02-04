# Neo-Brutalism Review Fixes - Implementation Plan

## Phase 1: UX & Accessibility Fixes
Quick fixes that directly impact user experience and accessibility compliance.

- [x] **R1: Remove focus translate from search bar** - In `src/components/search/search-bar.tsx`, remove `focus:translate-x-[2px] focus:translate-y-[2px]` from the input className. Keep `focus:shadow-none` for the pressed-in effect without layout shift.

- [x] **R3: Add focus-visible ring to gallery thumbnails** - In `src/components/business/business-photo-gallery.tsx`, replace `focus:outline-none` on thumbnail buttons with `focus:outline-none focus-visible:ring-4 focus-visible:ring-nb-yellow focus-visible:ring-offset-2` to provide keyboard navigation visibility.

- [x] **R6: Fix hero badge text contrast** - In `src/components/home/ai-hero-section.tsx`, change `text-black/70` to `text-black` on the social proof badge secondary text to meet WCAG AA 4.5:1 contrast ratio.

## Phase 2: Performance & Navigation Fixes
Fixes that improve performance and proper Next.js navigation patterns.

- [x] **R2: Replace window.location.reload()** - In `src/components/business/reviews-section.tsx`, import `useRouter` from `next/navigation` (if not already imported) and replace `window.location.reload()` with `router.refresh()` to use Next.js client-side refresh.

- [x] **R4: Memoize claims filtering** - In `src/components/admin/claims/claims-page-client.tsx`, wrap the three `.filter()` calls (`pendingClaims`, `approvedClaims`, `rejectedClaims`) in `useMemo` with `[claims]` dependency. Add `useMemo` to the React import if not present.

- [x] **R5: Fix TOC history pollution** - In `src/components/blog/table-of-contents.tsx`, change `window.history.pushState(null, "", ...)` to `window.history.replaceState(null, "", ...)` to prevent bloating browser history.

- [x] **R7: Memoize SEO analyzer progress style** - In `src/components/admin/blog/seo-analyzer.tsx`, extract the inline `style={{ "--progress-background": ... }}` object into a `useMemo` with `[analysis.score]` dependency.

## Phase 3: Component Polish
Minor component-level fix for design system consistency.

- [x] **R8: Fix scroll area rounded-inherit** - In `src/components/ui/scroll-area.tsx`, change `rounded-[inherit]` to `rounded-none` on the ScrollAreaPrimitive.Viewport to enforce the neo-brutalism aesthetic.

## Verification
After all phases:
- [x] Run `pnpm lint` - must pass with 0 errors
- [x] Run `pnpm typecheck` - must pass with 0 errors
