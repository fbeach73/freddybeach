# Phase 1: Plans Source of Truth + Tier Consolidation - Requirements

**Suggested agent:** nextjs-backend-engineer · **Depends on:** nothing · **Blocks:** all other phases

## Problem Statement

FreddyBeach has TWO overlapping tier systems and marketing copy that mismatches enforced limits:

1. **Legacy role-based tiers** (`free`/`enhanced`/`featured`) with env token limits (`FREE_TIER_IMAGE_TOKENS=10` etc.) — still used by the refine route and some pages.
2. **Payment-based tiers** (BYOK → subscription → credits → free) in `src/lib/services/token-system.ts` — the real system.
3. `src/lib/data/packages.ts` contains unwired marketing tiers (Free/Enhanced $99yr/Featured $199yr) that contradict both.

Two verified bugs:
- `src/app/api/ai-tools/generate/route.ts:172` calls `consumeCredit()` unconditionally — subscribers/BYOK users holding top-up credits get charged per text generation.
- `src/app/api/generate/[id]/refine/route.ts:120` uses legacy `canGenerateCount()` instead of `canGenerateWithDetails()`.

The new model (owner decision): **Free (10 credits/mo) → Starter $9/mo (100 credits/mo) → Pro $29/mo (soft-cap 500/mo)**, credit packs as top-ups, BYOK Pro $7.99/mo. Payments move to Stripe in Phase 2 — this phase prepares the domain model.

## Requirements

### R1: Canonical plans module
- New `src/lib/data/plans.ts` is the ONLY place plan names, prices, features, and allowances are defined
- Plans: `free`, `starter` ($9/mo, 100 credits/mo), `pro` ($29/mo, soft-cap unlimited), `byokPro` ($7.99/mo) + `creditPacks` (10/$1.99, 50/$6.99, 100/$9.99 — unchanged)
- Each plan: id, name, price, priceLabel, foundingPriceLabel, features[], stripePriceEnvKey, allowance metadata
- `src/lib/data/packages.ts` keeps only `consultationPackages`; legacy `pricingTiers` deleted; existing consumers re-pointed (billing page, Polar webhook, pricing-grid, ai-pricing-section)

### R2: SubscriptionTier consolidation
- `SubscriptionTier = "starter" | "pro" | "byok"` in token-system.ts
- Legacy DB values `monthly`/`yearly` normalized to `pro` via `LEGACY_TIER_MAP` in `getSubscriptionInfo()` (defensive — Polar webhook still writes them during sunset)
- One-time data migration: `UPDATE "user" SET subscription_tier='pro' WHERE subscription_tier IN ('monthly','yearly');`

### R3: Free tier monthly refresh (no cron)
- New `user.freeCreditsGrantedMonth` column (text, YYYY-MM)
- New `ensureMonthlyFreeCredits(userId)` in token-system.ts: if month changed AND user has no active sub/BYOK, top balance UP TO 10 via `addCredits(..., "admin_grant", "Monthly free credits")` and stamp the month
- Called inside `canGenerateWithDetails()` before the credits check — lazy, no scheduler
- The 10-credit signup welcome grant in `src/lib/auth.ts` stays as-is

### R4: Eligibility + metering correctness
- Priority in `canGenerateWithDetails()`: BYOK (unlimited) → pro subscription (500/mo soft cap, unchanged) → credits (starter grants + free credits + purchased packs all land here) → deny
- Text-tool route consumes a credit ONLY when `eligibility.reason === "credits"`; subscription/BYOK paths call `logSubscriptionUsage` + `incrementTokenUsage` (mirror the image route)
- Refine route migrated to `canGenerateWithDetails` with the same consume/log split

### R5: Stripe-ready subscription functions
- `activateSubscription`/`extendSubscription` accept optional `expiresAt?: Date` so webhooks can pass Stripe's `current_period_end` exactly; existing date computation stays as fallback (Polar path)

### R6: Founding-member primitives
- Schema: `user.foundingMember` boolean default false notNull; `user.stripeCustomerId` text unique
- `getFoundingMemberCount()` and idempotent `markFoundingMember(userId)` (no-op at count ≥ 100) in token-system.ts

### R7: Deprecate legacy role-based tier path
- `@deprecated` JSDoc on `getUserTier`, `getTokenLimit`, `canGenerate`, `canGenerateCount`, `getUsageStats`
- Keep `incrementTokenUsage`/`getTokenUsage` — they power the Pro soft cap
- **Do NOT touch business listing tiers** — `featured`/`enhanced` on the `business` table and business-card/category/search components are a separate directory concept

## Existing Infrastructure to Reuse
- `src/lib/services/token-system.ts` — credit ledger (`addCredits`, `consumeCredit`, `creditTransaction`), soft cap (`userTokenUsage`, `checkSoftCap`), subscription lifecycle fns. Extend, don't rewrite.
- Drizzle workflow: `pnpm db:generate && pnpm db:migrate`

## Out of Scope
- Any Stripe code (Phase 2), any UI (Phases 3–5), removing Polar

## Acceptance Criteria
- `pnpm lint && pnpm typecheck` clean
- Text generation as Pro subscriber does NOT decrement `creditBalance` (regression test for the double-charge bug)
- Free user with stale `freeCreditsGrantedMonth` and 3 credits gets topped to 10 on next eligibility check
- `getSubscriptionInfo()` on a user with tier `monthly` reports `pro`
