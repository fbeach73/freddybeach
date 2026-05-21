# Homepage AI-Pivot — Design Spec

**Date:** 2026-05-21
**Author:** Brainstormed with Claude Code
**Scope:** Rewrite the FreddyBeach homepage and refactor `/ai-tools` around AI/automation for Atlantic Canada small business, with Review Collector as the single hero tool. Keep the directory live as a credibility layer with distinct keyword targets to avoid cannibalization.

---

## 1. Strategic context

FreddyBeach today is a Fredericton-only business directory with an "AI Tools" side product. The homepage hero leads with "Create Stunning AI Images for Your Business" — a hangover from an earlier product theme that no longer matches the current monetization path (per-business tools + done-for-you consulting).

The Review Collector tool shipped to production on 2026-05-19 and is the most outcome-provable thing in the product. The pilot list (Matt's Insulation, McCoy's Auto, Troy's dealership) is Fredericton-anchored, but the broader market is Atlantic Canada SMBs — same audience archetype, larger TAM.

This spec describes the homepage redesign and the `/ai-tools` refactor that aligns both surfaces with that positioning.

### Locked decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Audience | Atlantic Canada SMB owners (NB + NS + PE + NL) |
| Primary conversion | Try Review Collector free |
| Directory's role on homepage | Social proof — trust strip linking into directory |
| Approach | A — Tool-led hero (over outcome-story menu or pilot-scarcity) |
| H1 direction | Outcome: "Turn happy customers into 5★ Google reviews." |
| Hero demo | Embedded interactive mini-widget (real 5-star tap that animates the branch) |
| Hero CTAs | "Try it free" (primary, opens AuthDialog) + "See it in 60 seconds" (smooth-scroll to demo widget) |
| Directory cannibalization strategy | No URL changes. Distinct keyword clusters. Monitor in GSC at 30 days. Subdomain split off the table. |
| `/ai-tools` posture | Refocus as single-funnel page, Review Collector leads, pricing moves below demos |
| Stale stats handling | Remove ALL fabricated numbers (homepage "2,000+ images", /ai-tools "500+ businesses helped" etc.) |
| Unused component files after refactor | Delete (`AIHeroSection`, `AIToolsGrid`, `TestimonialsSlider`, `FeaturedBusinessesSection`) |
| LLM citation readiness | Light addition only: `/llms.txt` + robots.txt allowances + FAQ schema. No GEO copy rewrite. |

---

## 2. Homepage (`src/app/page.tsx`) — section-by-section

The new page composes the following sections in order. Each maps to one component.

### Section A · Hero

**Layout:** Two-column on `lg:`, stacked on mobile. Left column = copy + CTAs. Right column = the interactive demo widget.

**Copy:**

- Badge: `<Sparkles /> Review Collector · Live now`
- H1: **"Turn happy customers into 5★ Google reviews."**
- Sub: "Send a one-tap review request after every job. Happy customers go to Google. Unhappy ones stay private — and email you instead."
- Primary CTA: `<AuthDialog defaultTab="sign-up">` wrapping "Try it free" button
- Secondary CTA: "See it in 60 seconds" → anchor-link that smooth-scrolls to the demo widget on the same screen at mobile, or visually highlights it on desktop

**Component:** New `src/components/home/review-collector-demo-widget.tsx` (client component) used inline in the hero right column.

#### Demo widget behavior

- Renders a sample customer-email preview styled to look like a real inbox row: from line "Sample Business <hello@samplebusiness.ca>", subject "Quick favor — how did we do?", first line "Hi there — thanks for stopping by today. Could you take 5 seconds to rate your visit?", and a "Rate your visit" button. The placeholder copy is part of the static markup, no data needed.
- Below the email: five star buttons in a row
- Tapping 4 or 5 stars: smooth-animate to a "Going to Google →" panel with the actual Google review button visible (no actual click-out)
- Tapping 1–3 stars: smooth-animate to a private feedback panel with a textarea (disabled / labeled "demo only")
- A small "Reset demo" link returns to the 5-star state
- No network calls, no auth, no email firing — purely client-side state machine
- A subtle "This is a demo — try the real thing free →" pill is present in every widget state; clicking it opens the same `AuthDialog defaultTab="sign-up"` flow used by the hero primary CTA

### Section B · Trust strip

**Component:** New `src/components/home/trust-strip.tsx`.

- Pulls up to 12 featured businesses from `getFeaturedBusinessesFromDb()`; wraps responsively (3–4 per row on `md:`, more lines on narrower viewports)
- Renders as a horizontal name-only strip: small uppercase label ("Trusted by Atlantic Canada businesses") above wrapped pills with business names
- Each pill links to the same URL that the existing `BusinessCard` component generates for that business — re-use whatever `href` builder it currently uses so the URL pattern stays consistent with the rest of the directory
- "+ N more →" pill at the end linking to `/businesses`
- No carousel, no cards — explicit anti-pattern of pulling visitors into the directory before they convert on the tool

### Section C · How it works

**Component:** New `src/components/home/how-it-works.tsx`.

- 3-card horizontal grid on `md:`, stacked on mobile
- Card 1: Send — "Paste customer email, hit send." Icon: Mail
- Card 2: Customer rates — "One tap. Branches automatically." Icon: Stars
- Card 3: You get the result — "Public Google review, or private feedback in your inbox." Icon: Mailbox

### Section D · Outcome + compliance block

**Component:** New `src/components/home/outcome-compliance.tsx`.

Split two-up grid on `md:`, stacked on mobile.

- **Left card — "What changes":** bullet list (qualitative, NO fake numbers)
  - More 5★ reviews from your existing customer base — no new marketing
  - Unhappy customers email you privately instead of posting publicly
  - Owner sees ratings + feedback in one dashboard
- **Right card — Google-policy compliance note:** "The public Google review link is shown on every screen — even the private feedback path. No review gating."

### Section E · The rest of the toolkit (light)

**Component:** New `src/components/home/lighter-tools-grid.tsx`.

- Section heading: "More tools as you grow"
- Sub: "Every FreddyBeach account also gets:"
- 3-up grid: AI Image Generator · AI Social Posts · AI Review Responder
- Each card links to `/ai-tools/<slug>`
- Visual style intentionally lighter than the hero (no heavy borders, smaller type)
- Pulls tool metadata from `src/lib/data/ai-tools.ts`

### Section F · Consultation tier

**Component:** Existing `ConsultationCTA` at `src/components/home/consultation-cta.tsx`, copy rewrite only.

- New headline: "Want this set up FOR you?"
- New sub: "We do the integration, the email writing, and the first 30 days of monitoring — starting at $5K. Book a 15-min call."

### Section G · FAQ

**Component:** New `src/components/home/homepage-faq.tsx`.

- Accordion (shadcn `Accordion` primitive)
- 3–5 Qs: Google-policy compliance, who it's for, what happens to bad reviews, what's free vs paid, can I use a Gmail
- Component also exports a function `getHomepageFaqEntities()` that returns FAQPage `mainEntity` schema entries — consumed by `generateHomepageSchema()` so the FAQ Qs/As stay in lock-step with the rendered content

### Section H · Footer

No change. Existing `SiteFooter`.

---

## 3. `/ai-tools` refactor

### Logged-out view section order

1. **Hero** (rewritten `SectionHero`):
   - H1: "Your AI toolkit for Atlantic Canada small business."
   - Sub: "Start with the Review Collector — turn happy customers into 5★ Google reviews. Then add image generation, social posts, and review replies as you grow."
   - Primary CTA: "Try Review Collector free" → AuthDialog sign-up
   - Secondary CTA: "See all 5 tools" → anchor to all-tools grid lower on page
2. **Review Collector demo widget** (the SAME `ReviewCollectorDemoWidget` from the homepage)
3. **All tools grid** (existing `ToolPreviewCard` grid)
4. **Other interactive demos** (existing Review Responder + Social Post tabs from `AIToolsShowcase`) — kept but moved below the all-tools grid
5. **Pricing** (`AIPricingSection`) — moved BELOW the demos
6. **Bottom CTA** (existing `CTASection`) — `stats` prop removed, headline + sub rewritten

### Logged-in view

- Keep current Usage Card + Quick Access grid as-is (recently shipped, working).
- Single change: header H1 from "AI Tools / Powerful AI-powered tools to grow your business" → "Your toolkit / Pick up where you left off, or try something new."

### Files to modify in this section

- `src/app/ai-tools/page.tsx` — hero rewrite, logged-in H1 tweak
- `src/app/ai-tools/ai-tools-showcase.tsx` — prepend RC demo, reorder, remove fabricated `stats` from `CTASection`
- `src/lib/data/packages.ts` — refresh stale pricing copy at lines 92-153 (the "4 AI tools / 2 enhanced" mismatch the handoff flagged)

---

## 4. SEO architecture

### Metadata changes (`src/app/layout.tsx`)

| Field | From | To |
|---|---|---|
| `metadataBase` | `https://fbeach.vercel.app` | `https://freddybeach.com` |
| `title` | "FreddyBeach - Fredericton Business Directory" | "FreddyBeach — AI tools that grow Atlantic Canada small businesses" |
| `description` | "Discover local businesses in Fredericton, NB. Find restaurants, shops, services…" | "Turn happy customers into 5-star Google reviews, generate marketing images and social posts, and reply to reviews — all in one place. Free trial. Trusted by Atlantic Canada small businesses." |
| `openGraph.url` | `https://fbeach.vercel.app` | `https://freddybeach.com` |
| `openGraph.title` / `twitter.title` | (current Fredericton-centric) | match new `title` |
| `openGraph.description` / `twitter.description` | (current) | match new `description` |

### JSON-LD changes (`src/lib/seo/json-ld.ts` · `generateHomepageSchema`)

Three additive edits:

1. **Broaden `Organization.areaServed`** from `City: Fredericton` to four `AdministrativeArea` entries (NB, NS, PE, NL). Keep the postal address as Fredericton.
2. **Add `SoftwareApplication` entry** for the Review Collector:
   ```json
   {
     "@type": "SoftwareApplication",
     "name": "FreddyBeach Review Collector",
     "applicationCategory": "BusinessApplication",
     "operatingSystem": "Web",
     "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CAD" }
   }
   ```
3. **Add `FAQPage` entry** whose `mainEntity` comes from `getHomepageFaqEntities()` exported by `homepage-faq.tsx`. Ensures rendered Qs/As never drift from schema.

### Internal-linking rules

- Homepage → directory: trust strip (Section B) is the ONLY homepage-to-directory link
- Directory listings → tools: **none for now**. No "Try our AI tools!" cross-promotion inside directory pages. Reduces cannibalization risk on `[category]` keyword clusters.
- Footer: keeps category links (residual SEO, no behavior change)

### Keyword cluster separation

| Surface | Primary cluster |
|---|---|
| Homepage | `get more google reviews`, `AI tools for small business Canada`, `review request tool`, brand: `freddybeach` |
| `/ai-tools` | `AI tools for small business`, `marketing AI for SMB` |
| `/businesses`, `/[category]`, `/[slug]` | `[category] fredericton`, `fredericton business directory`, branded business names |

### AI / LLM citation additions

- `public/llms.txt` — 20-line index: homepage, `/ai-tools/review-collector`, `/ai-tools`, 3 top directory categories
- `public/robots.txt` — explicitly allow `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`
- FAQ schema covered in JSON-LD section above

### Monitoring checkpoint

- 30 days post-launch (planned date: 2026-06-20): in Google Search Console, filter homepage + `/businesses` + sampled `/[category]` URLs; look for queries where two URLs both rank top 20
- Escalation criteria: if "fredericton business directory" starts pulling the homepage instead of `/businesses` → canonical hints, internal-link rebalancing
- Subdomain split stays off the table unless severe cannibalization is observed

---

## 5. Component inventory

### New components

| Path | Purpose | Reused on |
|---|---|---|
| `src/components/home/review-collector-demo-widget.tsx` | Interactive 5-star demo widget | Homepage hero + `/ai-tools` |
| `src/components/home/trust-strip.tsx` | Name-only directory pills strip | Homepage |
| `src/components/home/how-it-works.tsx` | 3-step horizontal cards | Homepage |
| `src/components/home/outcome-compliance.tsx` | Split outcome + Google-policy block | Homepage |
| `src/components/home/lighter-tools-grid.tsx` | 3-up "more tools as you grow" | Homepage |
| `src/components/home/homepage-faq.tsx` | Accordion FAQ + exported schema entities | Homepage |

### Files modified

| Path | Change |
|---|---|
| `src/app/page.tsx` | Recompose homepage with new sections, expand JSON-LD union |
| `src/app/layout.tsx` | Fix `metadataBase`, update title/description/OG/Twitter |
| `src/lib/seo/json-ld.ts` | `generateHomepageSchema()` rewrite |
| `src/components/home/consultation-cta.tsx` | Copy rewrite only |
| `src/app/ai-tools/page.tsx` | Logged-out hero rewrite, logged-in H1 tweak |
| `src/app/ai-tools/ai-tools-showcase.tsx` | Prepend RC demo, reorder, remove fabricated `stats` |
| `src/lib/data/packages.ts` | Refresh stale pricing copy (lines 92-153) |
| `public/robots.txt` | Allow AI crawler bots |

### Files added (non-`src`)

- `public/llms.txt`

### Files deleted

All four files have been verified via `grep` as having no consumers outside `src/app/page.tsx`:

- `src/components/home/ai-hero-section.tsx`
- `src/components/home/ai-tools-grid.tsx`
- `src/components/home/testimonials-slider.tsx`
- `src/components/home/featured-businesses-section.tsx`

Their import lines are also removed from `src/app/page.tsx`.

Note: `src/components/home/business-card.tsx`, `testimonial-card.tsx`, `featured-businesses-carousel.tsx`, and `featured-businesses-wrapper.tsx` are NOT deleted in this scope — they may still have consumers elsewhere (e.g. `/businesses`, `/dashboard`). Each one's import graph should be verified before any future cleanup.

---

## 6. Verification gate

Before declaring done:

1. `pnpm lint`
2. `pnpm typecheck`
3. Local dev (`pnpm dev`) — manual walkthrough:
   - Homepage logged-out: hero visible, tap demo widget through both branches (4★ path + 2★ path), all 7 sections scroll cleanly, trust strip pill click goes into directory, consult CTA copy reads correctly, FAQ accordion expands
   - Homepage logged-in: same checks; verify no auth-required regressions
   - `/ai-tools` logged-out: hero, RC demo, all-tools grid, other demos, pricing, bottom CTA — in that order; no fabricated stats anywhere
   - `/ai-tools` logged-in: Usage Card + Quick Access render unchanged from current behavior
   - Mobile breakpoint check (375px width): hero stacks, demo widget usable, how-it-works cards stack, trust strip wraps
4. Paste rendered homepage HTML into Google Rich Results Test — confirm `Organization`, `WebSite`, `SoftwareApplication`, `FAQPage` schemas all validate
5. Verify `robots.txt` allows the four named bots
6. Verify `llms.txt` is reachable at the root path

---

## 7. PR / commit shape

Single PR, four logical commits in order:

1. `feat: review collector demo widget` — the shared interactive component
2. `feat: homepage AI-pivot` — new sections, page.tsx recompose, layout.tsx metadata, JSON-LD changes, FAQ component
3. `refactor: /ai-tools single-funnel page` — hero rewrite, RC demo prepend, pricing reorder, fabricated stats removal, packages.ts copy refresh
4. `chore: AI crawler, llms.txt, cleanup` — robots.txt update, new llms.txt, delete the four unused homepage components

---

## 8. Explicit non-goals

- No URL changes anywhere
- No directory listing UI changes
- No `/dashboard` UI changes
- No new tools — Review Collector is the hero, the other four existing tools are unchanged
- No copy rewrites inside directory `[category]` or `[slug]` pages
- No Stripe / billing changes
- No database / schema changes
- No new email templates
- No GEO-style copy rewrite for LLM optimization (FAQ + llms.txt + robots is the entire AI-citation surface in scope)

---

## 9. Risks and open follow-ups

- **Risk:** Removing the homepage testimonials slider before Review Collector pilot quotes exist creates a "no social proof above the consult CTA" gap. Mitigated by the trust strip (Section B) carrying credibility duty in the meantime. Reassess after first 3 pilot quotes are collected.
- **Risk:** The widget is technically a "demo only" experience and the visitor might tap, get a Google-link panel, and not realize that real usage requires sign-up. Mitigation: a clear "Demo only — try the real thing free →" pill is part of the widget at all times.
- **Open follow-up (already in handoff):** Triple icon-map duplication (`dashboard-tool-card.tsx`, `neo-tool-card.tsx`, `marketing/tool-preview-card.tsx`). Cosmetic, deferred.
- **Open follow-up (already in handoff):** Phase 4 of Review Collector — capture 4-5★ reviews locally before redirecting to Google, surface them on directory pages. Deferred until pilots produce real reviews.
