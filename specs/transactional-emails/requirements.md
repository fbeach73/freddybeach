# Transactional Emails - Requirements

## Overview

Implement a complete transactional email system for FreddyBeach.com to handle authentication flows, business claim notifications, purchase/subscription communications, and future business owner notifications.

## Email Provider

- **Service**: Mailgun (existing $50/month account)
- **Domain**: freddybeach.com (to be added to Mailgun)
- **From Address**: hello@freddybeach.com

## Email Categories

### 1. Account & Authentication

| Email | Trigger | Recipients |
|-------|---------|------------|
| Welcome | User completes registration | New user |
| Email Verification | User registers with email/password | New user |
| Password Reset | User requests password reset | User |

### 2. Business Claims

| Email | Trigger | Recipients |
|-------|---------|------------|
| Claim Submitted | User submits business claim | Claimant |
| Claim Approved | Admin approves claim | Business owner |
| Claim Rejected | Admin rejects claim | Claimant |

### 3. Purchases & Subscriptions

| Email | Trigger | Recipients |
|-------|---------|------------|
| Purchase Confirmation | Successful payment (credits, one-time) | Buyer |
| Subscription Started | New subscription created | Subscriber |
| Subscription Renewed | Recurring payment successful | Subscriber |
| Subscription Cancelled | User cancels subscription | Former subscriber |
| Payment Failed | Payment fails | Subscriber |
| Consultation Booked | User books consultation | Booker |

### 4. Future (Scaffold Only)

| Email | Trigger | Recipients |
|-------|---------|------------|
| New Review Notification | Customer leaves review | Business owner |
| Weekly Business Stats | Weekly schedule | Business owners |

## Technical Requirements

### Email Service

- Use Mailgun official SDK (`mailgun.js`)
- Reusable `sendEmail()` function with TypeScript types
- Development mode: log to console instead of sending
- Error handling and logging for failed sends
- Environment-based configuration (no hardcoded credentials)

### Email Templates

- Use React Email for type-safe TSX templates
- Responsive HTML that renders well on mobile
- Consistent branding matching FreddyBeach.com:
  - Primary color: warm orange/brown (oklch 0.5553 0.1455 48.9975)
  - Secondary: light tan
  - Fonts: Match site typography where email-safe
- Dark mode support via `prefers-color-scheme`
- Reusable components: layout, buttons, headings, footer

### Compliance

- Unsubscribe link in marketing-style emails
- Physical mailing address in footer (CAN-SPAM compliance)
- Clear sender identification

### Integration Points

- BetterAuth hooks for verification and password reset emails
- Admin claim approval flow triggers
- Payment webhook handlers (future Polar integration)
- Consultation booking flow

## Environment Variables

```env
MAILGUN_API_KEY=key-xxx
MAILGUN_DOMAIN=freddybeach.com
EMAIL_FROM=hello@freddybeach.com
```

## Mailgun Setup (Manual Prerequisites)

Before implementation can be completed:

1. Log into Mailgun dashboard
2. Add freddybeach.com as a sending domain
3. Configure DNS records:
   - TXT record for SPF
   - CNAME records for DKIM
4. Verify domain in Mailgun
5. Generate and save API key

## File Structure

```
src/
├── lib/
│   └── services/
│       └── email.ts              # Mailgun service wrapper
├── emails/
│   ├── components/
│   │   ├── email-layout.tsx      # Base responsive layout
│   │   ├── email-button.tsx      # Branded CTA button
│   │   ├── email-heading.tsx     # Consistent headings
│   │   └── email-footer.tsx      # Footer with unsubscribe
│   ├── welcome.tsx
│   ├── verify-email.tsx
│   ├── password-reset.tsx
│   ├── claim-submitted.tsx
│   ├── claim-approved.tsx
│   ├── claim-rejected.tsx
│   ├── purchase-confirmation.tsx
│   ├── subscription-started.tsx
│   ├── subscription-renewed.tsx
│   ├── subscription-cancelled.tsx
│   ├── payment-failed.tsx
│   ├── consultation-booked.tsx
│   ├── new-review.tsx            # Scaffold only
│   └── weekly-stats.tsx          # Scaffold only
```

## Success Criteria

- All email templates render correctly in major email clients (Gmail, Outlook, Apple Mail)
- Emails display properly on mobile devices
- BetterAuth integration works for verification and password reset
- Development mode allows testing without sending real emails
- Easy to add new email templates following established patterns
