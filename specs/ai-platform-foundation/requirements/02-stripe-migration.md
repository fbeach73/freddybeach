# Phase 2: Stripe Migration - Requirements

**Suggested agent:** nextjs-backend-engineer (payments-focused review pass after — the polar-payments-expert agent's Stripe-equivalent rigor) · **Depends on:** Phase 1 · **Blocks:** Phase 3

## Problem Statement

Payments run on Polar (`src/lib/polar.ts`, checkout routes, webhook). Owner decision: migrate to **Stripe** with the new 3-tier model. Existing Polar subscribers must keep working during a sunset period — no forced migration this slice.

## Requirements

### R1: Stripe client + price map
- `pnpm add stripe`; new `src/lib/stripe.ts` mirroring the shape of `src/lib/polar.ts`
- Pinned `apiVersion`; client from `STRIPE_SECRET_KEY`
- `STRIPE_PRICES` env map: `STRIPE_PRICE_STARTER_MONTHLY`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`, `STRIPE_PRICE_BYOK_PRO`, `STRIPE_PRICE_CREDITS_10`, `STRIPE_PRICE_CREDITS_50`, `STRIPE_PRICE_CREDITS_100` (underscores — Vercel convention)
- `getOrCreateStripeCustomer(userId, email, name)` — reads/writes `user.stripeCustomerId` (added in Phase 1)
- Update `env.example`

### R2: Checkout routes (rewrite in place, same contracts)
- Keep the same paths and request/response shapes so `src/components/billing/{subscribe-button,purchase-credits-button,subscribe-byok-button}.tsx` need only plan-id changes:
  - `POST /api/checkout/subscription` — `mode: "subscription"`, accepts `plan: "starter" | "pro" | "pro-yearly"`, `subscription_data.metadata` + session `metadata`: `{ userId, type: "subscription", plan }`
  - `POST /api/checkout/credits` — `mode: "payment"`, metadata `{ userId, type: "credits", credits: "10"|"50"|"100" }`
  - `POST /api/checkout/byok` — `mode: "subscription"`, plan `byok`
- All auth-gated (Better Auth session), success/cancel URLs → `/dashboard/billing?success=...` (existing pattern)

### R3: Webhook `/api/webhooks/stripe`
Clone the structure/policies of `src/app/api/webhooks/polar/route.ts`; reuse token-system functions — do NOT reimplement ledger logic:
- Verify: `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)` (must read raw text body)
- `checkout.session.completed`: persist `stripeCustomerId`; if `metadata.type === "credits"` → `addCredits(userId, n, "purchase", ...)` + `sendPurchaseConfirmationEmail`; `markFoundingMember(userId)`. Subscription activation is NOT done here (subscription events own it — avoids double-activation)
- `customer.subscription.created`/`updated` with status `active`/`trialing`: tier from `metadata.plan`, fallback price-ID match against `STRIPE_PRICES` → `activateSubscription(userId, tier, new Date(current_period_end * 1000))`; **Starter: grant first 100 credits here**; `markFoundingMember`; subscription-started email
- `invoice.paid` with `billing_reason !== "subscription_create"` (guard is load-bearing — first invoice fires alongside subscription.created): `extendSubscription(userId, tier, periodEnd)`; **Starter: `addCredits(userId, 100, "purchase", "Starter monthly credits")`**; renewal email
- `customer.subscription.updated` with `cancel_at_period_end: true` → `cancelSubscription(userId)` + email
- `customer.subscription.deleted` → `endSubscriptionImmediately(userId)` (NOT the no-op `cancelSubscription`)
- userId resolution: metadata first, fallback lookup by `stripeCustomerId`
- Error policy (same as Polar handler): 500 on ledger failures so Stripe retries; 200 on email failures

### R4: Customer portal
- `POST /api/billing/portal` — `stripe.billingPortal.sessions.create({ customer, return_url: "/dashboard/billing" })`; auth-gated; 400 if no `stripeCustomerId`

### R5: Polar sunset (not removal)
- `// SUNSET: legacy Polar billing — existing subscribers only. All new checkouts go through Stripe.` header comments on `src/app/api/webhooks/polar/route.ts` and `src/lib/polar.ts`
- Polar webhook stays mounted and functional (its `monthly`/`yearly` writes normalize to `pro` via Phase 1's `LEGACY_TIER_MAP`)
- Delete nothing

### R6: Founding-member hook
- Every successful first Stripe purchase (subscription OR credit pack) calls `markFoundingMember(userId)` while count < 100
- Founding price lock needs no machinery — Stripe subscriptions keep their price when list prices later rise; owner names founding prices in the dashboard ("Starter (Founding)")

## Manual Prerequisites (owner, before merge)
- Create products/prices in Stripe dashboard (test mode first): Starter $9/mo, Pro $29/mo, Pro yearly (optional), BYOK Pro $7.99/mo, 3 one-time credit prices
- Set env vars in Vercel + `.env.local`
- Configure webhook endpoint in Stripe dashboard (prod) / `stripe listen` (dev)

## Existing Infrastructure to Reuse
- `src/app/api/webhooks/polar/route.ts` — structural template (event routing, email calls, error policy)
- `src/lib/services/token-system.ts` — `addCredits`, `activateSubscription`, `extendSubscription`, `cancelSubscription`, `endSubscriptionImmediately`, `markFoundingMember`
- `src/lib/services/email` senders used by the Polar webhook
- `getAppUrl()` pattern from `src/lib/polar.ts`

## Out of Scope
- Billing UI changes (Phase 3), migrating existing Polar subscribers' payment methods, invoice history UI

## Acceptance Criteria (Stripe test mode, `stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
- Starter checkout (4242 card) → sub active, +100 credits, founding flag, email; `stripe trigger invoice.paid` → +100 more, expiry extended; NO double grant on first invoice
- Pro checkout → active, no credit grant, generation doesn't decrement credits
- Credit pack → +N credits, ledger row, email
- Portal cancel-at-period-end → access until expiry; `subscription.deleted` → tier cleared immediately
- Polar regression: replayed Polar `subscription.updated` still extends, tier reported as `pro`
