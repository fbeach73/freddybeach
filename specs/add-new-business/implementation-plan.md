# Add New Business Feature - Implementation Plan

## Phase 1: Database Schema Changes ✅ COMPLETED

### Tasks
- [x] Add `pending_review` to `businessStatusEnum` in `src/lib/schema.ts`
- [x] Add `submittedById` field to business table (foreign key to user, nullable)
- [x] Run `pnpm db:generate` to create migration
- [x] Run `pnpm db:migrate` to apply migration

### Files to Modify
- `src/lib/schema.ts`

### Schema Changes
```typescript
// Update enum
export const businessStatusEnum = pgEnum("business_status", [
  "draft",
  "pending_review",  // NEW
  "published",
  "archived",
]);

// Add to business table
submittedById: text("submitted_by_id").references(() => user.id, { onDelete: "set null" }),
```

---

## Phase 2: API Route for Business Creation ✅ COMPLETED

### Tasks
- [x] Create `src/app/api/businesses/route.ts`
- [x] Implement POST handler with authentication check
- [x] Add validation for required fields (name, categoryId, address, city, province, phone, description, hours)
- [x] Generate business ID via `nanoid()`
- [x] Generate slug via existing `generateSlug()` function
- [x] Set status to `pending_review`
- [x] Set `submittedById` to current user
- [x] Send email notification to admin on successful creation
- [x] Add admin email template (`src/lib/email/templates/business-submission-admin.ts`)
- [x] Add `ADMIN_EMAIL` to `env.example`

### Files Created
- `src/app/api/businesses/route.ts` - POST and GET endpoints for business submission
- `src/lib/email/templates/business-submission-admin.ts` - Admin notification email template

### API Specification
```
POST /api/businesses
Authentication: Required
Body: {
  name: string (required)
  categoryId: string (required)
  description: string (required)
  phone: string (required)
  address: string (required)
  city: string (default: "Fredericton")
  province: string (default: "NB")
  hours: BusinessHours[] (required)
  email?: string
  website?: string
  postalCode?: string
}
Response: { success: true, businessId: string, message: string }

GET /api/businesses
Authentication: Required
Response: { businesses: Business[] } (businesses submitted by current user)
```

---

## Phase 3: Business Creation Form Component ✅ COMPLETED

### Tasks
- [x] Create `src/components/dashboard/business-create-form.tsx`
- [x] Adapt structure from existing `BusinessEditForm` component
- [x] Remove admin-only fields (isFeatured, displayOrder, badges)
- [x] Add required field validation
- [x] Add info banner explaining the review process
- [x] Implement form submission to POST `/api/businesses`
- [x] Add success toast and redirect to `/dashboard/my-businesses`
- [x] Add loading state during submission

### Files Created
- `src/components/dashboard/business-create-form.tsx`

### Form Sections
1. **Basic Information** - Name, Category, Description (all required)
2. **Contact Information** - Phone (required), Email, Website
3. **Address** - Street, City, Province, Postal Code (street required)
4. **Business Hours** - All 7 days (required)

---

## Phase 4: New Business Page ✅ COMPLETED

### Tasks
- [x] Create `src/app/dashboard/my-businesses/new/page.tsx`
- [x] Add authentication check (redirect if not logged in)
- [x] Add page header with explanation of submission process
- [x] Render `BusinessCreateForm` component
- [x] Add metadata for page title

### Files Created
- `src/app/dashboard/my-businesses/new/page.tsx`

---

## Phase 5: Admin Email Notification ✅ COMPLETED (in Phase 2)

### Tasks
- [x] Create email template for new business submission notification
- [x] Add email sending logic to POST `/api/businesses` route
- [x] Include: business name, category, submitter info, link to admin panel
- [x] Reuse existing Mailgun configuration from claims system

### Files Created (in Phase 2)
- `src/lib/email/templates/business-submission-admin.ts`
- Email sending integrated into `src/app/api/businesses/route.ts` (lines 169-194)

---

## Phase 6: Admin Panel - Pending Review Queue ✅ COMPLETED

### Tasks
- [x] Update `src/app/admin/businesses/page.tsx` to show pending_review filter
- [x] Add status badge for `pending_review` businesses
- [x] Add approve/reject actions for pending businesses
- [x] Create or update API endpoint for status changes (`/api/admin/businesses/[id]/status`)

### Files Modified
- `src/app/admin/businesses/page.tsx` - Added pending_review stat card, filter support, badge styling
- `src/components/admin/businesses/status-filter.tsx` - Added pending_review option
- `src/components/admin/businesses/business-actions.tsx` - Added approve/reject actions for pending_review businesses
- `src/app/api/admin/businesses/[id]/status/route.ts` - Already supported pending_review status

### Implementation Details
- Added "Pending Review" filter option to status dropdown
- Added new stat card showing pending review count (highlighted in orange when > 0)
- Status badge displays "Pending Review" in orange for pending_review businesses
- Admin dropdown menu shows "Approve & Publish" and "Reject" actions for pending businesses
- Approve sets status to "published", Reject sets status to "draft"

---

## File Summary

### Files to Create
| File | Description |
|------|-------------|
| `src/app/api/businesses/route.ts` | POST endpoint for creating businesses |
| `src/components/dashboard/business-create-form.tsx` | Form component for new business |
| `src/app/dashboard/my-businesses/new/page.tsx` | Page for adding new business |

### Files to Modify
| File | Description |
|------|-------------|
| `src/lib/schema.ts` | Add `pending_review` status, `submittedById` field |
| `src/app/admin/businesses/page.tsx` | Add pending review filter/actions |
| `src/app/api/admin/businesses/[id]/status/route.ts` | Handle approve/reject (may already exist) |

---

## Verification Checklist

After implementation, verify:
- [ ] `/dashboard/my-businesses/new` is accessible when logged in
- [ ] Form validates all required fields
- [ ] Submission creates business with `pending_review` status
- [ ] Admin receives email notification
- [ ] New business does NOT appear in public directory
- [ ] Admin can see business in pending review queue
- [ ] Admin can approve → business becomes `published`
- [ ] Approved business appears in public directory
- [ ] `pnpm run typecheck` passes
- [ ] `pnpm run lint` passes
