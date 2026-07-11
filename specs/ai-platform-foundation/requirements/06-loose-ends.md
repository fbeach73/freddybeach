# Phase 6: Loose Ends - Requirements

**Suggested agent:** nextjs-backend-engineer · **Depends on:** Phase 1 · **Parallel with:** anything

## Problem Statement

Two liabilities discovered during review:

1. **`/api/chat` (`src/app/api/chat/route.ts`) is unauthenticated and unmetered.** It streams via OpenRouter (default `openai/gpt-5-mini`) — anyone on the internet can burn API spend with zero account.
2. **`/success-stories` shows fabricated-looking stats** ("150+ Businesses Helped", "500+ Hours Saved Weekly", "340% Average ROI", "98% Satisfaction"). These cannot coexist with an honest founding-member counter ("Be one of the first 100") — they contradict each other and torch credibility.

## Requirements

### R1: Gate and meter the chat route
- Require a Better Auth session (`auth.api.getSession` — same pattern as the generate routes); 401 otherwise
- Check `canGenerateWithDetails(userId, 1)` before streaming; return the standard 402 shape on insufficient credits
- Meter in `streamText`'s `onFinish`: consume 1 credit when `eligibility.reason === "credits"`, else `logSubscriptionUsage` + `incrementTokenUsage` (same split as other tools)
- Update the `/chat` page (`src/components/chat/chat-client.tsx` / `src/app/chat/`) with a signed-out state (AuthDialog CTA) and out-of-credits handling

### R2: Success stories honesty pass
- Unlink `/success-stories` from any nav/footer references
- Replace fabricated hero stats with honest placeholder copy (e.g. "We're just getting started — founding members will be our first success stories")
- Leave the page + `case-studies.ts` data in place for the owner to replace with real numbers later (**preserve existing code** — do not delete)

## Existing Infrastructure to Reuse
- Auth/eligibility/metering patterns from `src/app/api/ai-tools/generate/route.ts` and `src/app/api/generate/route.ts`
- `canGenerateWithDetails`, `consumeCredit`, `logSubscriptionUsage`, `incrementTokenUsage` from token-system.ts

## Out of Scope
- Redesigning the chat UI, writing real case studies, rate-limiting beyond the credit system

## Acceptance Criteria
- `curl -X POST /api/chat` unauthenticated → 401; signed-in free user with 0 credits → 402; with credits → streams and decrements 1
- No nav path leads to fabricated stats
- `pnpm lint && pnpm typecheck` clean
