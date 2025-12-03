# AI Tools Monetization - Implementation Plan

## Phase 1: Database Schema Changes ✅

**Goal:** Add credit balance, subscription fields, and transaction tracking to the database.

**File:** `src/lib/schema.ts`

- [x] Add `creditBalance` column to `user` table (integer, default 0, not null)
- [x] Add `subscriptionTier` column to `user` table (text, nullable)
- [x] Add `subscriptionExpiresAt` column to `user` table (timestamp, nullable)
- [x] Add `subscriptionStartedAt` column to `user` table (timestamp, nullable)
- [x] Create `creditTransaction` table with fields:
  - `id` (text, primary key)
  - `userId` (text, foreign key to user)
  - `amount` (integer, +100 for purchase, -1 for usage)
  - `type` (text: "purchase" | "usage" | "refund" | "admin_grant")
  - `description` (text, nullable)
  - `balanceAfter` (integer)
  - `createdAt` (timestamp)
- [x] Run `pnpm db:generate` to generate migration
- [x] Run `pnpm db:migrate` to apply migration

---

## Phase 2: Type & Data Updates ✅

**Goal:** Add status field to AI tools and create new pricing data structures.

### Task 2.1: Update Type Definitions
**File:** `src/lib/types/business.ts`

- [x] Add `status: "available" | "coming-soon"` to `AITool` interface
- [x] Create `CreditPackage` interface
- [x] Create `SubscriptionPlan` interface

### Task 2.2: Update AI Tools Data
**File:** `src/lib/data/ai-tools.ts`

- [x] Add `status: "available"` to `image-generator` tool
- [x] Add `status: "coming-soon"` to `review-responder` tool
- [x] Add `status: "coming-soon"` to `social-post-generator` tool
- [x] Add `status: "coming-soon"` to `business-description-writer` tool
- [x] Add `status: "coming-soon"` to `email-template-generator` tool

### Task 2.3: Add New Pricing Data
**File:** `src/lib/data/packages.ts`

- [x] Add `creditPackages` array with 100 credits for $10 package
- [x] Add `subscriptionPlans` array with monthly ($29) and yearly ($199) plans
- [x] Add `byokOption` object for the free BYOK option

---

## Phase 3: UI Updates - Hero & Tool Cards ✅

**Goal:** Update hero section CTAs and add Coming Soon badges to tool cards.

### Task 3.1: Update Hero Section
**File:** `src/app/ai-tools/page.tsx`

- [x] Remove `primaryCTA` prop from `SectionHero` component
- [x] Change `secondaryCTA.text` from "View Pricing" to "More Info"
- [x] Keep `secondaryCTA.href` as `#pricing`

### Task 3.2: Add Coming Soon Badge to Tool Cards
**File:** `src/components/marketing/tool-preview-card.tsx`

- [x] Import `Badge` component from `@/components/ui/badge`
- [x] Add conditional badge for `status === "coming-soon"`
- [x] Style badge with yellow/amber colors (Coming Soon)
- [x] Update button behavior for coming-soon tools (disabled state)
- [x] Keep existing behavior for available tools

### Task 3.3: Feature the Image Generator
**File:** `src/app/ai-tools/ai-tools-showcase.tsx`

- [x] Reorder tools to display Image Generator first
- [x] Add "Available Now" visual indicator to Image Generator
- [x] Visually distinguish available vs coming-soon tools in the grid

---

## Phase 4: Credit System Service ✅

**Goal:** Create hybrid credit/subscription system with proper eligibility checks.

**File:** `src/lib/services/token-system.ts`

- [x] Add `getUserCredits(userId)` function - get credit balance
- [x] Add `hasActiveSubscription(userId)` function - check subscription status
- [x] Add `getSubscriptionInfo(userId)` function - get subscription details
- [x] Update `canGenerate(userId)` function with new priority logic:
  1. BYOK → allow unlimited
  2. Active subscription → allow (track for soft cap)
  3. Credits > 0 → allow
  4. Deny with reason
- [x] Add `consumeCredit(userId, amount)` function - deduct credits and log transaction
- [x] Add `addCredits(userId, amount, type)` function - add credits and log transaction
- [x] Add `checkSoftCap(userId)` function - check subscription usage against 500/month cap
- [x] Add `activateSubscription(userId, tier)` function - set subscription fields
- [x] Add `cancelSubscription(userId)` function - handle subscription end

---

## Phase 5: New Pricing Section Component ✅

**Goal:** Create three-column pricing display for credits, subscription, and BYOK.

**New File:** `src/components/marketing/ai-pricing-section.tsx`

- [x] Create component with three-column responsive layout
- [x] Left column: Credit purchase card ($10 for 100 credits)
- [x] Center column: Subscription card with monthly/yearly toggle
- [x] Right column: BYOK free option card
- [x] Add pricing toggle for monthly/yearly subscription
- [x] Add CTA buttons for each option
- [x] Style with consistent design system

**File:** `src/app/ai-tools/page.tsx`

- [x] Replace `PricingGrid` with new `AIPricingSection` component
- [x] Update section heading text if needed

---

## Phase 6: Payment Integration (Polar) ✅

**Goal:** Set up Polar checkout and webhook handling for payments.

### Task 6.1: Install Polar SDK
- [x] Run `pnpm add @polar-sh/sdk`
- [x] Create Polar client utility at `src/lib/polar.ts`

### Task 6.2: Create Checkout Routes
**New File:** `src/app/api/checkout/credits/route.ts`

- [x] Create POST handler for credit purchase checkout
- [x] Validate user is authenticated
- [x] Create Polar checkout session for credit package
- [x] Return checkout URL

**New File:** `src/app/api/checkout/subscription/route.ts`

- [x] Create POST handler for subscription checkout
- [x] Accept plan type (monthly/yearly) in request body
- [x] Validate user is authenticated
- [x] Create Polar checkout session for subscription
- [x] Return checkout URL

### Task 6.3: Create Webhook Handler
**New File:** `src/app/api/webhooks/polar/route.ts`

- [x] Verify webhook signature with `POLAR_WEBHOOK_SECRET`
- [x] Handle `order.paid` event:
  - If credit purchase: call `addCredits(userId, 100, "purchase")`
  - If subscription: call `activateSubscription(userId, tier)`
- [x] Handle `subscription.canceled` event - mark subscription ending
- [x] Handle `subscription.updated` event - extend subscription
- [x] Return 200 OK for successful processing

### Task 6.4: Create Polar Products (Manual - User Action Required)
- [ ] Log into Polar dashboard
- [ ] Create "100 AI Credits" product - $10 one-time
- [ ] Create "Unlimited Monthly" product - $29/month recurring
- [ ] Create "Unlimited Yearly" product - $199/year recurring
- [ ] Add product IDs to environment variables:
  - `POLAR_CREDITS_PRODUCT_ID`
  - `POLAR_MONTHLY_PRODUCT_ID`
  - `POLAR_YEARLY_PRODUCT_ID`

---

## Phase 7: Generation API Updates ✅

**Goal:** Update image generation API to use new credit system.

**File:** `src/app/api/generate/route.ts`

- [x] Import new credit system functions
- [x] Update eligibility check at start of handler:
  ```
  1. Check BYOK (existing hasOwnApiKey)
  2. Check canGenerate() with new logic
  3. Return 403 with helpful message if denied
  ```
- [x] After successful generation, update consumption logic:
  ```
  If used app key (not BYOK):
    If has subscription: track usage for soft cap only
    Else: consume credits from balance
  ```
- [x] Add soft cap warning in response if subscriber is approaching limit

---

## Phase 8: Dashboard Billing Updates ✅

**Goal:** Update billing page to show credit balance and subscription status.

**File:** `src/app/dashboard/billing/page.tsx`

- [x] Fetch user's credit balance from database
- [x] Fetch user's subscription status
- [x] Display credit balance with "Buy More Credits" CTA
- [x] Display subscription status (active/none/expiring)
- [x] Add "Subscribe" or "Manage Subscription" CTA based on status
- [x] Show subscription soft cap usage if applicable
- [x] Link CTAs to checkout routes

---

## Implementation Order Summary

1. **Phase 1** - Database schema (foundation for everything)
2. **Phase 2** - Type & data updates (no breaking changes)
3. **Phase 3** - UI updates (visible improvements)
4. **Phase 4** - Credit system service (core logic)
5. **Phase 5** - New pricing component (updated purchase UI)
6. **Phase 6** - Payment integration (enable purchases)
7. **Phase 7** - Generation API (enforce new system)
8. **Phase 8** - Dashboard billing (user visibility)

---

## Notes

- Polar env vars already exist: `POLAR_WEBHOOK_SECRET`, `POLAR_ACCESS_TOKEN`
- Existing `userTokenUsage` table can track subscription soft cap usage
- No new user role needed - subscription is orthogonal to role
- BYOK support already exists in `hasOwnApiKey()` function
