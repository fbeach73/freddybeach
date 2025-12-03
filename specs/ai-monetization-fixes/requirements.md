# AI Monetization Fixes - Requirements

## Overview

This document outlines the bugs, issues, and improvements identified during a comprehensive code review of the AI tools monetization implementation. The review found critical bugs, code duplication, missing functionality, and best practices violations that need to be addressed.

## Issue Categories

### Critical Issues (Must Fix)

#### 1. Code Duplication - Image Generator Pages
- **Problem:** Two nearly identical 640+ line files exist:
  - `src/app/ai-tools/image-generator/page.tsx`
  - `src/app/dashboard/ai-tools/image-generator/page.tsx`
- **Differences:** Only ~1% differs (back button link, TabsList styling, container class)
- **Impact:** 1,280+ lines of duplicated code that will diverge and cause maintenance issues
- **Requirement:** Extract shared logic into a reusable component

#### 2. Billing Page POST Button Bug
- **Problem:** The "Buy Credits" button uses `<Link href="/api/checkout/credits">` but the endpoint only handles POST requests
- **Location:** `src/app/dashboard/billing/page.tsx:143-148`
- **Impact:** Button click fails silently (405 Method Not Allowed)
- **Requirement:** Convert to client component with proper POST request

#### 3. Webhook Missing Email Notifications
- **Problem:** Polar webhook handlers don't send confirmation emails
- **Location:** `src/app/api/webhooks/polar/route.ts`
- **Missing calls:**
  - `sendSubscriptionStartedEmail()` on subscription.created/active
  - `sendSubscriptionRenewedEmail()` on subscription.updated
  - `sendSubscriptionCancelledEmail()` on subscription.canceled/revoked
  - `sendPurchaseConfirmationEmail()` on order.paid
- **Impact:** Users receive no email confirmation for purchases or subscription changes

### High Priority Issues

#### 4. Hardcoded User Tier
- **Problem:** Image generator pages hardcode `userTier = "free"` instead of fetching actual subscription status
- **Locations:** Both image generator pages, line 170-174
- **Impact:** Users with subscriptions or credits see incorrect usage limits
- **Requirement:** Fetch tier from token-system service on server side

#### 5. Tier Logic Inconsistency
- **Problem:** Two separate tier concepts aren't reconciled:
  - Role-based: admin→featured, client→enhanced, user→free
  - Subscription-based: monthly, yearly
- **Impact:** Unclear what tier applies when user has both role and subscription
- **Requirement:** Define clear priority logic

#### 6. Soft Cap Not Enforced
- **Problem:** 500 generations/month soft cap only warns, doesn't block
- **Location:** `src/app/api/generate/route.ts`
- **Requirement:** Add option to enforce or clearly document as "soft" limit

### Medium Priority Issues

#### 7. Missing BYOK Management UI
- **Problem:** No accessible UI for users to add their own API key
- **Impact:** BYOK feature is incomplete
- **Requirement:** Add API key management to billing or settings page

#### 8. Incomplete Audit Trail
- **Problem:** Subscription usage not logged to creditTransaction table
- **Impact:** Billing history incomplete for subscription users
- **Requirement:** Log all generation consumption uniformly

#### 9. Multiple Entry Points Confusion
- **Problem:** Three different routes to image generator:
  - `/generate` - Landing page
  - `/ai-tools/image-generator` - Public version
  - `/dashboard/ai-tools/image-generator` - Dashboard version
- **Requirement:** Clarify canonical path, consider redirects

### Low Priority Issues

#### 10. TODO Comments in Production
- **Problem:** Unresolved TODOs in production code
- **Requirement:** Resolve or remove before production

#### 11. Fragile Webhook Metadata
- **Problem:** Tier detection falls back to product name parsing
- **Requirement:** Add validation or more robust fallback

## Success Criteria

1. No duplicate code between image generator pages
2. All billing actions work correctly (credits purchase, subscription)
3. Users receive email confirmations for all transactions
4. User tier is accurately displayed based on actual subscription status
5. Clear documentation of soft cap behavior
6. TypeScript and ESLint continue to pass
