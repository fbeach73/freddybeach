# AI Monetization Fixes - Implementation Plan

## Overview

This plan addresses the bugs, code duplication, and missing functionality identified in the AI tools monetization code review. Phases are ordered by priority with critical fixes first.

---

## Phase 1: Critical Bug Fixes ✅ COMPLETE

> **Status:** All implementation tasks complete. Manual webhook testing with Polar test events recommended before production use.

### 1.1 Fix Billing Page POST Button

**Problem:** Buy Credits button uses Link for a POST endpoint, causing silent failures.

**Tasks:**
- [x] Create `src/components/billing/purchase-credits-button.tsx` client component
- [x] Implement POST fetch to `/api/checkout/credits` endpoint
- [x] Handle loading state during checkout creation
- [x] Handle errors with toast notification
- [x] Redirect to Polar checkout URL on success
- [x] Update `src/app/dashboard/billing/page.tsx` to use new component
- [x] Apply same pattern for subscription buttons if needed

**Files to modify:**
- `src/app/dashboard/billing/page.tsx`

**Files to create:**
- `src/components/billing/purchase-credits-button.tsx`
- `src/components/billing/subscribe-button.tsx`

---

### 1.2 Add Email Notifications to Webhook

**Problem:** Users don't receive email confirmations for purchases and subscription changes.

**Tasks:**
- [x] Import email functions in webhook handler
- [x] Fetch user details (name, email) by userId in each handler
- [x] Add `sendPurchaseConfirmationEmail()` call in `handleOrderPaid()`
- [x] Add `sendSubscriptionStartedEmail()` call in `handleSubscriptionCreated()`
- [x] Add `sendSubscriptionRenewedEmail()` call in `handleSubscriptionUpdated()`
- [x] Add `sendSubscriptionCancelledEmail()` call in `handleSubscriptionCanceled()`
- [x] Handle email send failures gracefully (log, don't fail webhook)
- [ ] Test webhook with Polar test events

**Files to modify:**
- `src/app/api/webhooks/polar/route.ts`

---

## Phase 2: Code Duplication Refactor ✅ COMPLETE

> **Status:** All implementation tasks complete. Both routes use the shared component.

### 2.1 Extract Shared Image Generator Component

**Problem:** Two 640+ line files are 99% identical.

**Tasks:**
- [x] Create `src/components/generate/image-generator-page.tsx` shared component
- [x] Accept props for configuration differences:
  - `backLink: string` (e.g., "/ai-tools" or "/dashboard/ai-tools")
  - `backLinkText: string`
  - `containerClassName?: string`
  - `tabsListClassName?: string`
  - `upgradeLink?: string`
- [x] Move all shared state, hooks, handlers, and JSX to shared component
- [x] Update `src/app/ai-tools/image-generator/page.tsx` to use shared component
- [x] Update `src/app/dashboard/ai-tools/image-generator/page.tsx` to use shared component
- [x] Verify both routes work correctly after refactor (typecheck & lint pass)
- [x] Delete any orphaned duplicate code (both page files now ~15 lines each)

**Files created:**
- `src/components/generate/image-generator-page.tsx`

**Files modified:**
- `src/app/ai-tools/image-generator/page.tsx` (now uses shared component)
- `src/app/dashboard/ai-tools/image-generator/page.tsx` (now uses shared component)
- `src/components/generate/index.ts` (added export)

---

## Phase 3: User Tier Fixes ✅ COMPLETE

> **Status:** All implementation tasks complete. Server-side data fetching now provides accurate tier information to UI.

### 3.1 Fetch Actual User Tier

**Problem:** Image generator hardcodes `userTier = "free"`.

**Tasks:**
- [x] Create server-side data fetching wrapper for image generator
- [x] Fetch user subscription info using `getSubscriptionInfo()` and `getUserCredits()`
- [x] Fetch usage stats using `getUsageStats()` or `checkSoftCap()`
- [x] Check BYOK status using `hasOwnApiKey()`
- [x] Pass fetched data as props to client component
- [x] Update client component to use props instead of hardcoded values
- [x] Display accurate tier, usage, and remaining tokens

**Files modified:**
- `src/components/generate/image-generator-page.tsx` (added UserTierData props interface)
- `src/components/generate/index.ts` (exported new types)
- `src/app/ai-tools/image-generator/page.tsx` (converted to server component)
- `src/app/ai-tools/image-generator/client.tsx` (new client wrapper)
- `src/app/dashboard/ai-tools/image-generator/page.tsx` (converted to server component)
- `src/app/dashboard/ai-tools/image-generator/client.tsx` (new client wrapper)
- `src/lib/services/token-system.ts` (added getUserTierData() function)

---

### 3.2 Clarify Tier Priority Logic

**Problem:** Role-based and subscription-based tiers aren't reconciled.

**Tasks:**
- [x] Document tier priority in `src/lib/services/token-system.ts`:
  1. BYOK (unlimited) - highest priority
  2. Active subscription (monthly/yearly)
  3. Credits (pay-per-use)
  4. Free tier - default
- [x] Update `canGenerateWithDetails()` to return unified tier info
- [x] Add `effectiveTier` field to GenerationEligibility interface
- [x] Update UI to display effective tier consistently

**Files modified:**
- `src/lib/services/token-system.ts` (added effectiveTier to GenerationEligibility, documented priority)

---

## Phase 4: Audit Trail & Soft Cap ✅ COMPLETE

> **Status:** All implementation tasks complete. Subscription usage is now logged to audit trail and soft cap enforcement is configurable.

### 4.1 Complete Audit Trail for Subscriptions

**Problem:** Subscription usage not logged to creditTransaction.

**Tasks:**
- [x] Add new transaction type: `"subscription_usage"`
- [x] Create `logSubscriptionUsage()` function in token-system
- [x] Call in generate API when `eligibility.reason === "subscription"`
- [x] Set amount to 0 (no credit consumed) but log the generation
- [x] Ensure billing history shows all generations regardless of payment method

**Files modified:**
- `src/lib/services/token-system.ts`
- `src/app/api/generate/route.ts`

---

### 4.2 Document Soft Cap Behavior

**Problem:** Unclear if soft cap is enforced or just a warning.

**Tasks:**
- [x] Add `ENFORCE_SOFT_CAP` environment variable (default: false)
- [x] Update `canGenerateWithDetails()` to check env var
- [x] Block generation if soft cap exceeded and enforcement enabled
- [x] Update billing page to show soft cap status clearly
- [x] Add tooltip/help text explaining soft cap policy

**Files modified:**
- `src/lib/services/token-system.ts`
- `src/app/dashboard/billing/page.tsx`
- `env.example`

---

## Phase 5: Polish & Cleanup ✅ COMPLETE

> **Status:** All implementation tasks complete. BYOK UI added, authenticated users redirect to dashboard, TODOs resolved with actual subscription data, webhook robustness improved.

### 5.1 Add BYOK Management UI

**Problem:** No accessible UI to add/manage API keys.

**Tasks:**
- [x] Add "API Keys" section to billing page
- [x] Import `ApiKeyManager` component
- [x] Create client wrapper for API key section
- [x] Allow users to add/remove their Google API key
- [x] Show status indicator when key is configured

**Files modified:**
- `src/app/dashboard/billing/page.tsx`

**Files created:**
- `src/components/billing/api-key-section.tsx`

---

### 5.2 Consolidate Generation Entry Points

**Problem:** Three different routes cause confusion.

**Tasks:**
- [x] Decide canonical path: `/dashboard/ai-tools/image-generator`
- [x] `/generate` page: Already properly links to dashboard for authenticated users (kept as marketing page)
- [x] Update `/ai-tools/image-generator` to redirect authenticated users to dashboard
- [x] Keep public landing pages for marketing/SEO
- [x] Internal links already point to canonical path

**Files modified:**
- `src/app/ai-tools/image-generator/page.tsx` (added redirect for authenticated users)

---

### 5.3 Resolve TODO Comments

**Tasks:**
- [x] Review and resolve TODOs in `src/app/dashboard/page.tsx:64-66`
  - Now fetches actual AI tool usage count from creditTransaction table
  - Calculates hours saved based on usage (0.5 hrs per generation)
  - Gets current plan from subscription system (BYOK/Yearly/Monthly/Free)
- [x] Updated `src/app/dashboard/ai-tools/page.tsx` with actual subscription/usage data
- [x] Updated `src/app/dashboard/ai-tools/[slug]/page.tsx` with actual subscription/usage data
- [x] Email templates TODOs remain (out of scope - would require actual stats infrastructure)

**Files modified:**
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/ai-tools/page.tsx`
- `src/app/dashboard/ai-tools/[slug]/page.tsx`

---

### 5.4 Improve Webhook Robustness

**Tasks:**
- [x] Add validation for required metadata fields (validateMetadata function)
- [x] Log warning when falling back to product name parsing
- [x] Added subscription ID to error logs for better debugging
- [x] Add retry logic documentation (header comment with retry schedule)

**Files modified:**
- `src/app/api/webhooks/polar/route.ts`

---

## Verification Checklist

After implementation, verify:

- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
- [ ] Credits purchase flow works end-to-end
- [ ] Subscription purchase flow works end-to-end
- [ ] Emails are sent (check logs in development)
- [ ] User tier displays correctly for different user types
- [ ] Both image generator routes work
- [ ] BYOK users see "unlimited" status
- [ ] Soft cap warning appears at 80% usage

---

## Files Summary

### Files Created
- `src/components/billing/purchase-credits-button.tsx` ✅ (Phase 1)
- `src/components/billing/subscribe-button.tsx` ✅ (Phase 1)
- `src/components/generate/image-generator-page.tsx` ✅ (Phase 2)
- `src/app/ai-tools/image-generator/client.tsx` ✅ (Phase 3)
- `src/app/dashboard/ai-tools/image-generator/client.tsx` ✅ (Phase 3)
- `src/components/billing/api-key-section.tsx` ✅ (Phase 5)

### Files Modified
- `src/app/dashboard/billing/page.tsx` ✅
- `src/app/api/webhooks/polar/route.ts` ✅
- `src/app/ai-tools/image-generator/page.tsx` ✅
- `src/app/dashboard/ai-tools/image-generator/page.tsx` ✅
- `src/lib/services/token-system.ts` ✅
- `src/components/generate/index.ts` ✅
- `src/app/api/generate/route.ts` ✅ (Phase 4 - added logSubscriptionUsage call)
- `env.example` ✅ (Phase 4 - added ENFORCE_SOFT_CAP)
- `src/components/billing/index.ts` ✅ (Phase 5 - added ApiKeySection export)
- `src/app/dashboard/page.tsx` ✅ (Phase 5 - resolved TODOs)
- `src/app/dashboard/ai-tools/page.tsx` ✅ (Phase 5 - resolved TODOs)
- `src/app/dashboard/ai-tools/[slug]/page.tsx` ✅ (Phase 5 - resolved TODOs)
