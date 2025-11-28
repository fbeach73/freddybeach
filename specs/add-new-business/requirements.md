# Add New Business Feature - Requirements

## Overview
Allow users to add businesses that aren't in Google Places to the FreddyBeach directory. Submitted businesses require admin review before becoming publicly visible.

## User Story
As a user, I want to suggest a local business that isn't listed in the directory, so that the community can discover it once approved by an admin.

## Business Rules

### Submission Rules
- Any authenticated user can submit a new business
- Users can suggest ANY business (not just ones they own)
- Submitted businesses are NOT publicly visible until admin approves
- Submitter is tracked separately from business owner (different concepts)

### Status Flow
```
User submits → pending_review → Admin approves → published
                             → Admin rejects → archived (or deleted)
```

### Required Fields (Comprehensive)
- Business Name
- Category
- Street Address
- City (default: Fredericton)
- Province (default: NB)
- Phone Number
- Description
- Business Hours (all 7 days)

### Optional Fields
- Email
- Website
- Postal Code

## Technical Requirements

### ID Generation
- Business ID: Generated via `nanoid()` - no Google dependency required
- Slug: Generated via `generateSlug(name)` - URL-friendly with uniqueness suffix

### New Database Fields
1. **New status enum value**: `pending_review` added to `business_status` enum
2. **New field**: `submittedById` - tracks who suggested the business (separate from `ownerId`)

### Notifications
- Email notification sent to admin when a new business is submitted
- Reuse existing Mailgun setup (same as claims notifications)

## User Interface Requirements

### New Business Page (`/dashboard/my-businesses/new`)
- Form with all required/optional fields
- Clear indication that submission requires admin review
- Validation for required fields before submission
- Success toast and redirect after submission

### Admin Panel Updates
- Filter/view for `pending_review` businesses
- Ability to approve (change to `published`) or reject
- View submitter information

## Success Criteria
1. User can access `/dashboard/my-businesses/new` when authenticated
2. Form validates all required fields
3. Submission creates business with `status: pending_review`
4. Admin receives email notification
5. Business is NOT visible in public directory until approved
6. Admin can approve/reject from admin panel
7. Approved businesses appear in public directory
