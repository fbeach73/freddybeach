# Business Claims System - Requirements

## Overview
A business claims system that allows users to claim ownership of unclaimed business listings, with admin approval workflow.

## Current State
- Business table already has `ownerId` and `claimedAt` fields
- Business owners with `ownerId` set can already edit their listings at `/dashboard/my-businesses/[id]/edit`
- Admin claims page exists at `/admin/claims` but uses mock data
- Users can register/login via Better Auth with Google OAuth

---

## Key Decisions
- **Role upgrade**: Users upgraded from "user" to "client" role on first claim approval
- **Email notifications**: Send emails when claims are approved/rejected (requires Resend setup)
- **Rejection reason**: Required field when admin rejects a claim

---

## Functional Requirements

### FR1: Claim Submission
- **FR1.1**: "Claim This Business" button displayed on business detail pages
- **FR1.2**: Button only visible when: user is logged in AND `business.ownerId` is null
- **FR1.3**: Clicking button opens a modal form with fields:
  - Role at business (Owner, Manager, Authorized Representative) - dropdown
  - Phone number - text input
  - Brief description of connection to business - textarea
- **FR1.4**: Submitting creates a record in claims table with status "pending"
- **FR1.5**: User sees success toast: "Claim submitted for review"
- **FR1.6**: Prevent duplicate claims: user cannot submit if they already have a pending claim for that business

### FR2: Claims Database Table
- **FR2.1**: Table fields: id, businessId (FK to business), userId (FK to user), role, phone, description, status (pending/approved/rejected), rejectionReason, createdAt, reviewedAt, reviewedBy (FK to user)
- **FR2.2**: Status enum: pending, approved, rejected
- **FR2.3**: Role enum: owner, manager, authorized_representative

### FR3: Admin Claims Management
- **FR3.1**: Replace mock data at `/admin/claims` with real claims from database
- **FR3.2**: List view showing: business name, claimant name and email, role, phone, submitted date, status
- **FR3.3**: Filter tabs: All, Pending, Approved, Rejected
- **FR3.4**: Each pending claim has Approve and Reject buttons
- **FR3.5**: Approve action:
  - Sets `business.ownerId` to claimant userId
  - Sets `business.claimedAt` to now
  - Sets `claim.status` to approved
  - Sets `claim.reviewedAt` and `claim.reviewedBy`
  - Upgrades user role from "user" to "client" if applicable
  - Sends approval email to user
- **FR3.6**: Reject action:
  - Requires rejection reason (mandatory)
  - Sets `claim.status` to rejected
  - Sets `claim.rejectionReason`
  - Sets `claim.reviewedAt` and `claim.reviewedBy`
  - Sends rejection email with reason to user
- **FR3.7**: Show confirmation modal before approve/reject

### FR4: User Feedback
- **FR4.1**: On `/dashboard/my-businesses`, if user has no businesses but has pending claims, show message: "You have X pending claim(s) awaiting review"
- **FR4.2**: List the business names and submission dates for pending claims
- **FR4.3**: Update empty state messaging based on pending claims status

### FR5: Email Notifications
- **FR5.1**: Send email when claim is approved
- **FR5.2**: Send email when claim is rejected (include rejection reason)
- **FR5.3**: Use Resend as email provider

---

## Non-Functional Requirements

### NFR1: UI/UX
- All UI components use shadcn/ui
- Consistent with existing admin and dashboard styling
- Support dark mode
- Responsive design

### NFR2: Security
- Only authenticated users can submit claims
- Only admins can approve/reject claims
- Prevent duplicate pending claims per user per business

### NFR3: Database
- Use Drizzle ORM with PostgreSQL
- Proper indexing on claims table for status, businessId, userId
