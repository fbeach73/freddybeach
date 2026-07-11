# Phase 4: Finish Stub Tools + Tools Hub Redesign - Requirements

**Suggested agent:** frontend-react-engineer (+ ui-expert review) · **Depends on:** Phase 1 · **Parallel with:** Phases 2–3

## Problem Statement

Two tools (`business-description-writer`, `email-template-generator`) are marked `coming-soon`/`enhanced` and blur-gated behind `PremiumToolGate` — even though their prompts already exist in `TOOL_PROMPTS` (`src/app/api/ai-tools/generate/route.ts`) and the generate route never checks `status`. Flipping them on is mostly a data change.

The tools hub (`/ai-tools`) still uses the retired `free/enhanced/featured` tier model and reads like a SaaS dashboard, not a friendly toolbox. The vision: **uncomplicated and fun** — an average SMB owner should instantly get what each tool does and feel invited to try it, not overwhelmed.

## Requirements

### R1: Flip the two stub tools live
- In `src/lib/data/ai-tools.ts`: `business-description-writer` and `email-template-generator` → `status: "available"`
- Both cost 1 credit like all text tools (plans differ by allowance only — decided)

### R2: Retire the tool-tier model
- Replace `tier: "free" | "enhanced" | "featured"` on `AITool` with `category: "reviews" | "marketing" | "content" | "images"` and `costLabel` (e.g. "1 credit", "Free")
- Ripple: `src/lib/types/business.ts` (AITool type), `src/components/shared/tier-badge.tsx` (becomes a "Free to try"/cost badge), helpers in `ai-tools.ts` (`getFreeTools`/`getPremiumTools` → category/availability helpers)
- Chase remaining USER-tier references: `src/app/dashboard/page.tsx`, `src/app/ai-tools/page.tsx`, `src/app/ai-tools/[slug]/page.tsx`, `src/app/generate/generate-client.tsx`, `src/types/dashboard.ts`
- **CAUTION:** `featured`/`enhanced` are ALSO business listing tiers on the `business` table and directory components (business-card, category/search pages) — a completely separate concept. Do not touch those.

### R3: Tools hub rewrite (`src/app/ai-tools/page.tsx`)
- Compact founding-member strip (component from Phase 3)
- Tools grouped by category with plain-language, one-sentence benefit per card ("Reply to any Google review in 10 seconds") + a peek at real example output + cost badge
- Review Collector pinned first (flagship); per-business granted tools still surface first for their owners
- Signed-in: friendly usage meter from `getUserTierData()` ("7 of 10 free credits left this month") + upgrade nudge near depletion
- Signed-out: hero + tool cards + "Create a free account — 10 free credits every month" CTA (AuthDialog)
- Pricing teaser linking `/pricing`
- Keep neo-brutalist design language; fun > corporate

### R4: Tool page gating change (`src/app/ai-tools/[slug]/page.tsx`)
- Delete the `PremiumToolGate` blur path entirely
- Signed-out: show the tool's REAL example input/output (already in `ai-tools.ts` data) + sign-up CTA — let them see the value before the gate
- Signed-in: `AIToolInterface` for every credit tool; out-of-credits state handled by the existing 402 response → friendly upgrade prompt
- Keep the special-case redirects to `/ai-tools/image-generator` and `/ai-tools/review-collector`

## Existing Infrastructure to Reuse
- `TOOL_PROMPTS` in `src/app/api/ai-tools/generate/route.ts` — prompts for both stub tools already written
- `src/components/dashboard/ai-tool-interface.tsx` — working generate UI (calls `/api/ai-tools/generate`)
- Example I/O data already present per tool in `ai-tools.ts`
- `getUserTierData()` from token-system.ts; founding strip from Phase 3

## Out of Scope
- New tools (roadmap), image-generator/review-collector page internals, homepage (Phase 5)

## Acceptance Criteria
- Both new tools generate real output end-to-end for a free user (credit decrements to 9)
- No references to user-facing `enhanced`/`featured` tool tiers remain (grep-verified), business listing tiers untouched
- Signed-out `/ai-tools/[slug]` shows example I/O + CTA, no blur
- `pnpm lint && pnpm typecheck` clean
