# Business Claims System - Implementation Plan

## Phase 1: Database Schema & Setup
**Status**: Complete

- [x] Install resend package (`pnpm add resend`)
- [x] Add `claimStatusEnum` to schema (pending, approved, rejected)
- [x] Add `claimRoleEnum` to schema (owner, manager, authorized_representative)
- [x] Update `userRoleEnum` to include "client" role
- [x] Create `claim` table with all required fields and indexes
- [x] Generate database migration (`pnpm run db:generate`)
- [x] Run database migration (`pnpm run db:migrate`)

**Files Modified:**
- `src/lib/schema.ts` - Added claim table, claimStatusEnum, claimRoleEnum, updated userRoleEnum

---

## Phase 2: Data Layer Updates
**Status**: Complete

- [x] Fix `isClaimed` derivation in `toBusinessType` function (derive from `ownerId !== null`)

**Files Modified:**
- `src/lib/data/businesses-db.ts`

---

## Phase 3: Email Setup
**Status**: Skipped - handled separately (Mailgun branch)

Email notifications will be implemented via Mailgun in a separate branch.
For now, TODO comments are added where emails should be sent.

---

## Phase 4: Claims Submission API
**Status**: Complete

- [x] Create `POST /api/claims` endpoint
  - Validate user is authenticated
  - Validate all required fields (businessId, role, phone, description)
  - Validate role is one of: owner, manager, authorized_representative
  - Check business exists and is not already claimed
  - Check no existing pending claim by user for this business
  - Create claim with status "pending"
  - Return success response
- [x] Create `GET /api/claims` endpoint
  - Return current user's claims with business names and statuses

**Files Created:**
- `src/app/api/claims/route.ts`

---

## Phase 5: Claim Submission UI
**Status**: Complete

- [x] Rewrite `ClaimBusinessCta` component as client component
  - Add props: `businessId`, `businessName`, `isLoggedIn`
  - Add modal dialog state
  - Create form with role dropdown, phone input, description textarea
  - Add form validation
  - Submit to POST /api/claims
  - Show success/error toast
  - Redirect to sign in if not logged in
- [x] Update business detail page (`/[category]/[slug]/page.tsx`)
  - Get session server-side
  - Get business.id from database query
  - Pass `businessId`, `businessName`, `isLoggedIn` to ClaimBusinessCta

**Files Modified:**
- `src/components/business/claim-business-cta.tsx`
- `src/app/[category]/[slug]/page.tsx`

---

## Phase 6: Admin Claims APIs
**Status**: Complete

- [x] Create `GET /api/admin/claims` endpoint
  - Validate user is admin
  - Join claim + business + user tables
  - Support optional status filter via query param
  - Return full claim details with business and user info
- [x] Create `PATCH /api/admin/claims/[id]` endpoint
  - Validate user is admin
  - Validate claim exists and status is "pending"
  - Handle "approve" action:
    - Set business.ownerId to claimant userId
    - Set business.claimedAt to now
    - Set claim.status to "approved"
    - Set claim.reviewedAt and reviewedBy
    - Upgrade user role from "user" to "client" if applicable
    - Send approval email (TODO: Mailgun branch)
  - Handle "reject" action:
    - Require rejectionReason in request body
    - Set claim.status to "rejected"
    - Set claim.rejectionReason, reviewedAt, reviewedBy
    - Send rejection email with reason (TODO: Mailgun branch)
- [x] Create `GET /api/admin/claims/[id]` endpoint (bonus)
  - Get single claim with full details

**Files Created:**
- `src/app/api/admin/claims/route.ts`
- `src/app/api/admin/claims/[id]/route.ts`

---

## Phase 7: Admin Claims Management UI
**Status**: Complete

- [x] Rewrite admin claims page (`/admin/claims/page.tsx`)
  - Fetch claims from database (joined with business + user)
  - Pass to ClaimsPageClient component
- [x] Create `ClaimsPageClient` component
  - Stats cards showing Pending, Approved, Rejected counts
  - Tabs for filtering: Pending, Approved, Rejected, All
  - Pending tab: Card layout with claim details and Approve/Reject buttons
  - Other tabs: Table layout showing claim history
  - Confirmation dialog for approve action
  - Rejection dialog with required reason textarea
  - Toast notifications on success/error
- [x] Create index export file

**Files Modified:**
- `src/app/admin/claims/page.tsx`

**Files Created:**
- `src/components/admin/claims/claims-page-client.tsx`
- `src/components/admin/claims/index.ts`

---

## Phase 8: User Dashboard Updates
**Status**: Complete

- [x] Update My Businesses page (`/dashboard/my-businesses/page.tsx`)
  - Query claims table for user's pending claims
  - If user has pending claims, show Alert component with:
    - Count of pending claims
    - List of business names and submission dates
  - Update empty state messaging based on pending claims

**Files Modified:**
- `src/app/dashboard/my-businesses/page.tsx`
- `src/components/ui/alert.tsx` (added via shadcn)

---

## Phase 9: Verification & Cleanup
**Status**: Complete

- [x] Run lint check (`pnpm run lint`)
- [x] Run typecheck (`pnpm run typecheck`)
- [x] Fix any lint/type errors (none found)

---

## Summary

### Files to Create (5)
1. `src/app/api/claims/route.ts`
2. `src/app/api/admin/claims/route.ts`
3. `src/app/api/admin/claims/[id]/route.ts`
4. `src/components/admin/claims/claims-page-client.tsx`
5. `src/components/admin/claims/index.ts`

### Files to Modify (6)
1. `src/lib/schema.ts` - Add claims table ✅
2. `src/lib/data/businesses-db.ts` - Fix isClaimed ✅
3. `src/components/business/claim-business-cta.tsx` - Add modal form
4. `src/app/[category]/[slug]/page.tsx` - Pass session/businessId
5. `src/app/admin/claims/page.tsx` - Use real data
6. `src/app/dashboard/my-businesses/page.tsx` - Add pending claims alert

### Dependencies
- `mailgun` - Email service provider (handled in separate branch)

### Environment Variables
- Mailgun credentials (handled in separate branch)
