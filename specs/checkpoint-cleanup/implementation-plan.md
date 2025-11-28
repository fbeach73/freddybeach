# Checkpoint Cleanup - Implementation Plan

## Summary
- **Total Phases:** 6
- **Estimated Time:** ~2.5 hours
- **Files to Modify:** ~25

---

## Phase 1: Delete Dead Code (15 min)

Remove unused utility function exports that are never imported anywhere.

### Tasks

**`src/lib/utils/format.ts`**
- [x] Remove `formatPhoneNumber()` function
- [x] Remove `formatNumber()` function
- [x] Remove `truncate()` function
- [x] Remove `slugify()` function (duplicate of mdx.ts version)
- [x] Remove `formatPostalCode()` function
- [x] Remove `pluralize()` function
- [x] Remove `formatReviewCount()` function

**`src/lib/utils/business.ts`**
- [x] Remove `filterOpenNow()` function
- [x] Remove `filterByMinRating()` function
- [x] Remove `filterByTier()` function

---

## Phase 2: Fix List Keys (20 min)

Fix React anti-pattern of using array index as key in dynamic lists.

### Tasks

- [x] `src/components/search/search-results.tsx:30` - Replace index key with stable identifier for skeletons
- [x] `src/components/admin/import/bulk-import-tab.tsx:233` - Replace index key with unique place identifier (googlePlaceId or name)
- [x] `src/components/admin/import/results-list.tsx:65` - Replace index key with stable identifier for skeletons
- [x] `src/components/admin/claims/claims-page-client.tsx` - Already uses proper keys (claim.id)

---

## Phase 3: Consolidate Duplicates (45 min)

Consolidate duplicate function implementations to single source of truth.

### Tasks

**formatDate consolidation**
- [x] Keep canonical `formatDate` in `src/lib/utils/format.ts`
- [x] Update `src/components/blog/blog-post-header.tsx` - Import from format.ts, remove local function
- [x] Update `src/components/blog/blog-card.tsx` - Import from format.ts, remove local function
- [x] Update `src/app/api/blog/og/[slug]/route.tsx` - Import from format.ts, remove local function

**getInitials consolidation**
- [x] Keep canonical `getInitials` in `src/lib/utils/format.ts`
- [x] Update `src/components/blog/blog-post-header.tsx` - Import from format.ts, remove local function
- [x] Update `src/components/dashboard/dashboard-sidebar.tsx` - Import from format.ts, remove local arrow function

**formatCurrency consolidation**
- [x] Update `src/emails/payment-failed.tsx` - Import from format.ts, remove local function
- [x] Update `src/emails/subscription-renewed.tsx` - Import from format.ts, remove local function
- [x] Update `src/emails/subscription-started.tsx` - Import from format.ts, remove local function
- [x] Update `src/emails/purchase-confirmation.tsx` - Import from format.ts, remove local function

---

## Phase 4: Race Condition Fixes (30 min)

Add unmount checks and cleanup to async operations to prevent memory leaks.

### Tasks

- [x] `src/app/search/search-client.tsx:77-83`
  - Add `isMounted` ref
  - Check mounted state before state updates
  - Return cleanup function from useEffect

- [x] `src/components/admin/blog/post-form.tsx:137-183`
  - Add mounted check to `handlePublish()` and `handleSave()`
  - Prevent state updates after unmount

- [x] `src/components/admin/claims/claims-page-client.tsx:137-204`
  - Add mounted check to async claim processing operations
  - Add AbortController for fetch cancellation

---

## Phase 5: Error Boundaries (20 min)

Add error boundary wrappers to high-risk components.

### Tasks

- [x] Create reusable `ErrorBoundary` component if not exists (or use existing)
- [x] `src/components/chat/chat-client.tsx` - Wrap with error boundary, add fallback UI
- [x] `src/components/admin/blog/media-library.tsx` - Wrap with error boundary
- [x] `src/components/admin/import/results-list.tsx` - Wrap with error boundary
- [x] `src/components/home/featured-businesses-carousel.tsx` - Wrap with error boundary

---

## Phase 6: Performance Polish (20 min)

Add memoization and improve error handling specificity.

### Tasks

**Memoization**
- [x] `src/components/dashboard/ai-tool-interface.tsx` - Wrap component in `React.memo()`
- [x] `src/components/admin/blog/media-library.tsx:57-76` - Fix fetchImages useCallback dependency array
- [x] `src/components/admin/blog/ai-rewrite-panel.tsx` - Memoize `getChangeIcon()` and `getChangeBadge()` helper functions

**Error Message Improvements**
- [x] `src/components/admin/businesses/business-edit-form.tsx:98` - Add specific error details from API response
- [x] `src/components/dashboard/business-create-form.tsx` - Add specific error details (already had proper error handling)

---

## Final Verification

- [x] Run `pnpm run lint` - Fix any errors
- [x] Run `pnpm run typecheck` - Fix any type errors
- [ ] Manual smoke test of affected features:
  - Search page filtering
  - Admin blog post editing
  - Admin claims processing
  - Dashboard business creation
  - Chat functionality
  - Featured businesses carousel

---

## Critical Files Reference

Files to read before implementation:
- `src/lib/utils/format.ts`
- `src/lib/utils/business.ts`
- `src/components/search/results-list.tsx`
- `src/components/admin/import/bulk-import-tab.tsx`

## Notes

### What's Already Working Well (No Changes Needed)
- Server/Client Component separation
- Data fetching patterns (async/await in Server Components)
- Route handlers (modern Next.js 15 patterns)
- Metadata/SEO configuration
- Image optimization (100% using next/image)
- Error pages (error.tsx at all route levels)
