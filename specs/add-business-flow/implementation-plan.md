# Add Business Flow - Implementation Plan

## Phase 1: Fix `/add-business` Route

### Tasks
- [x] Add `"add-business"` to `KNOWN_ROUTES` in `src/middleware.ts` (line 144) to stop the blog subdomain redirect
- [x] Create `src/app/add-business/page.tsx` as a server component:
  - Check session via `auth.api.getSession()`
  - If logged in: `redirect("/dashboard/my-businesses/new")`
  - If not logged in: Render a page with benefits of listing + `AuthDialog` sign-in/sign-up prompt
- [x] Verify footer link in `src/components/site-footer.tsx` already points to `/add-business` (it does, no change needed)

### Files
- `src/middleware.ts` (edit)
- `src/app/add-business/page.tsx` (new)

---

## Phase 2: Dashboard "Add Business" CTAs

### Tasks
- [x] Add "Add Business" button to dashboard sidebar in `src/components/dashboard/dashboard-sidebar.tsx`:
  - Add as a prominent CTA button (Plus icon + label) at the top of the sidebar content, above the nav items
  - Link to `/dashboard/my-businesses/new`
  - Style as primary/accent to stand out from regular nav items
- [x] Add persistent "Add Business" card on the dashboard home page `src/app/dashboard/page.tsx`:
  - Add a CTA card visible to all users (not just empty state) — e.g. in the CTA cards section at the bottom
  - Or ensure the My Businesses section always shows a link to the form alongside existing businesses

### Files
- `src/components/dashboard/dashboard-sidebar.tsx` (edit)
- `src/app/dashboard/page.tsx` (edit)

---

## Phase 3: Image Upload API with WebP Conversion

### Tasks
- [x] Install `sharp` for image processing: `pnpm add sharp` and `pnpm add -D @types/sharp`
- [x] Create `src/app/api/businesses/image/route.ts`:
  - POST endpoint accepting multipart FormData with a `file` field
  - Require authentication via `auth.api.getSession()`
  - Validate file type (image/jpeg, image/png, image/webp) and size (max 5MB)
  - Use `sharp` to convert JPG/PNG to WebP (quality ~80, resize to max 1200px wide preserving aspect ratio)
  - If already WebP, still optimize with sharp (resize if oversized)
  - Upload resulting buffer to Vercel Blob at `businesses/submissions/{nanoid}.webp`
  - Return `{ url: string }` with the blob URL
  - Follow patterns from existing `src/app/api/blog/images/route.ts` and `src/lib/services/blob-storage.ts`

### Files
- `src/app/api/businesses/image/route.ts` (new)

---

## Phase 4: Image Upload in Business Create Form

### Tasks
- [x] Add image upload section to `src/components/dashboard/business-create-form.tsx`:
  - Add "Featured Image" section between Address and Business Hours sections
  - Drag-and-drop zone + click-to-browse (reuse pattern from `src/components/admin/blog/image-upload.tsx`)
  - Accept jpg, png, webp — display note that images are auto-optimized to WebP
  - Show image preview after selection with remove button
  - Add `imageUrl` state variable
  - On form submit: if image selected, upload to `/api/businesses/image` first, then include returned URL in the business creation POST body
  - Image is optional (form submits fine without one)
- [x] Update `src/app/api/businesses/route.ts` POST handler to accept and save `imageUrl` field from the request body

### Files
- `src/components/dashboard/business-create-form.tsx` (edit)
- `src/app/api/businesses/route.ts` (edit)

---

## Phase 5: Verification & Cleanup

### Tasks
- [x] Run `pnpm lint` — no new errors
- [x] Run `pnpm typecheck` — no new errors
- [x] Run `pnpm build` — production build succeeds, `/add-business` route present
- [ ] Manual verification:
  - Visit `/add-business` logged out → see sign-in prompt page
  - Visit `/add-business` logged in → redirect to `/dashboard/my-businesses/new`
  - Dashboard sidebar shows "Add Business" button
  - Dashboard home page has visible CTA to add a business
  - Business form shows image upload area with drag-and-drop
  - Uploading a .jpg or .png results in a .webp stored in Vercel Blob
  - Uploading a .webp works and is optimized
  - Submitting form without image works fine (optional)
  - Hours section "Closed" toggle still functional
- [ ] Commit and push changes
