# AI Platform Foundation - Implementation Plan

> FreddyBeach pivots from "directory with some AI tools" to "local-business AI platform with the directory as its SEO moat."
> This slice: tier consolidation (Free/Starter/Pro) + Polar→Stripe migration + tools hub redesign + founding-member ("get in early") system + finish 2 stub tools + homepage repositioning + loose ends.
> New AI tools (AEO score etc.) are roadmap-only — see `roadmap-and-skills.md`.

## Phase Index & Agent Assignment

| Phase | Spec | Suggested agent | Depends on |
|---|---|---|---|
| 1. Plans source of truth + tier consolidation | `requirements/01-plans-tier-consolidation.md` | nextjs-backend-engineer | — |
| 2. Stripe foundation (checkout, webhook, portal) | `requirements/02-stripe-migration.md` | nextjs-backend-engineer (payments review pass after) | Phase 1 |
| 3. Billing UI + founding-member system | `requirements/03-billing-ui-founding-member.md` | frontend-react-engineer | Phases 1–2 |
| 4. Finish stub tools + tools hub redesign | `requirements/04-tools-hub-redesign.md` | frontend-react-engineer | Phase 1 |
| 5. Homepage repositioning + nav/footer | `requirements/05-homepage-repositioning.md` | frontend-react-engineer + ui-expert review | Phases 1, 3 (banner component) |
| 6. Loose ends (chat metering, success-stories) | `requirements/06-loose-ends.md` | nextjs-backend-engineer | Phase 1 |

**Sequencing:** Phase 1 first (one session, own PR). Then two parallel tracks: **Track A** = Phases 2→3 (billing), **Track B** = Phases 4→5 (product surface). Phase 6 anytime after Phase 1. Verification gates merge. ~4 focused sessions.

**Review agents:** run `code-reviewer` after each phase; `ui-expert` on Phases 3–5; `better-auth-expert` if any auth files are touched.

## Design Commitments (decided — do not re-litigate)

- **Payments move to Stripe.** Polar webhook stays mounted (sunset, read-only) so existing subscribers keep renewing; all checkout CTAs switch to Stripe. Delete no Polar code this slice.
- **3 tiers:** Free (10 credits/mo) → Starter $9/mo (100 credits/mo) → Pro $29/mo (soft-cap "unlimited", 500/mo). Credit packs stay as top-ups; BYOK Pro $7.99/mo stays as power option.
- **Starter = credit-allowance plan** implemented as a monthly `addCredits(100)` grant on Stripe `invoice.paid` — reuses the existing ledger, no new metering system.
- **Pro = existing subscription path** (soft cap via `userTokenUsage`). `SubscriptionTier` becomes `"starter" | "pro" | "byok"`; legacy `monthly`/`yearly` rows data-migrate to `pro` + defensive normalizer.
- **Free = lazy monthly top-up-to-10 credits** via new `user.freeCreditsGrantedMonth` column checked during eligibility. No cron.
- **Founding member:** `user.foundingMember` set on first successful Stripe checkout while count < 100. Honest counter (no fake numbers). Price lock = Stripe native behavior (existing subs keep their price when list prices rise).
- **All text tools cost 1 credit; plans differ only by allowance.** Retire the `PremiumToolGate` blur; signed-out users see real example I/O + "10 free credits every month" CTA.
- **Tone everywhere:** uncomplicated, fun, plain language. No jargon. The average SMB owner must never feel overwhelmed.

## Verified Bugs Fixed in This Slice

1. **Double-charging subscribers** — `src/app/api/ai-tools/generate/route.ts:172` calls `consumeCredit()` unconditionally; Pro/BYOK users holding top-up credits get charged per text generation. (Phase 1)
2. **Refine route uses legacy limiter** — `src/app/api/generate/[id]/refine/route.ts:120` uses role-based `canGenerateCount()` instead of payment-based `canGenerateWithDetails()`. (Phase 1)
3. **`/api/chat` is unauthenticated + unmetered** OpenRouter spend. (Phase 6)
4. **`cancelSubscription()` is a no-op** (logs only) — fine for cancel-at-period-end, but Stripe `customer.subscription.deleted` must call `endSubscriptionImmediately()`. (Phase 2)

---

## Phase 1: Plans Source of Truth + Tier Consolidation

### Tasks
- [x] Create `src/lib/data/plans.ts` — canonical `PLANS` (free / starter $9 / pro $29 / byokPro $7.99) + `creditPacks` (keep the 3 packs). Fields: id, name, price, priceLabel, foundingPriceLabel, features[], stripePriceEnvKey, allowance metadata. Helpers: `getPlanById()` etc.
- [x] Modify `src/lib/data/packages.ts` — keep `consultationPackages`; delete legacy `pricingTiers`; re-point consumers of `creditPackages`/`subscriptionPlans`/`byokProPlan` to `plans.ts`. Consumers (grep-verified): `src/app/dashboard/billing/page.tsx`, `src/app/api/webhooks/polar/route.ts`, `src/components/marketing/pricing-grid.tsx`, `src/components/marketing/ai-pricing-section.tsx`.
- [x] Modify `src/lib/services/token-system.ts`:
  - `SubscriptionTier = "starter" | "pro" | "byok"` + `LEGACY_TIER_MAP { monthly: "pro", yearly: "pro" }` applied in `getSubscriptionInfo()`
  - Eligibility order in `canGenerateWithDetails()`: BYOK → pro sub (soft cap) → credits, with new `ensureMonthlyFreeCredits(userId)` called before the credits check
  - `activateSubscription`/`extendSubscription`: optional `expiresAt?: Date` param (Stripe passes `current_period_end` exactly; Polar path keeps computing dates)
  - New `getFoundingMemberCount()` + idempotent `markFoundingMember(userId)` (cap 100)
  - Mark legacy role-based fns `@deprecated` (`getUserTier`, `getTokenLimit`, `canGenerate`, `canGenerateCount`, `getUsageStats`); keep `incrementTokenUsage`/`getTokenUsage` (they power the soft cap)
- [x] Fix bug #1 in `src/app/api/ai-tools/generate/route.ts` — consume credit only when `eligibility.reason === "credits"`; else `logSubscriptionUsage` + `incrementTokenUsage` (mirror the image route)
- [x] Fix bug #2 in `src/app/api/generate/[id]/refine/route.ts` — switch to `canGenerateWithDetails` with proper consume/log split
- [x] Schema (`src/lib/schema.ts` user table): add `stripeCustomerId` (text, unique), `foundingMember` (boolean, default false, notNull), `freeCreditsGrantedMonth` (text, YYYY-MM)
- [x] `pnpm db:generate && pnpm db:migrate`; one-time data migration: `UPDATE "user" SET subscription_tier = 'pro' WHERE subscription_tier IN ('monthly','yearly');`
- [x] Keep the 10-credit signup welcome grant in `src/lib/auth.ts` as-is

### Files
- `src/lib/data/plans.ts` (new)
- `src/lib/data/packages.ts` (edit)
- `src/lib/services/token-system.ts` (edit)
- `src/lib/schema.ts` (edit + migration)
- `src/app/api/ai-tools/generate/route.ts` (edit)
- `src/app/api/generate/[id]/refine/route.ts` (edit)

---

## Phase 2: Stripe Foundation

### Tasks
- [ ] `pnpm add stripe`
- [ ] Create `src/lib/stripe.ts` (mirror `src/lib/polar.ts`): pinned-apiVersion client from `STRIPE_SECRET_KEY`; `STRIPE_PRICES` env map (`STRIPE_PRICE_STARTER_MONTHLY`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`, `STRIPE_PRICE_BYOK_PRO`, `STRIPE_PRICE_CREDITS_10/50/100`); `getOrCreateStripeCustomer(userId, email, name)` reading/writing `user.stripeCustomerId`; reuse `getAppUrl()` pattern
- [ ] Rewrite checkout routes **in place, same request/response contracts** (so billing buttons barely change):
  - `src/app/api/checkout/subscription/route.ts` — `mode: "subscription"`, metadata `{ userId, type, plan }`
  - `src/app/api/checkout/credits/route.ts` — `mode: "payment"`, metadata `{ userId, type: "credits", credits }`
  - `src/app/api/checkout/byok/route.ts` — `mode: "subscription"`, plan `byok`
- [ ] Create `src/app/api/billing/portal/route.ts` — Stripe billing portal session → return to `/dashboard/billing`
- [ ] Create `src/app/api/webhooks/stripe/route.ts` (clone Polar webhook structure; reuse token-system fns):
  - `checkout.session.completed`: persist customer id; credits → `addCredits` + confirmation email; `markFoundingMember`
  - `customer.subscription.created/updated` (active/trialing): tier from metadata (fallback: price-ID match) → `activateSubscription(userId, tier, current_period_end)`; Starter gets first 100 credits here; `markFoundingMember`
  - `invoice.paid` (guard `billing_reason !== "subscription_create"` — load-bearing, prevents double grant): `extendSubscription`; Starter → `addCredits(100, "purchase", "Starter monthly credits")`
  - `subscription.updated` with `cancel_at_period_end: true` → `cancelSubscription`; `subscription.deleted` → `endSubscriptionImmediately`
  - userId via metadata, fallback `stripeCustomerId` lookup; 500 on ledger failure (Stripe retries), 200 on email failure — same policy as Polar handler
- [ ] Polar: add `// SUNSET` header comment to `src/app/api/webhooks/polar/route.ts` + `src/lib/polar.ts`; leave functional
- [ ] Env (underscores): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, 7 price IDs; update `env.example`
- [ ] Manual prereq (owner): create products/prices in Stripe dashboard, test mode first, names like "Starter (Founding)"

### Files
- `src/lib/stripe.ts` (new)
- `src/app/api/checkout/{subscription,credits,byok}/route.ts` (rewrite)
- `src/app/api/billing/portal/route.ts` (new)
- `src/app/api/webhooks/stripe/route.ts` (new)
- `env.example` (edit)

---

## Phase 3: Billing UI + Founding-Member System

### Tasks
- [ ] Create `src/components/marketing/founding-member-banner.tsx` + counter (server component using `getFoundingMemberCount()`); honest copy — "Be one of the first 100" while count is low, real counter once meaningful; nb-* neo-brutalist styling, yellow accent
- [ ] Modify `src/app/dashboard/billing/page.tsx`: plan display (Free/Starter/Pro/BYOK + Founding badge), credit balance + this-month usage meter, "Manage subscription" → portal route, upgrade CTAs from `plans.ts`; show "billed via Polar (legacy)" when active sub but no `stripeCustomerId`
- [ ] Modify `src/components/billing/{subscribe-button,purchase-credits-button,subscribe-byok-button}.tsx`: new plan ids, copy from `plans.ts`
- [ ] Modify `src/components/marketing/ai-pricing-section.tsx` + `pricing-card.tsx`/`pricing-grid.tsx`: 3-tier model + credit packs + BYOK footnote + founding price labels
- [ ] Create `src/app/pricing/page.tsx` (route doesn't exist today): hero + 3 tiers + credit packs + FAQ + founding banner; metadata + Offer JSON-LD (pattern from `src/lib/seo/json-ld.ts`)

### Files
- `src/components/marketing/founding-member-banner.tsx` (new)
- `src/app/dashboard/billing/page.tsx` (edit)
- `src/components/billing/*.tsx` (edit)
- `src/components/marketing/{ai-pricing-section,pricing-card,pricing-grid}.tsx` (edit)
- `src/app/pricing/page.tsx` (new)

---

## Phase 4: Finish Stub Tools + Tools Hub Redesign

### Tasks
- [ ] `src/lib/data/ai-tools.ts`: `business-description-writer` + `email-template-generator` → `status: "available"` (their prompts already exist in `TOOL_PROMPTS`; the generate route never checked `status`); replace `tier` with `category` ("reviews" | "marketing" | "content" | "images") + `costLabel` ("1 credit")
- [ ] Ripple through `AITool` type (`src/lib/types/business.ts`) and `TierBadge` (`src/components/shared/tier-badge.tsx` → "Free to try"/cost badge)
- [ ] **Caution:** `featured`/`enhanced` also name BUSINESS listing tiers (business-card, category/search pages) — directory concepts, untouched. Only chase USER-tier hits: `src/app/dashboard/page.tsx`, ai-tools pages, `src/app/generate/generate-client.tsx`, `src/types/dashboard.ts`
- [ ] Rewrite `src/app/ai-tools/page.tsx` (hub): founding banner; category-grouped tool cards with one-sentence plain-language benefits + example peeks; Review Collector pinned first; signed-in usage meter via `getUserTierData()`; pricing teaser
- [ ] Modify `src/app/ai-tools/[slug]/page.tsx`: delete `PremiumToolGate` blur path; signed-out → real example I/O + "Create a free account — 10 free credits every month" CTA; signed-in → `AIToolInterface`; keep review-collector/image-generator special pages

### Files
- `src/lib/data/ai-tools.ts` (edit)
- `src/lib/types/business.ts` (edit)
- `src/components/shared/tier-badge.tsx` (edit)
- `src/app/ai-tools/page.tsx` (rewrite)
- `src/app/ai-tools/[slug]/page.tsx` (edit)

---

## Phase 5: Homepage Repositioning + Nav/Footer

### Tasks
- [ ] Rewrite `src/app/page.tsx`: hero "AI tools for Fredericton businesses — get in early" (AuthDialog CTA + founding banner) → Review Collector flagship card (keep `ReviewCollectorDemoWidget`) → toolbox grid (updated `LighterToolsGrid`, 6 tools) → **directory section** reusing `HeroSection` search + `CategoryGrid` + `FeaturedBusinessesWrapper` from `src/components/home/` (already used by `/home-12-04-25`) → pricing teaser → updated `HomepageFaq` (+ plan/founding entries in `homepage-faq-data.ts`); keep `generateHomepageSchema` JSON-LD + `revalidate = 60`
- [ ] Modify `src/components/site-header.tsx`: Browse Directory (/search), AI Tools, Pricing, Blog, Dashboard/Sign-in
- [ ] Modify `src/components/site-footer.tsx`: platform framing; fix dead links (Contact → /consultation; drop or re-point /about /advertise; real routes: /search /ai-tools /pricing /blog /add-business /privacy /terms /refund)

### Files
- `src/app/page.tsx` (rewrite)
- `src/components/home/lighter-tools-grid.tsx`, `homepage-faq-data.ts` (edit)
- `src/components/site-header.tsx`, `src/components/site-footer.tsx` (edit)

---

## Phase 6: Loose Ends

### Tasks
- [ ] `src/app/api/chat/route.ts`: require Better Auth session; `canGenerateWithDetails(userId, 1)`; meter in `streamText` `onFinish` (consume credit vs `incrementTokenUsage` split); `/chat` page gets sign-in gate
- [ ] Success stories: unlink `src/app/success-stories/` from nav + honest placeholder copy — fabricated "150+ businesses / 340% ROI" stats cannot sit next to an honest founding counter (owner decides on real numbers later)

### Files
- `src/app/api/chat/route.ts` (edit)
- `src/app/chat/` UI (edit)
- `src/app/success-stories/page.tsx` (edit)

---

## Phase 7: Verification (gates merge)

- [ ] `pnpm lint && pnpm typecheck` after each phase; `pnpm build` before merge
- [ ] Stripe test mode with `stripe listen --forward-to localhost:3000/api/webhooks/stripe`:
  - [ ] Free signup → 10 credits; generate → 9; rewind `freeCreditsGrantedMonth` → topped back to 10
  - [ ] Starter checkout (4242 card) → sub active + 100 credits + founding flag + email; `stripe trigger invoice.paid` → +100, expiry extended (billing_reason guard explicitly tested)
  - [ ] Pro checkout → no credit deduction (regression for double-charge bug), soft-cap meter increments
  - [ ] Credit pack → balance +N, ledger row, confirmation email
  - [ ] Portal cancel-at-period-end → access retained until expiry; `subscription.deleted` → tier cleared
  - [ ] Polar regression: replay a Polar `subscription.updated` → still extends, normalized to `pro`
  - [ ] `/api/chat` unauthenticated → 401
- [ ] Manual UI pass: `/`, `/pricing`, `/ai-tools`, both new tools generate real output, `/dashboard/billing`, all header/footer links resolve

## Risks

- **Polar/Stripe coexistence:** dual-subscriber expiry overwrite by whichever webhook fires last — acceptable at current scale; billing page labels legacy Polar subs.
- **Legacy-tier cleanup:** grep `enhanced|featured` after Phase 1 and chase every USER-tier hit; missing one leaves a page computing a tier that no longer exists. Do NOT touch business listing tiers.
- **Webhook idempotency:** `invoice.paid` + `subscription.created` both fire on first checkout — the `billing_reason` guard is load-bearing for Starter's grant.
- **`extendSubscription` date drift** if `current_period_end` isn't passed — hence the optional param in Phase 1.
