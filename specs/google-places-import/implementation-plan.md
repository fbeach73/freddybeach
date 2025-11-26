# Google Places Import Feature - Implementation Plan

## Phase 1: Database Schema

### Tasks
- [x] Add `businesses` table to `src/lib/schema.ts` with all required fields
- [x] Add `google_place_id` field (unique, for duplicate detection)
- [x] Add `status` field with enum: draft, published, archived
- [x] Add `latitude` and `longitude` fields
- [x] Add `google_place_data` JSONB field for raw API response
- [x] Add `hours` JSONB field for BusinessHours[]
- [x] Run `pnpm run db:generate` to generate migration
- [x] Run `pnpm run db:migrate` to apply migration

### Files
- `src/lib/schema.ts` (modify)
- `drizzle/XXXX_*.sql` (auto-generated)

---

## Phase 2: Google Places API Service

### Tasks
- [x] Add `GOOGLE_PLACES_API_KEY` to `.env.local`
- [x] Create `src/lib/services/google-places.ts` with:
  - [x] TypeScript interfaces for Google Places API responses
  - [x] `searchPlaces(query, type?, radius?)` function
  - [x] `getPlaceDetails(placeId)` function (optional, for more details)
  - [x] `buildPhotoUrl(photoName)` helper function
  - [x] `parseOpeningHours(regularOpeningHours)` function to convert to BusinessHours[]

### Files
- `src/lib/services/google-places.ts` (create)
- `.env.local` (modify)

---

## Phase 3: API Routes

### Tasks
- [x] Create `src/app/api/admin/google-places/search/route.ts`
  - [x] POST handler with admin auth check via `requireAdmin()`
  - [x] Accept params: `{ query, type?, radius?, pageToken? }`
  - [x] Call Google Places API with Fredericton center coordinates
  - [x] Return formatted results with duplicate indicators
- [x] Create `src/app/api/admin/google-places/import/route.ts`
  - [x] POST handler with admin auth check
  - [x] Accept params: `{ places: Array<{ placeData, categoryId }> }`
  - [x] Check for duplicates (google_place_id + name/address fuzzy)
  - [x] Insert businesses with status "draft"
  - [x] Return import summary (imported count, skipped duplicates)

### Files
- `src/app/api/admin/google-places/search/route.ts` (create)
- `src/app/api/admin/google-places/import/route.ts` (create)

---

## Phase 4: Admin Sidebar Navigation

### Tasks
- [x] Add "Import Businesses" item to `navItems` array in admin sidebar
- [x] Use `Download` icon from lucide-react
- [x] Set href to `/admin/import`

### Files
- `src/components/admin/admin-sidebar.tsx` (modify)

---

## Phase 5: Import Page UI Components

### Tasks
- [x] Create `src/components/admin/import/search-form.tsx`
  - [x] Keyword input field
  - [x] Google Place type selector dropdown
  - [x] Radius slider (1-50km, default 10km)
  - [x] Search button with loading state
- [x] Create `src/components/admin/import/place-result-card.tsx`
  - [x] Checkbox for selection
  - [x] Photo thumbnail (Next.js Image)
  - [x] Business name, address, rating, review count
  - [x] Google category display
  - [x] Category selector dropdown (10 FreddyBeach categories)
  - [x] "Already imported" badge for duplicates
- [x] Create `src/components/admin/import/results-list.tsx`
  - [x] Select All / Deselect All buttons
  - [x] Selected count display
  - [x] Import Selected button (disabled when none selected)
  - [x] List of PlaceResultCard components
  - [x] Load More button (pagination)
  - [x] Empty state when no results
  - [x] Loading skeleton state
- [x] Create `src/components/admin/import/import-confirmation-dialog.tsx`
  - [x] Summary of businesses to import
  - [x] Category assignments review
  - [x] Confirm / Cancel buttons

### Files
- `src/components/admin/import/search-form.tsx` (create)
- `src/components/admin/import/place-result-card.tsx` (create)
- `src/components/admin/import/results-list.tsx` (create)
- `src/components/admin/import/import-confirmation-dialog.tsx` (create)

---

## Phase 6: Import Page Assembly

### Tasks
- [x] Create `src/app/admin/import/page.tsx`
  - [x] Page header with title and description
  - [x] SearchForm component
  - [x] ResultsList component
  - [x] State management for search results, selections, loading states
  - [x] Integration with search and import API routes
  - [x] Toast notifications for success/error
  - [x] ImportConfirmationDialog integration

### Files
- `src/app/admin/import/page.tsx` (create)

---

## Phase 7: Polish & Error Handling

### Tasks
- [x] Add loading skeletons for search results
- [x] Add comprehensive error handling for API failures
- [x] Add toast notifications (success: "X businesses imported", error messages)
- [x] Add empty state with helpful messaging
- [x] Ensure responsive layout for mobile admin access
- [x] Run `pnpm run lint` to check for issues
- [x] Run `pnpm run typecheck` to verify types

### Files
- Various files from previous phases

---

## Files Summary

### New Files (8)
1. `src/lib/services/google-places.ts`
2. `src/app/api/admin/google-places/search/route.ts`
3. `src/app/api/admin/google-places/import/route.ts`
4. `src/app/admin/import/page.tsx`
5. `src/components/admin/import/search-form.tsx`
6. `src/components/admin/import/place-result-card.tsx`
7. `src/components/admin/import/results-list.tsx`
8. `src/components/admin/import/import-confirmation-dialog.tsx`

### Modified Files (2)
1. `src/lib/schema.ts` - Add businesses table
2. `src/components/admin/admin-sidebar.tsx` - Add Import nav item

### Environment
- `.env.local` - Add `GOOGLE_PLACES_API_KEY`
