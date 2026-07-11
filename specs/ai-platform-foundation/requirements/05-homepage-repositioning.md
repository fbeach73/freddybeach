# Phase 5: Homepage Repositioning + Nav/Footer - Requirements

**Suggested agent:** frontend-react-engineer (+ ui-expert review) · **Depends on:** Phase 1 (copy), Phase 3 (founding banner) · **Parallel with:** Phase 2

## Problem Statement

Positioning mismatch: the homepage sells the Review Collector SaaS, while header/footer still frame the site as "Fredericton Business Directory." The footer links to routes that don't exist (`/about`, `/advertise`), and there's no Pricing link because no pricing page existed. Owner decision: **AI-platform hero ("get in early") + Review Collector as flagship tool + directory prominent below** — one coherent story where the directory is the SEO moat and the AI toolbox is the product.

## Requirements

### R1: Homepage (`src/app/page.tsx`) — new section order
1. **Hero:** "AI tools for Fredericton businesses — get in early." Subhead in plain language (built for local businesses, no dev team needed). CTAs: "Start free" (AuthDialog sign-up) + "Explore the tools" (/ai-tools). Founding-member banner (Phase 3 component)
2. **Flagship:** Review Collector card — keep `ReviewCollectorDemoWidget` ("see it in 60 seconds")
3. **Toolbox grid:** updated `LighterToolsGrid` showing all 6 available tools with one-line benefits
4. **Directory section:** "Fredericton's local business directory" — reuse `HeroSection` (search → /search), `CategoryGrid`, `FeaturedBusinessesWrapper` from `src/components/home/` (all working, currently used by `/home-12-04-25`). Include the free-listing + dofollow-backlink value prop for businesses
5. **Pricing teaser:** 3 tiers at a glance → `/pricing`
6. **FAQ:** update `HomepageFaq` / `homepage-faq-data.ts` — add entries on plans, free credits, founding membership; keep FAQ JSON-LD wiring
- Keep `generateHomepageSchema` JSON-LD and `revalidate = 60`
- Tone: fun, confident, zero jargon

### R2: Header (`src/components/site-header.tsx`)
- Nav: Browse Directory (/search), AI Tools (/ai-tools), Pricing (/pricing), Blog (/blog)
- Keep Dashboard button / auth controls / theme toggle; tagline updated from "Fredericton Business Directory" to platform framing (e.g. "AI tools + directory for Fredericton businesses")

### R3: Footer (`src/components/site-footer.tsx`)
- Reframe columns: **Platform** (AI Tools, Pricing, Consultation), **Directory** (Browse, Categories, Add Your Business), **Company/Legal** (Blog, Privacy, Terms, Refund)
- Fix dead links: Contact → `/consultation`; remove `/about` and `/advertise` (routes don't exist) or point at real routes only
- Every footer link must resolve 200

## Existing Infrastructure to Reuse
- `src/components/home/`: `hero-section.tsx`, `category-grid`, `featured-businesses-wrapper`, `review-collector-demo-widget`, `trust-strip`, `how-it-works`, `lighter-tools-grid`, `homepage-faq` — compose, don't rebuild
- Old directory homepage `/home-12-04-25/page.tsx` as reference for the directory section
- Founding banner from Phase 3; AuthDialog

## Out of Scope
- Deleting `/home-12-04-25` (keep as backup), blog changes, /consultation changes

## Acceptance Criteria
- Homepage tells one story: AI platform → flagship tool → toolbox → directory → pricing → FAQ
- Header/footer consistent with platform framing; all links resolve
- JSON-LD still emitted (view-source check); Lighthouse/CWV not regressed materially
- `pnpm lint && pnpm typecheck` clean
