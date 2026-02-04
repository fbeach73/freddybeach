# Add Business Flow - Requirements

## Problem Statement

Users cannot easily add their business to the directory. The current flow has several critical issues:

1. **`/add-business` route is broken** - The footer links to `/add-business` but this route is not in the middleware's `KNOWN_ROUTES`, so it gets 301-redirected to `blog.freddybeach.com/add-business` (a dead page).
2. **No sign-in gate for unauthenticated users** - Visitors clicking "Add Business" in the footer should be prompted to sign in or sign up, not redirected to a broken URL.
3. **No prominent "Add Business" CTA in dashboard** - Once logged in, there is no visible button/link to submit a business. The only way to reach the form is through an empty-state link or knowing the URL `/dashboard/my-businesses/new`.
4. **No image upload on submission form** - The business create form has no way to upload a featured image, which is a key part of a business listing.
5. **Image format consistency** - Uploaded images (PNG, JPG) should be auto-converted to WebP for performance.

## Requirements

### R1: Public `/add-business` Entry Point
- The `/add-business` URL must resolve to a real page (not redirect to blog subdomain)
- **Not logged in**: Show a marketing-style page explaining the benefits of listing a business, with a prominent sign-in/sign-up prompt (reuse existing `AuthDialog` component)
- **Logged in**: Redirect to `/dashboard/my-businesses/new` (the actual submission form)

### R2: Prominent Dashboard CTAs
- Add a visible "Add Business" button in the dashboard sidebar navigation (always visible, not buried in empty states)
- Ensure the main dashboard page has a clear, always-visible path to the business submission form

### R3: Image Upload on Business Submission Form
- Add a "Featured Image" upload section to the business create form
- Accept JPG, PNG, and WebP files (max 5MB)
- Show image preview after selection with ability to remove/change
- Auto-convert PNG and JPG uploads to WebP using `sharp` library
- Store converted images in Vercel Blob storage (already configured in project)
- Image upload is optional (not required to submit)
- Set the uploaded image URL as the business `imageUrl` field

### R4: Hours "Closed" Option (Already Implemented)
- Each day in the hours section has an Open/Closed toggle - **already done in previous session**
- Verify it remains functional

## Existing Infrastructure to Reuse
- **Vercel Blob**: `@vercel/blob` v2.0.0 already installed, `BLOB_READ_WRITE_TOKEN` configured
- **Blob storage service**: `src/lib/services/blob-storage.ts` has upload patterns
- **Blog image upload component**: `src/components/admin/blog/image-upload.tsx` has drag-and-drop pattern
- **Blog image API route**: `src/app/api/blog/images/route.ts` has multipart upload handling
- **AuthDialog**: `src/components/auth/auth-dialog.tsx` has sign-in/sign-up modal
- **Business schema**: `imageUrl` field already exists on the business table

## Out of Scope
- Unit/e2e testing
- Multiple image uploads (single featured image only for now)
- Image cropping/editing UI
