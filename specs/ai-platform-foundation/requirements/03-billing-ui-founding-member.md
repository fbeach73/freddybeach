# Phase 3: Billing UI + Founding-Member System - Requirements

**Suggested agent:** frontend-react-engineer (+ ui-expert review) · **Depends on:** Phases 1–2

## Problem Statement

The billing page is Polar-wired and shows the old tier model. There is no `/pricing` page at all (header will link to it in Phase 5), and no "get in early" / founding-member presence anywhere on the site (verified by grep — completely greenfield). The founding concept must be reusable across channels: homepage, pricing, tools hub, dashboard, emails.

## Requirements

### R1: Founding-member banner + counter (reusable)
- New `src/components/marketing/founding-member-banner.tsx` (+ small counter subcomponent), server component reading `getFoundingMemberCount()` (Phase 1)
- **Honest copy only** — while count is low: "Be one of the first 100 Fredericton businesses — founding members lock in founding prices for life." Once count is meaningful, show the real "X of 100 claimed" counter. Never fabricate numbers.
- Variants/props for placement: full banner (homepage/pricing) and compact strip (tools hub, dashboard)
- Neo-brutalist styling (nb-* classes, yellow accent), dark-mode compliant

### R2: Billing dashboard update (`src/app/dashboard/billing/page.tsx`)
- Plan card: Free / Starter / Pro / BYOK Pro name + Founding badge when `user.foundingMember`
- Credit balance + this-month usage meter (reuse `getUserTierData()`; Pro shows soft-cap progress 0–500)
- "Manage subscription" button → `POST /api/billing/portal` (Stripe portal)
- Upgrade CTAs and copy driven entirely from `src/lib/data/plans.ts` — no hardcoded prices
- Legacy Polar subscribers (active sub, no `stripeCustomerId`): show "Billed via Polar (legacy)" note instead of the portal button
- Keep BYOK section (`ApiKeySection`) and credit-pack purchase grid (buttons re-pointed to Stripe checkout)

### R3: Pricing components consolidated
- `src/components/marketing/ai-pricing-section.tsx`, `pricing-card.tsx`, `pricing-grid.tsx` render the 3-tier model from `plans.ts` + credit packs + BYOK footnote
- Founding price labels (`foundingPriceLabel`) shown with strikethrough future price where defined
- Plain language throughout: what you can DO on each plan ("about 100 social posts a month"), not token jargon

### R4: New `/pricing` page
- `src/app/pricing/page.tsx`: hero → founding banner → 3 tiers → credit packs ("just topping up?") → BYOK footnote → pricing FAQ
- Metadata + `Offer`/`Product` JSON-LD following patterns in `src/lib/seo/json-ld.ts`
- CTAs: signed-out → AuthDialog sign-up; signed-in → checkout

## Existing Infrastructure to Reuse
- `src/components/marketing/` kit: `section-hero`, `cta-section`, `pricing-card`, `pricing-grid`, `trust-signals`
- `src/components/billing/{subscribe-button,purchase-credits-button,subscribe-byok-button}.tsx` — same contracts, new plan ids
- `getUserTierData()`, `getFoundingMemberCount()` from `src/lib/services/token-system.ts`
- `src/components/auth/auth-dialog.tsx`

## Out of Scope
- Invoice history / payment methods UI (stays "Coming Soon"), homepage changes (Phase 5)

## Acceptance Criteria
- `/pricing` renders 3 tiers with founding labels, signed-out and signed-in states both work
- Billing page shows correct plan/badge/meter for: free user, Starter, Pro, BYOK, legacy Polar subscriber
- Portal button round-trips to Stripe and back
- All copy sourced from `plans.ts`; `pnpm lint && pnpm typecheck` clean
