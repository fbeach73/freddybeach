🔴 CRITICAL (Fix Immediately)

  1. Missing Toggle Public API Endpoint

  Files:
  - src/app/dashboard/ai-tools/image-generator/page.tsx:183-187
  - src/components/generate/generation-output.tsx:32,75-86

  Issue: onTogglePublic callback is defined but NOT implemented - just logs to
  console. Gallery share feature is completely broken.

  Fix: Create src/app/api/generate/[id]/public/route.ts with PUT handler to update
  isPublic field.

  ---
  2. Silent Image Upload Failures

  Files:
  - src/app/api/generate/route.ts:148-155
  - src/app/api/generate/[id]/refine/route.ts:176-195

  Issue: If uploadGeneratedImage() returns falsy, code continues silently. Generations
   may have missing images with no error.

  Fix: Add explicit error handling:
  if (!imageUrl) {
    throw new Error(`Failed to upload image ${i + 1}`);
  }

  ---
  3. Missing JSON Parsing Error Handling

  Files: All API routes (generate, presets, avatars, gallery)

  Issue: await request.json() throws on invalid JSON but has no try-catch. Malformed
  requests crash with 500 instead of 400.

  Fix: Wrap in try-catch, return 400 with helpful error message.

  ---
  4. Using <img> Instead of next/image

  Files:
  - src/components/generate/image-gallery.tsx:214-219,327
  - src/components/generate/generation-output.tsx
  - src/app/dashboard/ai-tools/image-generator/page.tsx:381-386

  Issue: No automatic image optimization, format conversion, or CLS prevention.

  Fix: Replace with next/image component with proper width/height props.

  ---
  5. Missing loadGenerations Paginated Endpoint

  File: src/hooks/use-generation.ts:362

  Issue: Hook calls /api/generate?page=... but this endpoint doesn't exist - only
  single-item GET exists.

  Fix: Implement paginated GET in /api/generate/route.ts or remove unused method.

  ---
  🟠 HIGH (Fix Soon)

  6. Race Condition in Like/Unlike

  File: src/hooks/use-gallery.ts:146-241

  Issue: Optimistic updates don't properly handle rapid toggling. No request
  deduplication.

  Fix: Add pending state Set to prevent double requests.

  ---
  7. Type Mismatch: GeneratedImage vs GalleryImage

  Files:
  - src/components/generate/generation-output.tsx (expects GeneratedImage[])
  - src/components/generate/image-gallery.tsx (expects GalleryImage[])

  Issue: Missing fields (likeCount, prompt, userName) when sharing to gallery.

  Fix: Ensure API returns consistent types with computed fields.

  ---
  8. Duplicate Type Definitions

  Files:
  - src/lib/schema.ts:56-71
  - src/lib/types/image-generation.ts:33-72

  Issue: PresetSettings and GenerationSettings defined twice identically.

  Fix: Delete from schema.ts, import from image-generation.ts.

  ---
  9. Validation Constants Duplicated 3x

  Files:
  - src/app/api/generate/route.ts:55-56 (camelCase)
  - src/app/api/presets/route.ts:10-11 (SCREAMING_CASE)
  - src/app/api/presets/[id]/route.ts:13-14 (SCREAMING_CASE)

  Issue: Same arrays duplicated with inconsistent naming.

  Fix: Create src/lib/constants/validation.ts with shared constants.

  ---
  10. Missing Error Boundaries on Client Pages

  Files:
  - src/app/generate/generate-client.tsx
  - src/app/gallery/gallery-client.tsx

  Issue: Not wrapped with GenerationErrorBoundary - errors crash entire page.

  Fix: Wrap with <GenerationErrorBoundary> in parent server components.

  ---
  11. Empty Array Destructuring Without Bounds Check

  File: src/app/api/presets/[id]/route.ts:139

  Issue: const [updated] = await db.update(...).returning() - array could be empty.

  Fix: Check if array is empty before destructuring.

  ---
  12. No Error Handling for Blob Deletion

  File: src/app/api/avatars/[id]/route.ts:173

  Issue: deleteImage() can fail but not caught. DB record deleted even if blob remains
   orphaned.

  Fix: Add try-catch, log error but continue (orphan blob better than lost record).

  ---
  🟡 MEDIUM (Should Fix)

  13. useEffect Data Fetching Instead of Server Components

  Files:
  - src/app/generate/generate-client.tsx:32-34
  - src/app/gallery/gallery-client.tsx:24-26

  Issue: Initial gallery data fetched client-side in useEffect. Extra round-trip and
  layout shift.

  Fix: Fetch initial data in server component, pass as props.

  ---
  14. Token Usage Not Persisted

  File: src/app/dashboard/ai-tools/image-generator/page.tsx:93

  Issue: tokensUsed state managed locally with useState. Lost on refresh, not synced
  with DB.

  Fix: Create useTokenUsage() hook with /api/user/tokens endpoint.

  ---
  15. Missing Memoization on Image Gallery

  File: src/components/generate/image-gallery.tsx:199-274

  Issue: Image cards re-render on every parent update.

  Fix: Wrap image card component in React.memo().

  ---
  16. Index as Key for Dynamic Lists

  File: src/components/generate/refinement-panel.tsx:122-129

  Issue: key={idx} for image URLs - problematic if list changes.

  Fix: Use compound key: key={\${entry.id}-image-${idx}}`

  ---
  17. Duplicate Error Handling Pattern in Hooks

  Files: All 5 hooks (use-api-key.ts, use-avatars.ts, use-gallery.ts,
  use-generation.ts, use-presets.ts)

  Issue: Identical clearError callback in each hook.

  Fix: Extract to shared utility or custom hook.

  ---
  18. No Timeout for Long API Requests

  File: src/hooks/use-generation.ts:155-244

  Issue: Generate/refine operations have no timeout - user could wait indefinitely.

  Fix: Add AbortController with 2-minute timeout.

  ---
  19. Download Handlers Missing Error Feedback

  Files:
  - src/components/generate/generation-output.tsx:58-73
  - src/components/generate/image-gallery.tsx:97-112

  Issue: Fetch failures in handleDownload() give no user feedback.

  Fix: Add try-catch with toast notification on failure.

  ---
  20. Missing Null Check on Generation Settings

  File: src/app/api/generate/[id]/refine/route.ts:100

  Issue: Unsafe cast gen.settings as GenerationSettings - could be null from DB.

  Fix: Add validation before type assertion.

  ---
  21. FileReader Error Events Not Handled

  File: src/components/generate/avatar-manager.tsx:101-126

  Issue: No reader.onerror handler for failed file reads.

  Fix: Add onerror callback with user-friendly error message.

  ---
  22. Error State Not Cleared After Success

  Files:
  - src/components/generate/preset-manager.tsx:139
  - src/components/generate/avatar-manager.tsx

  Issue: Stale error messages persist after successful operations.

  Fix: Add setError(null) after success.

  ---
  🟢 LOW (Nice to Have)

  23. TODO Comment Incomplete

  File: src/app/dashboard/ai-tools/image-generator/page.tsx:414
  // TODO: Load this generation and switch to generate tab

  ---
  24. Prop Drilling in PromptBuilder

  File: src/components/generate/prompt-builder.tsx:48-57

  Issue: 7 props passed down. Consider context for generation settings.

  ---
  25. Type Casting Workaround

  File: src/hooks/use-gallery.ts:44-45

  Issue: (data as unknown as { error?: string }).error - define proper error response
  type.

  ---
  26. No Fallback for Failed Image Loads

  File: src/components/generate/image-gallery.tsx:214

  Issue: If image URL becomes invalid, no fallback shown.

  Fix: Add onError handler to show placeholder.

  ---
  27. Missing userId in API Response

  File: src/app/api/generate/[id]/route.ts:60-69

  Issue: GET response doesn't include userId field (inconsistent with other
  endpoints).

  ---
  28. Refs for Function Dependencies

  File: src/hooks/use-generation.ts:93-95,148-149,247-248

  Issue: Using useRef to store function references to avoid circular deps is a code
  smell.

  ---
  Summary

  | Priority    | Count | Action                             |
  |-------------|-------|------------------------------------|
  | 🔴 Critical | 5     | Fix immediately before next deploy |
  | 🟠 High     | 7     | Fix in current sprint              |
  | 🟡 Medium   | 10    | Schedule for next sprint           |
  | 🟢 Low      | 6     | Backlog/opportunistic              |
  | Total       | 28    |                                    |