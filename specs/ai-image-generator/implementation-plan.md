# AI Image Generator - Implementation Plan

## Phase 1: Foundation Setup ✅ COMPLETED

### Dependencies & Environment

- [x] Add `@google/genai` dependency: `pnpm add @google/genai`
- [x] Add environment variables to `.env`:
  - `GOOGLE_GENAI_API_KEY` - App-provided key for token-based users
  - `ENCRYPTION_KEY` - 32-byte hex string for AES-256-GCM encryption
  - `FREE_TIER_IMAGE_TOKENS=10`
  - `ENHANCED_TIER_IMAGE_TOKENS=50`
  - `FEATURED_TIER_IMAGE_TOKENS=200`
- [x] Update `env.example` with new variables (without values)

### Database Schema

- [x] Add enums to `src/lib/schema.ts`:
  - `generationStatusEnum` (pending, processing, completed, failed)
  - `avatarTypeEnum` (human, object)
- [x] Add `userApiKey` table (id, userId, provider, encryptedKey, iv, keyHint, timestamps)
- [x] Add `avatar` table (id, userId, name, type, imageUrl, description, timestamps)
- [x] Add `preset` table (id, userId, name, settings JSONB, timestamps)
- [x] Add `generation` table (id, userId, prompt, status, settings JSONB, usedAppKey, timestamps)
- [x] Add `generatedImage` table (id, generationId, userId, imageUrl, isPublic, dimensions, timestamp)
- [x] Add `generationHistory` table (id, generationId, role, content, imageUrls JSONB, timestamp)
- [x] Add `imageLike` table (id, imageId, userId, timestamp)
- [x] Add `userTokenUsage` table (id, userId, month, tokensUsed, timestamps)
- [x] Add TypeScript interfaces for JSONB columns (PresetSettings, GenerationSettings)
- [x] Run database migration: `pnpm db:generate && pnpm db:migrate`

---

## Phase 2: Core Library Files ✅ COMPLETED

### Encryption Utility

- [x] Create `src/lib/encryption.ts`:
  - `encrypt(plaintext: string): { encrypted: string; iv: string } | null`
  - `decrypt(encrypted: string, iv: string): string | null`
  - `getKeyHint(apiKey: string): string` - Returns last 4 characters
  - `isValidGoogleApiKey(key: string): boolean` - Format validation

### Gemini Integration

- [x] Create `src/lib/gemini.ts`:
  - `createGeminiClient(apiKey: string): GoogleGenAI`
  - `getUserApiKey(userId: string): Promise<string | null>` - Decrypt from DB
  - `createImagePart(source: string): Promise<Part>` - Handle base64/URL/file
  - `generateWithUserKey(options: GenerateOptions): Promise<GenerationResult>`
  - `refineGeneration(generationId: string, instruction: string, imageId?: string): Promise<GenerationResult>`
  - `buildPromptWithReferences(prompt: string, avatars: Avatar[]): string`

### Token System

- [x] Create `src/lib/services/token-system.ts`:
  - `getTokenLimit(tier: UserTier): number`
  - `getTokenUsage(userId: string, month: string): Promise<number>`
  - `canGenerate(userId: string, tier: UserTier): Promise<boolean>`
  - `incrementTokenUsage(userId: string): Promise<void>`
  - `getUsageStats(userId: string): Promise<UsageStats>`

### Type Definitions

- [x] Create `src/lib/types/image-generation.ts`:
  - `GenerateOptions` interface
  - `GenerationResult` interface
  - `Avatar` interface
  - `Preset` interface
  - `Resolution` type ("1K" | "2K" | "4K")
  - `AspectRatio` type ("1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9")

### Blob Storage Extension

- [x] Add to `src/lib/services/blob-storage.ts`:
  - `uploadGeneratedImage(imageBuffer: ArrayBuffer, userId: string, generationId: string, index: number): Promise<string>`
  - `uploadAvatarImage(file: File, userId: string): Promise<string>`

---

## Phase 3: API Routes ✅ COMPLETED

### Generation Endpoints

- [x] Create `src/app/api/generate/route.ts` (POST):
  - Validate session and request body
  - Check token availability or BYOK status
  - Process avatar references
  - Call Gemini API
  - Upload images to Vercel Blob
  - Save generation to database
  - Return generation result

- [x] Create `src/app/api/generate/[id]/route.ts`:
  - GET: Retrieve generation with images and history
  - DELETE: Delete generation and associated images

- [x] Create `src/app/api/generate/[id]/refine/route.ts` (POST):
  - Validate session and generation ownership
  - Call Gemini refine endpoint
  - Append to generation history
  - Return refined result

### Avatar Endpoints

- [x] Create `src/app/api/avatars/route.ts`:
  - GET: List user's avatars
  - POST: Create new avatar (with file upload)

- [x] Create `src/app/api/avatars/[id]/route.ts`:
  - GET: Get single avatar
  - PUT: Update avatar metadata
  - DELETE: Delete avatar and image

### Preset Endpoints

- [x] Create `src/app/api/presets/route.ts`:
  - GET: List user's presets
  - POST: Create new preset

- [x] Create `src/app/api/presets/[id]/route.ts`:
  - GET: Get single preset
  - PUT: Update preset
  - DELETE: Delete preset

### Gallery Endpoints

- [x] Create `src/app/api/gallery/route.ts` (GET):
  - List public images with pagination
  - Support sorting (recent, popular)
  - Include like counts

- [x] Create `src/app/api/gallery/[id]/like/route.ts`:
  - POST: Like an image
  - DELETE: Unlike an image

### API Key Endpoint

- [x] Create `src/app/api/user/api-key/route.ts`:
  - GET: Check if user has stored key (returns keyHint)
  - POST: Encrypt and store new API key
  - DELETE: Remove stored API key

---

## Phase 4: React Hooks ✅ COMPLETED

- [x] Create `src/hooks/use-generation.ts`:
  - `currentGeneration` state
  - `currentHistory` state
  - `isGenerating`, `isRefining` loading states
  - `generate(options)` function
  - `refine(instruction, imageId?)` function
  - `loadGeneration(id)` function
  - `loadGenerations(page)` function
  - `deleteGeneration(id)` function

- [x] Create `src/hooks/use-avatars.ts`:
  - `avatars` state
  - `isLoading` state
  - `createAvatar(data, file)` function
  - `updateAvatar(id, data)` function
  - `deleteAvatar(id)` function

- [x] Create `src/hooks/use-presets.ts`:
  - `presets` state
  - `isLoading` state
  - `createPreset(data)` function
  - `updatePreset(id, data)` function
  - `deletePreset(id)` function

- [x] Create `src/hooks/use-gallery.ts`:
  - `images` state (paginated)
  - `loadMore()` function
  - `toggleLike(imageId)` function
  - `isLiked(imageId)` function

- [x] Create `src/hooks/use-api-key.ts`:
  - `hasApiKey` state
  - `keyHint` state
  - `saveApiKey(key)` function
  - `removeApiKey()` function

---

## Phase 5: UI Components ✅ COMPLETED

### Create Component Directory

- [x] Create `src/components/generate/` directory
- [x] Create `src/components/generate/index.ts` barrel export

### Prompt Builder Components

- [x] Create `src/components/generate/prompt-builder.tsx`:
  - Text input for prompt
  - Resolution selector (1K/2K/4K dropdown)
  - Aspect ratio selector (buttons or dropdown)
  - Image count slider (1-4)
  - Avatar multi-select
  - Preset dropdown with save button
  - Generate button with token count display

- [x] Create `src/components/generate/generation-output.tsx`:
  - Image grid display (responsive)
  - Loading skeleton during generation
  - Download button per image
  - Share to gallery toggle per image
  - Copy prompt button

- [x] Create `src/components/generate/refinement-panel.tsx`:
  - Conversation history display
  - Image selection for targeted refinement
  - Refinement text input
  - Submit button

### Management Components

- [x] Create `src/components/generate/avatar-manager.tsx`:
  - Avatar grid with thumbnails
  - Upload dialog (drag & drop)
  - Name and type inputs
  - Edit/delete actions

- [x] Create `src/components/generate/preset-manager.tsx`:
  - Preset list/dropdown
  - Save current settings button
  - Load preset action
  - Delete preset action

### Gallery Components

- [x] Create `src/components/generate/image-gallery.tsx`:
  - Masonry or grid layout
  - Like button with count
  - Image modal/lightbox on click
  - Infinite scroll or pagination

### Settings Components

- [x] Create `src/components/generate/api-key-manager.tsx`:
  - Key status indicator (has key / no key)
  - Input field to add key
  - Validation feedback
  - Delete key button with confirmation

- [x] Create `src/components/generate/token-usage-card.tsx`:
  - Progress bar (used/limit)
  - Text showing "X of Y generations used"
  - Tier name display
  - Upgrade CTA when near limit

---

## Phase 6: Pages & Routes ✅ COMPLETED

### Dashboard Page

- [x] Create `src/app/dashboard/ai-tools/image-generator/page.tsx`:
  - Tab layout: Generate | Avatars | Presets | History | Settings
  - Generate tab: PromptBuilder + GenerationOutput + RefinementPanel
  - Avatars tab: AvatarManager
  - Presets tab: PresetManager
  - History tab: List of past generations
  - Settings tab: ApiKeyManager + TokenUsageCard

### Standalone Page

- [x] Create `src/app/generate/page.tsx`:
  - Hero section with feature highlights
  - For unauthenticated: Demo/preview + sign-in CTA
  - For authenticated: Full PromptBuilder interface
  - Featured gallery section below

- [x] Create `src/app/generate/generate-client.tsx`:
  - Client component for authenticated/unauthenticated states
  - Uses default site layout (no custom layout needed)

### Gallery Page

- [x] Create `src/app/gallery/page.tsx`:
  - ImageGallery component (full page)
  - Filter tabs: Recent | Popular
  - Hero section with description

---

## Phase 7: Navigation & Integration ✅ COMPLETED

### Update AI Tools Data

- [x] Add to `src/lib/data/ai-tools.ts`:
  ```typescript
  {
    id: "image-generator",
    name: "AI Image Generator",
    slug: "image-generator",
    description: "Create stunning AI-generated images...",
    shortDescription: "Generate professional images with AI",
    icon: "ImageIcon",
    tier: "free",
    features: [...],
    exampleInput: "...",
    exampleOutput: "..."
  }
  ```

### Update Navigation

- [x] Add "Generate" link to `src/components/site-header.tsx` navigation
- [x] Add "Generate" link to `src/components/layout/mobile-nav.tsx` navigation (added instead of gallery)
- [x] Gallery link skipped (optional) - accessible from /generate page

### Update Dynamic Route Handler

- [x] Modify `src/app/dashboard/ai-tools/[slug]/page.tsx`:
  - Add `ImageIcon` to icon map
  - Add redirect: if slug === "image-generator", redirect to dedicated `/dashboard/ai-tools/image-generator` page

---

## Phase 8: Polish & Refinement ✅ COMPLETED

### Error Handling

- [x] Add error boundaries to generation components
- [x] Add toast notifications for success/error states
- [x] Add retry logic for failed generations
- [x] Handle API rate limits gracefully

### UX Improvements

- [x] Add loading states for all async operations
- [x] Add keyboard shortcuts (Ctrl+Enter to generate)
- [x] Add image lightbox/modal for full-size view
- [x] Add copy-to-clipboard for prompts and image URLs

### Mobile Responsiveness

- [x] Ensure PromptBuilder works on mobile
- [x] Ensure Gallery is touch-friendly
- [x] Test on various screen sizes

### Performance

- [x] Add image lazy loading in gallery
- [x] Optimize avatar thumbnails
- [x] Add pagination to history lists

---

## File Summary

### New Files to Create

| Path | Purpose |
|------|---------|
| `src/lib/encryption.ts` | AES-256-GCM encryption utilities |
| `src/lib/gemini.ts` | Google Gemini API integration |
| `src/lib/services/token-system.ts` | Token usage management |
| `src/lib/types/image-generation.ts` | TypeScript interfaces |
| `src/app/api/generate/route.ts` | Main generation endpoint |
| `src/app/api/generate/[id]/route.ts` | Generation CRUD |
| `src/app/api/generate/[id]/refine/route.ts` | Refinement endpoint |
| `src/app/api/avatars/route.ts` | Avatar list/create |
| `src/app/api/avatars/[id]/route.ts` | Avatar CRUD |
| `src/app/api/presets/route.ts` | Preset list/create |
| `src/app/api/presets/[id]/route.ts` | Preset CRUD |
| `src/app/api/gallery/route.ts` | Public gallery |
| `src/app/api/gallery/[id]/like/route.ts` | Like/unlike |
| `src/app/api/user/api-key/route.ts` | BYOK management |
| `src/hooks/use-generation.ts` | Generation hook |
| `src/hooks/use-avatars.ts` | Avatars hook |
| `src/hooks/use-presets.ts` | Presets hook |
| `src/hooks/use-gallery.ts` | Gallery hook |
| `src/hooks/use-api-key.ts` | API key hook |
| `src/components/generate/*.tsx` | 8 UI components |
| `src/app/dashboard/ai-tools/image-generator/page.tsx` | Dashboard page |
| `src/app/generate/page.tsx` | Standalone page |
| `src/app/gallery/page.tsx` | Gallery page |

### Files to Modify

| Path | Changes |
|------|---------|
| `src/lib/schema.ts` | Add 8 new tables + enums |
| `src/lib/services/blob-storage.ts` | Add 2 new functions |
| `src/lib/data/ai-tools.ts` | Add image-generator tool |
| `src/components/site-header.tsx` | Add Generate link |
| `src/app/dashboard/ai-tools/[slug]/page.tsx` | Handle image-generator slug |
| `.env` | Add new environment variables |
| `env.example` | Document new variables |
