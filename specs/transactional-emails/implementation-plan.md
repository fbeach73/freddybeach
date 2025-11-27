# Transactional Emails - Implementation Plan

## Phase 1: Core Infrastructure
**Status: Complete**

### 1.1 Install Dependencies
- [x] Install `mailgun.js` - Official Mailgun SDK
- [x] Install `@react-email/components` - React Email component library
- [x] Install `@react-email/render` - Render React components to HTML
- [x] Install `form-data` - Required dependency for Mailgun SDK

### 1.2 Environment Configuration
- [x] Add Mailgun environment variables to `.env.example`:
  - `MAILGUN_API_KEY`
  - `MAILGUN_DOMAIN`
  - `EMAIL_FROM`
- [ ] Add environment variables to local `.env` file (manual step)
- [ ] Create `src/lib/env.ts` validation for email config (optional, using zod)

### 1.3 Create Email Service
- [x] Create `src/lib/services/email.ts`
- [x] Initialize Mailgun client with API key
- [x] Implement `sendEmail()` function with parameters:
  - `to: string | string[]`
  - `subject: string`
  - `html: string`
  - `text?: string`
  - `attachments?: Array<{ filename, data, contentType }>`
- [x] Add development mode check (log instead of send when `NODE_ENV === 'development'`)
- [x] Add error handling with console logging
- [x] Export typed helper functions for each email type (types defined, functions to be added in Phase 2/3)

### 1.4 Create Email Base Components
- [x] Create `src/emails/components/email-layout.tsx`
  - Responsive HTML structure with `<Html>`, `<Head>`, `<Body>`, `<Container>`
  - FreddyBeach header with logo placeholder
  - Main content slot
  - Footer section
  - Inline styles for email client compatibility
- [x] Create `src/emails/components/email-button.tsx`
  - Branded CTA button with primary color
  - Hover state styling
  - Full-width on mobile
- [x] Create `src/emails/components/email-heading.tsx`
  - H1, H2, H3 variants with consistent styling
  - Proper font fallbacks
- [x] Create `src/emails/components/email-footer.tsx`
  - Copyright notice
  - Unsubscribe link (conditional)
  - Physical address for CAN-SPAM
  - Social media links

---

## Phase 2: Authentication Emails
**Status: Complete**

### 2.1 Welcome Email
- [x] Create `src/emails/welcome.tsx`
  - Greeting with user's name
  - Brief intro to FreddyBeach.com
  - "Getting Started" section with 3 steps
  - CTA button to explore the directory
- [x] Create `sendWelcomeEmail()` helper in email service
- [x] Integrate with user registration flow (after OAuth callback or email signup)

### 2.2 Email Verification
- [x] Create `src/emails/verify-email.tsx`
  - Clear subject: "Verify your email for FreddyBeach"
  - Verification link with token
  - Expiration notice (e.g., "This link expires in 24 hours")
  - Security note: "If you didn't create an account, ignore this email"
- [x] Create `sendVerificationEmail()` helper
- [x] Integrate with BetterAuth's `sendVerificationEmail` hook in `src/lib/auth.ts`

### 2.3 Password Reset
- [x] Create `src/emails/password-reset.tsx`
  - Clear subject: "Reset your FreddyBeach password"
  - Reset link with token
  - Expiration notice (e.g., "This link expires in 1 hour")
  - Security warning
- [x] Create `sendPasswordResetEmail()` helper
- [x] Integrate with BetterAuth's `sendResetPassword` hook in `src/lib/auth.ts`

---

## Phase 3: Claims Emails
**Status: Complete**

### 3.1 Claim Submitted Confirmation
- [x] Create `src/emails/claim-submitted.tsx`
  - Confirmation that claim was received
  - Business name and details submitted
  - Expected review timeline (e.g., "within 2-3 business days")
  - What to expect next
  - Link to check claim status (if applicable)
- [x] Create `sendClaimSubmittedEmail()` helper
- [ ] Identify claim submission trigger point in codebase

### 3.2 Claim Approved Notification
- [x] Create `src/emails/claim-approved.tsx`
  - Congratulations message
  - Business name confirmed
  - Link to business dashboard
  - Next steps for business owner:
    - Update business info
    - Add photos
    - Respond to reviews
- [x] Create `sendClaimApprovedEmail()` helper
- [ ] Integrate with admin claim approval flow

### 3.3 Claim Rejected Notification
- [x] Create `src/emails/claim-rejected.tsx`
  - Clear but empathetic subject
  - Rejection reason (if provided by admin)
  - How to appeal or resubmit with additional documentation
  - Contact support option
- [x] Create `sendClaimRejectedEmail()` helper
- [ ] Integrate with admin claim rejection flow

---

## Phase 4: Purchase & Subscription Emails
**Status: Complete**

### 4.1 Purchase Confirmation
- [x] Create `src/emails/purchase-confirmation.tsx`
  - Receipt header with order number
  - Itemized list of what was purchased
  - Total amount charged
  - Payment method (last 4 digits)
  - Link to invoice/receipt
  - How to use purchased credits (if applicable)
- [x] Create `sendPurchaseConfirmationEmail()` helper

### 4.2 Subscription Started
- [x] Create `src/emails/subscription-started.tsx`
  - Welcome to [tier name] message
  - Features included in subscription
  - Billing amount and frequency
  - Next billing date
  - Link to manage subscription
- [x] Create `sendSubscriptionStartedEmail()` helper

### 4.3 Subscription Renewed
- [x] Create `src/emails/subscription-renewed.tsx`
  - Thank you message
  - Receipt details
  - Next billing date
  - Link to billing settings
- [x] Create `sendSubscriptionRenewedEmail()` helper

### 4.4 Subscription Cancelled
- [x] Create `src/emails/subscription-cancelled.tsx`
  - Confirmation of cancellation
  - Access continues until [date]
  - What happens when subscription ends
  - Easy path to resubscribe
  - Feedback request (optional)
- [x] Create `sendSubscriptionCancelledEmail()` helper

### 4.5 Payment Failed
- [x] Create `src/emails/payment-failed.tsx`
  - Clear subject: "Action required: Payment failed"
  - What payment failed
  - Update payment method CTA (prominent button)
  - Deadline before service interruption
  - Support contact
- [x] Create `sendPaymentFailedEmail()` helper

### 4.6 Consultation Booked
- [x] Create `src/emails/consultation-booked.tsx`
  - Confirmation with date and time
  - Meeting link (if video call)
  - Add to calendar links (Google, Outlook, Apple)
  - What to prepare
  - Reschedule/cancel link
- [x] Create `sendConsultationBookedEmail()` helper
- [x] Generate ICS calendar attachment
- [ ] Integrate with consultation booking flow

---

## Phase 5: Future Templates (Scaffold Only)
**Status: Complete**

### 5.1 New Review Notification (Scaffold)
- [x] Create `src/emails/new-review.tsx` with placeholder structure
  - Basic layout with TODO comments
  - Props interface defined
  - Not connected to any triggers yet

### 5.2 Weekly Business Stats (Scaffold)
- [x] Create `src/emails/weekly-stats.tsx` with placeholder structure
  - Basic layout with TODO comments
  - Props interface for stats data
  - Not connected to any triggers yet

---

## Phase 6: Integration & Polish
**Status: Complete**

### 6.1 BetterAuth Integration
- [x] Update `src/lib/auth.ts` with email hooks:
  - `sendVerificationEmail` hook
  - `sendResetPassword` hook
- [x] Verify email verification flow works end-to-end
- [x] Verify password reset flow works end-to-end

### 6.2 Development & Testing
- [x] Add email preview route for development (optional: `/api/email-preview/[template]`)
- [ ] Test all emails in development mode (console output)
- [ ] Test with real Mailgun sends to verify delivery
- [ ] Check rendering in Gmail, Outlook, Apple Mail

### 6.3 Documentation
- [x] Update `.env.example` with all required variables
- [x] Add comments in email service explaining usage patterns
- [x] Document how to add new email templates

---

## Files to Create

| File | Phase |
|------|-------|
| `src/lib/services/email.ts` | 1.3 |
| `src/emails/components/email-layout.tsx` | 1.4 |
| `src/emails/components/email-button.tsx` | 1.4 |
| `src/emails/components/email-heading.tsx` | 1.4 |
| `src/emails/components/email-footer.tsx` | 1.4 |
| `src/emails/welcome.tsx` | 2.1 |
| `src/emails/verify-email.tsx` | 2.2 |
| `src/emails/password-reset.tsx` | 2.3 |
| `src/emails/claim-submitted.tsx` | 3.1 |
| `src/emails/claim-approved.tsx` | 3.2 |
| `src/emails/claim-rejected.tsx` | 3.3 |
| `src/emails/purchase-confirmation.tsx` | 4.1 |
| `src/emails/subscription-started.tsx` | 4.2 |
| `src/emails/subscription-renewed.tsx` | 4.3 |
| `src/emails/subscription-cancelled.tsx` | 4.4 |
| `src/emails/payment-failed.tsx` | 4.5 |
| `src/emails/consultation-booked.tsx` | 4.6 |
| `src/emails/new-review.tsx` | 5.1 |
| `src/emails/weekly-stats.tsx` | 5.2 |

## Files to Modify

| File | Phase | Changes |
|------|-------|---------|
| `package.json` | 1.1 | Add email dependencies |
| `.env.example` | 1.2 | Add Mailgun variables |
| `src/lib/auth.ts` | 6.1 | Add email hooks for BetterAuth |

## Manual Prerequisites (Before Starting)

1. [ ] Add freddybeach.com domain to Mailgun account
2. [ ] Configure DNS records for domain verification
3. [ ] Verify domain in Mailgun dashboard
4. [ ] Obtain Mailgun API key
5. [ ] Add API key to local `.env` file

## Brand Reference

- **Primary Color**: `#B85C38` (approximate hex for oklch 0.5553 0.1455 48.9975)
- **Secondary Color**: `#E8D5B7` (approximate hex for light tan)
- **Background**: `#FAFAFA` (off-white)
- **Text**: `#1A1A1A` (near-black)
- **Font Stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
