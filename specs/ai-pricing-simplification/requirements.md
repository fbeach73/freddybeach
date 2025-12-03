# AI Pricing Simplification - Requirements

## Overview

Simplify the AI tools monetization model to a sustainable **Credits + Paid BYOK** system while keeping directory business subscriptions separate.

## Business Goals

1. Generate recurring revenue from AI image generation feature
2. Maintain healthy profit margins at all image resolutions
3. Keep pricing simple and intuitive for users
4. Encourage power users to subscribe to BYOK Pro

## Cost Analysis (Gemini API)

| Resolution | API Cost per Image |
|------------|-------------------|
| 1K (1024px) | ~$0.04 |
| 2K (2048px) | ~$0.13 |
| 4K (4096px) | ~$0.24 |

---

## Pricing Structure

### 1. Credit Packs (Pay-As-You-Go)

| Pack | Credits | Price | Per Credit | Margin (1K) |
|------|---------|-------|------------|-------------|
| Starter | 10 | $1.99 | $0.20 | 80% |
| Popular | 50 | $6.99 | $0.14 | 71% |
| Value | 100 | $9.99 | $0.10 | 60% |

### 2. Resolution-Based Credit Consumption

| Resolution | Credits Required | API Cost | Revenue | Margin |
|------------|------------------|----------|---------|--------|
| 1K (1024px) | 1 credit | $0.04 | $0.10 | 60% |
| 2K (2048px) | 2 credits | $0.13 | $0.20 | 35% |
| 4K (4096px) | 4 credits | $0.24 | $0.40 | 40% |

**Rule:** Resolution doubles = Credits double (intuitive for users)

### 3. BYOK Pro Subscription

| Plan | Price | Description |
|------|-------|-------------|
| BYOK Pro | $7.99/month | Use your own API key, unlimited generations |

**What subscribers get:**
- Bring their own free Google API key (1,500 images/day free from Google)
- Full access to UI, presets, history, gallery
- No usage limits
- Zero API cost to platform = pure profit

### 4. Directory Subscriptions (Unchanged)

Keep separate from AI tools pricing:
- Enhanced: $99/year (100 AI generations/month) - for business owners
- Featured: $199/year (unlimited AI generations) - for business owners

---

## Functional Requirements

### FR-1: Multiple Credit Packs
- Users can purchase 10, 50, or 100 credit packs
- Each pack redirects to Polar checkout
- Credits are added to user balance after webhook confirmation

### FR-2: Resolution-Based Pricing
- System calculates credits needed based on output resolution
- 1K = 1 credit, 2K = 2 credits, 4K = 4 credits
- User sees credit cost before generating
- Generation blocked if insufficient credits

### FR-3: BYOK Pro Subscription
- Users can subscribe to BYOK Pro for $7.99/month
- Requires adding their own Google API key
- Subscription managed via Polar
- Access granted/revoked via webhook

### FR-4: Updated Billing UI
- Display all 3 credit packs
- Show BYOK Pro subscription option
- Display credit cost per resolution
- Show current credit balance prominently

---

## Revenue Projections

| Scenario | Images | Credits | Cost | Revenue | Profit |
|----------|--------|---------|------|---------|--------|
| 10 × 1K images | 10 | 10 | $0.40 | $1.99 | $1.59 |
| 50 × 1K images | 50 | 50 | $2.00 | $6.99 | $4.99 |
| 25 × 2K images | 25 | 50 | $3.25 | $6.99 | $3.74 |
| 12 × 4K images | 12 | 48 | $2.88 | $6.99 | $4.11 |
| BYOK Pro (monthly) | unlimited | 0 | $0 | $7.99 | $7.99 |

---

## Out of Scope

- Changes to directory subscription pricing ($29/$199)
- Free tier changes (stays at 5 generations/month)
- Unit and E2E testing
