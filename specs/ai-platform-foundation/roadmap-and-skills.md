# Roadmap + Skills Recommendations (not part of this slice)

## Top 10 AI Tools for Local SMBs — ranked

Ranking weighs: SMB familiarity/popularity, AEO/search-ranking value (the platform's differentiator), reuse of the existing text/image pipeline, and "uncomplicated + fun."

| # | Tool | Why | Build cost |
|---|---|---|---|
| 1 | **"How AI sees your business" — AEO/LLM visibility score** | Flagship differentiator; pairs with directory data + existing seo-geo skill knowledge; irresistible hook ("ask ChatGPT about you") | Medium |
| 2 | **Google Business Profile post generator** | Highest SMB familiarity; pure reuse of the text-gen pipeline (new TOOL_PROMPTS entry) | Low |
| 3 | **Review insights summarizer** | Feeds off Review Collector data already in the DB — natural upsell loop | Low-Med |
| 4 | **FAQ + schema generator** | Direct AEO value; copy-paste JSON-LD/FAQ output for their own site | Low |
| 5 | **Seasonal promo campaign generator** | Fun, calendar-driven re-engagement (Canada Day, back-to-school, holidays) | Low-Med |
| 6 | Local SEO audit-lite | "Grade my website" — great lead magnet, needs crawling infra | Medium |
| 7 | Local-topic blog writer | Content for their sites; blog AI pipeline partially exists | Medium |
| 8 | Social calendar autopilot | Extends #2/#5 into scheduled batches | Medium |
| 9 | Competitor watch | Monitor nearby competitors' reviews/updates | Med-High |
| 10 | Appointment booking assistant | Highest infra burden (calendars, notifications) — last | High |

**Build next (slice 2): #1–#5.** Each becomes its own spec folder; #2, #4, #5 are mostly new `TOOL_PROMPTS` entries + `ai-tools.ts` data — a scaffolding skill (below) makes each a short session.

## Skills & Agents Review

### Keep as-is
- **Skills:** `programmatic-seo`, `seo-geo` (both directly serve the AEO product direction)
- **Agents:** `better-auth-expert`, `code-reviewer`, `frontend-react-engineer`, `nextjs-backend-engineer`, `ui-expert`
- **Commands:** `checkpoint`, `create-feature`

### Change
- **`polar-payments-expert` agent → retire after Stripe migration.** Replace with a `stripe-billing` skill (below) — a skill documenting THIS codebase's billing contract beats a generic payments agent.
- **`coder-agent` is redundant** with the main agent + the two specialized engineers — optional cull to reduce dispatch confusion.

### Add (highest value first)
1. **`.claude/product-marketing-context.md`** — the `programmatic-seo` skill already looks for this file and it doesn't exist. One page: positioning ("AI toolbox + directory for Fredericton SMBs"), the 3 tiers, founding offer, tone rules (uncomplicated, fun, no jargon). Every marketing-adjacent agent task gets consistent context for free.
2. **`new-ai-tool` skill** (`.claude/skills/new-ai-tool/SKILL.md`) — the scaffold checklist for adding a tool: `ai-tools.ts` entry (category, costLabel, example I/O) → `TOOL_PROMPTS` prompt → verify hub card + tool page render → credit metering test → announce copy. Turns "add tools as we go" into a 30-minute, agent-assignable job with consistent output.
3. **`stripe-billing` skill** — documents the plans.ts → checkout → webhook → token-system ledger contract, env var names, and the webhook idempotency rules (billing_reason guard etc.), so future billing work doesn't re-derive it from code.
4. **`brand-voice` skill** — SMB-friendly copy rules with before/after examples ("Generate content" → "Write your next post in 10 seconds"). Used by any agent writing UI copy so the whole site sounds the same.
5. **`billing-verify` skill** — the Stripe-CLI test-flow checklist from the implementation plan's Phase 7, runnable after any billing change (pairs with the global `prove`/`verify` skills).

### Already covered globally — don't duplicate in-repo
`seo-audit`, `ai-seo`, `seo-schema`, `gsc`, `prove`, `verify`, and the seo-* subagents are available at the user level; project skills should only encode FreddyBeach-specific contracts.
