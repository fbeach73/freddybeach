# AI Image Generator - Requirements

## Overview

Integrate the Nano Banana AI Image Generation feature from [leonvanzyl/nano-banana-pro-prompt-generator](https://github.com/leonvanzyl/nano-banana-pro-prompt-generator) into the FreddyBeach Directory project.

## Source Repository

- **GitHub**: https://github.com/leonvanzyl/nano-banana-pro-prompt-generator
- **Tech Stack**: Next.js 16, React 19, Better Auth, Drizzle ORM, PostgreSQL, shadcn/ui, Vercel Blob
- **AI Provider**: Google Gemini via `@google/genai` SDK

## Feature Requirements

### 1. Full Feature Integration

Import all core features from Nano Banana:
- **Prompt Builder**: Structured UI for creating detailed image prompts
- **Avatar System**: Upload reference images for consistent character/object generation
- **Presets**: Save and load prompt configurations
- **Multi-turn Refinement**: Iterative improvements via conversation with AI
- **Public Gallery**: Share generated images with like functionality

### 2. Dual Location Access

The image generator should be accessible from two locations:
- **Dashboard**: `/dashboard/ai-tools/image-generator` - Full tool within the AI tools section
- **Standalone**: `/generate` - Public showcase page with full generator for authenticated users
- **Gallery**: `/gallery` - Public gallery of shared images

### 3. Hybrid API Key System

Support two authentication methods for Google Gemini API:
- **Token-Based**: Users without their own API key can use app-provided tokens with monthly limits
  - Free tier: 10 generations/month
  - Enhanced tier: 50 generations/month
  - Featured tier: 200 generations/month
- **BYOK (Bring Your Own Key)**: Users can store their own encrypted Google GenAI API key for unlimited generations

## Technical Requirements

### Database Schema

New tables required:
1. `userApiKey` - Encrypted storage for BYOK keys
2. `avatar` - Reference images for generation
3. `preset` - Saved prompt configurations
4. `generation` - Generation session records
5. `generatedImage` - Individual generated images
6. `generationHistory` - Multi-turn conversation logs
7. `imageLike` - Gallery social engagement
8. `userTokenUsage` - Monthly token tracking

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/generate` | Image generation |
| `/api/generate/[id]` | Get/delete generation |
| `/api/generate/[id]/refine` | Multi-turn refinement |
| `/api/avatars` | Avatar CRUD |
| `/api/presets` | Preset CRUD |
| `/api/gallery` | Public gallery |
| `/api/gallery/[id]/like` | Like/unlike |
| `/api/user/api-key` | BYOK management |

### Security Requirements

- API keys encrypted with AES-256-GCM before storage
- All generation endpoints require authenticated session
- Token usage tracked and enforced server-side
- File uploads validated for size and MIME type

### Dependencies

New dependency to add:
- `@google/genai` - Google Generative AI SDK

Existing dependencies already available:
- `@vercel/blob` - Image storage
- `zod` - Validation
- `nanoid` - ID generation
- shadcn/ui components

### Environment Variables

```bash
GOOGLE_GENAI_API_KEY=        # App-provided key for token system
ENCRYPTION_KEY=              # 32-byte key for API key encryption
FREE_TIER_IMAGE_TOKENS=10
ENHANCED_TIER_IMAGE_TOKENS=50
FEATURED_TIER_IMAGE_TOKENS=200
```

## User Stories

1. As a user, I want to generate AI images using a simple prompt builder interface
2. As a user, I want to upload avatar reference images for consistent character generation
3. As a user, I want to save my prompt configurations as presets for reuse
4. As a user, I want to refine my generated images through conversation
5. As a user, I want to share my best images to a public gallery
6. As a user, I want to like images in the gallery
7. As a user, I want to use my own Google API key for unlimited generations
8. As a free user, I want to generate images within my monthly token limit
9. As a user, I want to see my token usage and remaining balance
