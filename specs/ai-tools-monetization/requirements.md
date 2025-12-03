# AI Tools Page & Monetization System - Requirements

## Overview

Update the `/ai-tools` page to reflect the new business model with a hybrid credit/subscription monetization system for AI tools.

---

## Business Requirements

### 1. Hero Section Updates
- Remove the "Get Started Free" button entirely
- Change "View Pricing" button text to "More Info"
- Keep the anchor link to `#pricing` section

### 2. AI Tool Status & Badges
- Add "Coming Soon" badge to all AI tools EXCEPT the AI Image Generator
- Feature the AI Image Generator prominently as the currently available tool
- Tools marked as "Coming Soon":
  - Review Response Assistant
  - Social Post Generator
  - Business Description Writer
  - Email Template Generator

### 3. Credit System
- **Pricing**: 100 credits for $10
- **Expiration**: Credits never expire
- **Usage**: 1 credit per AI image generation
- Credits are a one-time purchase (not subscription)

### 4. BYOK (Bring Your Own Key)
- Users can use AI tools completely FREE if they provide their own API key
- Already partially implemented - needs to be prominently displayed as an option

### 5. Subscription Tier (for Business Owners / Power Users)
- **Monthly**: $29/month
- **Yearly**: $199/year (saves ~$149)
- **Soft Cap**: 500 generations per month (fair use policy)
- Includes unlimited access to ALL AI tools
- Subscribers do not consume credits

### 6. User Model
- No new user role required
- Subscription status is separate from role (user/client/admin)
- Any role can purchase credits or subscribe
- Clients (business owners) are the primary target for subscriptions

---

## Technical Requirements

### Database Changes
- Add `creditBalance` field to user table (integer, default 0)
- Add `subscriptionTier` field (text: null | "unlimited-monthly" | "unlimited-yearly")
- Add `subscriptionExpiresAt` timestamp
- Add `subscriptionStartedAt` timestamp
- Create `creditTransaction` table for audit trail

### Credit System Logic
Priority order for generation eligibility:
1. Check if user has BYOK (own API key) → Allow unlimited
2. Check if user has active subscription → Allow (track for soft cap)
3. Check if user has credits > 0 → Allow, deduct after generation
4. Deny with upgrade prompt

### Payment Integration
- Use Polar for payment processing (env vars already configured)
- Products to create in Polar:
  - "100 AI Credits" - $10 one-time
  - "Unlimited Monthly" - $29/month recurring
  - "Unlimited Yearly" - $199/year recurring

### UI/UX Requirements
- New pricing section with three options side-by-side:
  1. Pay-as-you-go (Credits)
  2. Unlimited Subscription (monthly/yearly toggle)
  3. BYOK (free option)
- Clear "Coming Soon" badges on unavailable tools
- Prominent featuring of AI Image Generator

---

## User Decisions Captured

| Decision | Answer |
|----------|--------|
| Credit expiry | Never expire |
| Subscription soft cap | 500 generations/month |
| Subscription pricing | $29/mo or $199/yr |
| Coming Soon badges | All tools except Image Generator |
| Implementation scope | Full implementation including payments |

---

## Files Affected

### Core Files
- `src/app/ai-tools/page.tsx` - Hero CTAs
- `src/lib/data/ai-tools.ts` - Add status field
- `src/lib/types/business.ts` - Add status to AITool interface
- `src/components/marketing/tool-preview-card.tsx` - Coming Soon badge
- `src/lib/schema.ts` - Database schema changes
- `src/lib/data/packages.ts` - Credit packages, subscription plans
- `src/lib/services/token-system.ts` - Hybrid credit/subscription logic
- `src/app/api/generate/route.ts` - Updated eligibility check

### New Files
- `src/components/marketing/ai-pricing-section.tsx` - New pricing layout
- `src/app/api/webhooks/polar/route.ts` - Polar webhook handler
- `src/app/api/checkout/credits/route.ts` - Credit purchase initiation
- `src/app/api/checkout/subscription/route.ts` - Subscription initiation
