# Review Collector Tool — Build Plan

> **Purpose of this doc**
> This is the planning + handoff document for building the first "Tool" on the FreddyBeach platform: a per-business **Review Collector** that routes happy customers to Google reviews and unhappy ones to private feedback. It also lays out the broader **Tools framework** so future tools (image generator, social post generator, review responder, etc.) plug into the same architecture.
>
> Hand this file to Claude Code in the `freddybeach` repo. Have it read this first, then explore the codebase to map the plan against existing patterns before writing any code.

---

## 1. Strategic Context

FreddyBeach.com is a Fredericton, NB local business directory with a featured-listing model and a consulting funnel. The platform already has:

- A directory with featured/verified businesses
- An "AI Tools" section (image generator, social post generator, review responder) — currently standalone pages
- A `/consultation` funnel for $5K–$25K engagements
- A user dashboard (BetterAuth + Google OAuth)

The next move is to **unify all current and future tools into a single Tools framework** inside the business dashboard, with per-business access control (free / gifted / trial / paid). The Review Collector is **Tool #1** built on this new framework.

### Business model the framework enables

- **Free listing** → directory only
- **Featured listing** → directory + 1 included tool
- **Pro tier** → all current tools
- **Done-for-you consult ($5K–$25K)** → setup + custom work + tools included
- **Pilot offer** → gift the Review Collector free to 5 local businesses in exchange for honest reviews, case studies, and a "Powered by FreddyBeach" badge

### Initial pilot targets

- **Matt's Insulation Ltd** — already listed, 15 reviews, room to grow, personal connection (Corey/Koen)
- **McCoy's Auto Services** — featured, auto repair lives on Google reviews
- **Troy's dealership / hockey team contact** — existing relationship
- **Trades, dentists, auto repair, home services** — best verticals to expand into

---

## 2. Product Spec — Review Collector

### What it does

After a job/visit, the business owner sends a customer a branded review request via email. The customer taps a star rating:

- **4 or 5 stars** → redirected to the business's Google review page
- **1, 2, or 3 stars** → shown a private feedback form that emails the owner directly

This funnels happy customers to public reviews and intercepts unhappy ones before they post publicly.

### Compliance note

Google's review policy discourages "review gating." To stay compliant: **always** show the Google review link as an option on every screen, including the private feedback page. The private form is the default path for low ratings, but the public option remains available. This is the cleaner, defensible version.

### Core user flows

**Owner flow**

1. Logs into FreddyBeach dashboard
2. Goes to Tools → Review Collector (if unlocked)
3. Pastes customer name + email → hits send
4. Sees stats: requests sent, opened, ratings distribution, private feedback inbox
5. Gets weekly summary email

**Customer flow**

1. Receives branded email: *"Quick favor from [Business] — how did we do?"*
2. Clicks link → branded landing page with 5 star buttons
3. Taps stars → routed (4–5 → Google, 1–3 → private form)
4. Submits → thank-you page (with Google link still visible)

### MVP scope

- Email-only (no SMS yet)
- Manual send only (no Zapier / API integrations yet)
- Single-language English
- Per-business branding: logo, brand color, business name, Google review URL
- "Powered by FreddyBeach" badge on every customer-facing screen

### Out of scope for MVP

- SMS sending (add Twilio later)
- Bulk CSV upload (add v2)
- Automated triggers from POS / CRM (add via Zapier later)
- Custom domains per business
- Multi-language

---

## 3. The Tools Framework (foundation work)

This must be built **before** or **alongside** the Review Collector — the collector plugs into it.

### Tools page in the dashboard

A new route: `/dashboard/tools` (or wherever the existing dashboard lives). Grid of tool cards. Each card shows:

- Tool name + icon + short description
- **State badge**: 🔓 Unlocked | 🔒 Locked | 🆕 New | ⏳ Trial (with days left)
- CTA: "Open" (if unlocked) or "Request Access" / "Upgrade" (if locked)

Existing AI Tools (image generator, social post generator, review responder) should be migrated into this framework so the experience is unified. They become tool entries with `access_type = 'free'` for everyone (or scoped however needed).

### Access control model

A `business_tools` join table determines who has what:

```
business_tools
  - id
  - business_id        (FK → businesses)
  - tool_slug          (e.g. 'review-collector')
  - access_type        (enum: 'free', 'gifted', 'trial', 'paid')
  - granted_at         (timestamp)
  - expires_at         (nullable timestamp — for trials)
  - granted_by         (nullable, admin user id — for audit)
```

A `tools` reference table (or a typescript constant — start with the constant, table later) describes each tool:

```
tools
  - slug               (e.g. 'review-collector')
  - name
  - description
  - icon
  - status             ('live', 'coming-soon', 'beta')
  - default_access     ('free' or 'paid')
```

### Authorization helper

A server-side helper like `hasToolAccess(businessId, toolSlug)` that checks `business_tools` and returns boolean + access metadata. Every tool route uses it as a guard.

---

## 4. Data Model — Review Collector specific

Three new tables (in addition to the `business_tools` framework table above):

```
review_requests
  - id                 (uuid)
  - business_id        (FK)
  - customer_name
  - customer_email
  - token              (unique, used in the public URL)
  - sent_at
  - opened_at          (nullable)
  - submitted_at       (nullable)
  - rating             (nullable int 1–5)
  - status             (enum: 'sent', 'opened', 'submitted', 'expired')

review_feedback        (only for ratings 1–3)
  - id
  - request_id         (FK → review_requests)
  - rating
  - message            (text)
  - submitted_at

business_review_settings
  - business_id        (FK, unique)
  - google_review_url
  - brand_color        (nullable, hex)
  - logo_url           (nullable)
  - sender_name        (default: business name)
  - sender_signature   (nullable, for the email)
  - notification_email (where private feedback gets sent)
```

Note: `businesses` table already exists. The settings table is a 1:1 sidecar so we don't bloat the main schema.

---

## 5. Routes

### Customer-facing (public, no auth)

- `GET /r/[slug]/[token]` — 5-star tap screen, branded
- `POST /r/[slug]/[token]/rate` — records rating, returns next route
- `GET /r/[slug]/[token]/feedback` — private feedback form (1–3 stars)
- `POST /r/[slug]/[token]/feedback` — submits feedback
- `GET /r/[slug]/[token]/thanks` — thank-you page (Google link still shown)

### Owner-facing (authed, in dashboard)

- `GET /dashboard/tools` — tools grid (framework)
- `GET /dashboard/tools/review-collector` — review collector home/stats
- `GET /dashboard/tools/review-collector/send` — send new request form
- `POST /dashboard/tools/review-collector/send` — sends email, creates request
- `GET /dashboard/tools/review-collector/feedback` — private feedback inbox
- `GET /dashboard/tools/review-collector/settings` — brand color, logo, Google URL, etc.

### API / actions

- Server actions preferred where possible (Next.js 15 + RSC)
- Email sending via Resend
- Token generation: cryptographically random, 32 chars

---

## 6. UI Notes

- Use shadcn/ui throughout (already in the project)
- Customer-facing screens: mobile-first, single column, big tap targets for stars
- Brand color applied to: stars hover state, primary button, accent line
- "Powered by FreddyBeach" badge: small, footer, links to freddybeach.com with `?ref=review-collector&business=[slug]` for attribution tracking
- Owner dashboard for the tool: clean stats cards (sent / opened / avg rating / private feedback count), table of recent requests, button to send new

---

## 7. Email Templates

Two emails to design (use Resend's React Email or simple HTML):

**Customer review request**

- Subject: `Quick favor — how did we do at [Business Name]?`
- From name: business owner's name (or business name)
- Body: short, warm, single CTA button to the review link
- Footer: "Powered by FreddyBeach" badge

**Owner notification (private feedback received)**

- Subject: `New private feedback from [Customer Name] — [rating] stars`
- Body: customer name, rating, message, link back to dashboard

**Weekly summary (later, not MVP)**

- Optional, add after pilot feedback

---

## 8. Constraints

These are hard constraints for Claude Code to respect when building:

- **Auth**: Use existing BetterAuth setup. Do NOT add a new auth system.
- **Database**: Use existing Neon/Postgres + Drizzle ORM. Do NOT add a new DB.
- **Schema location**: Extend `src/lib/schema.ts` (or wherever schema lives) — do not create a separate ORM setup.
- **Multi-tenant**: One app instance serves all businesses. Every query must be scoped by `business_id`.
- **Tools framework first**: Build the framework (page + access control + helper) before or alongside the Review Collector. The collector must plug into it, not exist as a one-off route.
- **Migrate existing tools**: Image generator, social post generator, review responder should be migrated into the new Tools framework so the experience is unified. This can happen as a follow-up PR but should be in the plan.
- **UI**: Use shadcn/ui components and existing Tailwind config. Match existing dashboard styling.
- **Email**: Use Resend. Add to env vars if not already present.
- **Start email-only**: No SMS. Twilio is a v2 concern.
- **Compliance**: Google review link must be visible on every customer-facing screen, including the private feedback page. No pure review gating.
- **Tokens**: Review request URLs must use cryptographically random tokens, not sequential IDs.
- **Privacy**: Customer email addresses are PII. Don't log them, don't expose them in URLs.
- **Branding badge**: Every customer-facing screen must include a "Powered by FreddyBeach" badge with a tracked link back to the directory.
- **Stack**: Next.js 15 App Router, RSC + server actions where appropriate, TypeScript strict.

---

## 9. Build Order (suggested)

**Phase 1 — Framework foundation**

1. Add `business_tools` table + migration
2. Define `tools` reference (TS constant for now)
3. Build `hasToolAccess()` server helper
4. Build `/dashboard/tools` grid page
5. Migrate existing AI Tools into the framework (can be follow-up PR)

**Phase 2 — Review Collector MVP**

6. Add `review_requests`, `review_feedback`, `business_review_settings` tables + migration
7. Build settings page (brand color, logo, Google URL, notification email)
8. Build send-request form + server action
9. Set up Resend + write customer email template
10. Build public customer-facing review pages (`/r/[slug]/[token]/*`)
11. Build private feedback flow + owner notification email
12. Build stats dashboard for the tool
13. Add "Powered by FreddyBeach" badge component

**Phase 3 — Pilot prep**

14. Gift access to 5 pilot businesses via admin script or simple admin UI
15. Onboarding doc / loom video for pilot businesses
16. Tracking: pageviews on `/r/*` pages, click-through to Google, conversion rates

**Phase 4 — Post-pilot (not yet)**

- SMS via Twilio
- Bulk CSV upload
- Zapier integration
- Paid tier + Stripe integration
- Custom domains
- **Capture written review locally for 4–5 star path**, then copy-to-clipboard
  and redirect to Google. Customer types once on FreddyBeach, pastes once on
  Google. Lifts conversion-through to Google reviews and gives us our own
  copy of the text.
- **Surface those captured 4–5 star reviews on the business's directory page**
  as native FreddyBeach reviews. Owner gets a stat boost on FreddyBeach even
  when customers drop off before submitting to Google. Useful for directory
  SEO too (more indexable content per listing).

---

## 10. Open Questions for Claude Code to Surface

When Claude Code reads this and explores the repo, it should flag:

- Does a `businesses` table already exist with the right shape? What fields are on it?
- Where do the existing AI Tools live in the codebase? Can they be cleanly migrated?
- Is there already a dashboard layout / shell to extend, or does one need building?
- Is Resend already configured, or does it need adding?
- Are there existing patterns for server actions, mutations, and form handling to match?
- Any existing rate limiting / abuse prevention to extend for the public `/r/*` routes?

---

## 11. Definition of Done — MVP

The MVP is shippable when:

- An owner can log in, open the Tools page, see Review Collector unlocked
- An owner can configure their Google review URL, brand color, and notification email
- An owner can send a review request to a customer email
- The customer receives a branded email and can tap a star rating
- 4–5 stars routes to Google; 1–3 stars routes to the private form
- Owner receives an email when private feedback is submitted
- Owner can see stats and private feedback inbox in their dashboard
- "Powered by FreddyBeach" badge appears on all customer-facing pages
- Five pilot businesses are loaded with `gifted` access

---

