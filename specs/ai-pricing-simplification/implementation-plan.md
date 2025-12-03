# AI Pricing Simplification - Implementation Plan

## Overview

Implement simplified Credits + Paid BYOK pricing model for AI image generation.

---

## Phase 1: Credit Packs & Pricing Data ✅

### 1.1 Update Credit Package Definitions
**File:** `src/lib/data/packages.ts`

- [x] Add `credits-10` Starter Pack ($1.99 for 10 credits)
- [x] Add `credits-50` Popular Pack ($6.99 for 50 credits, mark as `isPopular`)
- [x] Update `credits-100` Value Pack ($9.99 for 100 credits)
- [x] Add price-per-credit calculations to package data

### 1.2 Add BYOK Pro Plan Definition
**File:** `src/lib/data/packages.ts`

- [x] Create `byokPlan` object with $7.99/month pricing
- [x] Add features list for BYOK Pro
- [x] Export new plan alongside existing packages

---

## Phase 2: Resolution-Based Credit System ✅

### 2.1 Add Resolution Credit Calculator
**File:** `src/lib/services/token-system.ts`

- [x] Create `getCreditsForResolution(resolution)` function
  - 1K = 1 credit
  - 2K = 2 credits
  - 4K = 4 credits
- [x] Create `getCreditsForDimensions(width, height)` function for pixel-based calculation
- [x] Export functions for use in generation API

### 2.2 Update Credit Consumption
**File:** `src/lib/services/token-system.ts`

- [x] Update `canGenerateWithDetails()` to accept `creditsNeeded` parameter
- [x] Check if user has sufficient credits for requested resolution
- [x] Add "insufficient_credits" reason to GenerationEligibility
- [x] Return `creditsNeeded` in eligibility result

### 2.3 Update Generation API
**File:** `src/app/api/generate/route.ts`

- [x] Calculate credits needed: `creditsPerImage × imageCount`
- [x] Call `getCreditsForResolution()` to determine per-image cost
- [x] Check if user has sufficient credits before generation
- [x] Consume resolution-based credits on successful generation
- [x] Return `creditCost`, `creditsPerImage`, and `creditsRemaining` in API response

---

## Phase 3: Checkout & Payment Integration ✅

### 3.1 Update Credits Checkout
**File:** `src/app/api/checkout/credits/route.ts`

- [x] Handle new pack IDs (`credits-10`, `credits-50`, `credits-100`)
- [x] Map pack ID to correct Polar product
- [x] Pass correct credit amount in metadata

### 3.2 Create BYOK Checkout Endpoint
**File:** `src/app/api/checkout/byok/route.ts` (new)

- [x] Create new API route for BYOK Pro checkout
- [x] Create Polar checkout session for BYOK subscription
- [x] Include userId in metadata for webhook processing
- [x] Redirect to Polar checkout URL

### 3.3 Update Webhook Handler for BYOK
**File:** `src/app/api/webhooks/polar/route.ts`

- [x] Add handler for BYOK subscription created event
- [x] Add handler for BYOK subscription cancelled event
- [x] Update user's BYOK status in database (using existing subscriptionTier field with "byok" value)
- [x] Send confirmation emails for BYOK subscription changes

---

## Phase 4: Database Updates (If Needed) ✅

### 4.1 Evaluate BYOK Storage Strategy
**File:** `src/lib/schema.ts`

- [x] Decide: Add new BYOK fields OR reuse existing subscription fields with "byok" tier
  - **Decision:** Reuse existing `subscriptionTier` field with "byok" as a valid tier value
  - No schema changes needed - existing fields handle BYOK Pro subscriptions
- [x] If new fields needed: NOT NEEDED - reusing existing fields

### 4.2 Update Token System for BYOK Tier
**File:** `src/lib/services/token-system.ts`

- [x] Update `SubscriptionTier` type to include "byok" as valid value
- [x] Updated `canGenerateWithDetails()` already recognizes BYOK (checks `hasOwnApiKey()`)
- [x] BYOK Pro users: have "byok" subscriptionTier + must have stored API key to generate

---

## Phase 5: UI Updates ✅

### 5.1 Update Billing Page
**File:** `src/app/dashboard/billing/page.tsx`

- [x] Display all 3 credit packs in responsive grid
- [x] Add BYOK Pro subscription card with $7.99/month price
- [x] Add "Subscribe" button for BYOK Pro
- [x] Show credit cost per resolution (1K=1, 2K=2, 4K=4)
- [x] Update current balance display

### 5.2 Update Image Generator UI
**Files:** `src/components/generate/preview-generate.tsx`, `src/components/generate/image-generator-page.tsx`

- [x] Show credit cost based on selected resolution (per-image and total)
- [x] Warn user if insufficient credits for selected resolution
- [x] Update canGenerate check to account for resolution-based credits
- [x] Added hasSubscription prop for proper tier detection

### 5.3 Add BYOK Pro Promotion
**Files:** `src/components/generate/api-key-manager.tsx`, `src/components/billing/api-key-section.tsx`

- [x] Add BYOK Pro upsell in API key manager (when key is connected but no BYOK Pro sub)
- [x] Show "Upgrade to BYOK Pro" promotion with benefits and pricing
- [x] Display BYOK Pro Active badge when user has subscription
- [x] Added hasByokPro prop to ApiKeyManager and ApiKeySection components

---

## Phase 6: External Setup (Manual)

### 6.1 Create Polar Products
**External:** Polar Dashboard

- [ ] Create product: `credits-10` - 10 Credits - $1.99 (one-time)
- [ ] Create product: `credits-50` - 50 Credits - $6.99 (one-time)
- [ ] Create product: `credits-100` - 100 Credits - $9.99 (one-time)
- [ ] Create product: `byok-pro` - BYOK Pro - $7.99/month (subscription)

### 6.2 Update Environment Variables ✅
**File:** `env.example` and `.env`

- [x] Add `POLAR_CREDITS_10_PRODUCT_ID`
- [x] Add `POLAR_CREDITS_50_PRODUCT_ID`
- [x] Add `POLAR_CREDITS_100_PRODUCT_ID`
- [x] Add `POLAR_BYOK_PRO_PRODUCT_ID`

---

## Files Summary

| File | Action |
|------|--------|
| `src/lib/data/packages.ts` | Update credit packs, add BYOK pricing |
| `src/lib/services/token-system.ts` | Add `getCreditsForResolution()`, update consumption |
| `src/app/api/generate/route.ts` | Use resolution-based credits |
| `src/app/api/checkout/credits/route.ts` | Handle new pack IDs |
| `src/app/api/checkout/byok/route.ts` | **New** - BYOK subscription checkout |
| `src/app/api/webhooks/polar/route.ts` | Handle BYOK subscription events |
| `src/app/dashboard/billing/page.tsx` | Update UI for 3 packs + BYOK + credit costs per resolution |
| `src/components/generate/preview-generate.tsx` | Show credit cost per resolution, insufficient credits warning |
| `src/components/generate/image-generator-page.tsx` | Pass new props (hasSubscription, creditsRemaining, hasByokPro) |
| `src/components/generate/api-key-manager.tsx` | Add BYOK Pro promotion and active badge |
| `src/components/billing/purchase-credits-button.tsx` | Support packId for specific pack purchases |
| `src/components/billing/subscribe-byok-button.tsx` | **New** - BYOK Pro subscribe button |
| `src/components/billing/api-key-section.tsx` | Pass hasByokPro prop |
| `src/lib/schema.ts` | Add BYOK subscription fields (if needed) |
| `env.example` | Add new Polar product IDs |

---

## Verification Checklist

After implementation:

- [x] All 3 credit packs display correctly on billing page
- [x] Credit purchase flow works for each pack size
- [x] BYOK Pro subscription checkout works
- [x] Resolution-based credit consumption working (1K=1, 2K=2, 4K=4)
- [x] BYOK subscribers can generate unlimited with own key
- [x] Webhook handles all new events correctly
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes
