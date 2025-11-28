# Blog System Implementation Plan

## File Structure Overview

```
/content/blog/                          # Published MDX files
  example-post.mdx

/src/app/
  /blog/
    page.tsx                            # Blog listing (/blog)
    layout.tsx                          # Blog layout
    /[slug]/page.tsx                    # Individual post (/blog/[slug])
  /api/blog/
    /og/[slug]/route.tsx                # OG image generation
    /analyze/route.ts                   # AI SEO analysis
    /rewrite/route.ts                   # AI rewrite
    /images/route.ts                    # Image upload/list
    /images/[id]/route.ts               # Delete image
    /posts/route.ts                     # CRUD for drafts
    /posts/[id]/route.ts                # Single post operations
    /posts/[id]/publish/route.ts        # Publish to MDX
  /admin/
    /blog/
      page.tsx                          # Post list/management
      /new/page.tsx                     # Create new post
      /[id]/page.tsx                    # Edit post
    /blog-optimizer/page.tsx            # SEO analysis tool

/src/components/blog/
  blog-card.tsx
  blog-grid.tsx
  blog-post-header.tsx
  blog-content.tsx
  blog-sidebar.tsx
  related-posts.tsx
  reading-time-badge.tsx
  share-buttons.tsx
  table-of-contents.tsx
  mdx-components.tsx

/src/components/admin/blog/
  post-editor.tsx
  post-form.tsx
  seo-analyzer.tsx
  ai-rewrite-panel.tsx
  media-library.tsx
  image-upload.tsx

/src/lib/blog/
  mdx.ts
  reading-time.ts
  auto-link.ts
  get-posts.ts
  categories.ts
  author.ts

/src/lib/seo/
  json-ld.ts
  meta.ts

/src/types/blog.ts
```

---

## Phase 1: Foundation ✅

### Database & Types
- [x] Add `blogPost` table to `src/lib/schema.ts`
- [x] Add `blogImage` table to `src/lib/schema.ts`
- [x] Run `pnpm db:generate` to create migration
- [x] Run `pnpm db:migrate` to apply migration
- [x] Create `src/types/blog.ts` with TypeScript interfaces

### Dependencies
- [x] Install packages: `pnpm add next-mdx-remote @vercel/og reading-time gray-matter rehype-slug rehype-autolink-headings remark-gfm`
- [x] Install editor packages: `pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder`

### Content Directory
- [x] Create `/content/blog/` directory
- [x] Add to `.gitignore` if needed (or keep for version control)

### Core Utilities
- [x] Create `src/lib/blog/author.ts` - hardcoded author config
- [x] Create `src/lib/blog/categories.ts` - reuse directory categories
- [x] Create `src/lib/blog/reading-time.ts` - calculate reading time
- [x] Create `src/lib/blog/mdx.ts` - MDX compilation utilities
- [x] Create `src/lib/blog/get-posts.ts` - fetch posts from MDX files and DB

---

## Phase 2: Public Blog Pages ✅

### Blog Listing Page
- [x] Create `src/app/blog/layout.tsx` - blog layout wrapper
- [x] Create `src/app/blog/page.tsx` - listing page with grid
- [x] Create `src/components/blog/blog-card.tsx` - post card component
- [x] Create `src/components/blog/blog-grid.tsx` - responsive grid layout
- [x] Create `src/components/blog/reading-time-badge.tsx` - reading time display
- [x] Add `generateMetadata()` for SEO

### Individual Post Page
- [x] Create `src/app/blog/[slug]/page.tsx` - post page
- [x] Create `src/components/blog/blog-post-header.tsx` - title, author, date
- [x] Create `src/components/blog/blog-content.tsx` - MDX renderer
- [x] Create `src/components/blog/table-of-contents.tsx` - TOC from headings
- [x] Create `src/components/blog/share-buttons.tsx` - social sharing
- [x] Add `generateMetadata()` for dynamic SEO
- [x] Add `generateStaticParams()` for static generation

---

## Phase 3: SEO Implementation ✅

### Schema.org JSON-LD
- [x] Create `src/lib/seo/json-ld.ts` - schema generators
- [x] Implement `generateArticleSchema()` function
- [x] Implement `generateBreadcrumbSchema()` function
- [x] Add JSON-LD script to blog post page

### Open Graph Images
- [x] Create `src/app/api/blog/og/[slug]/route.tsx` - OG image endpoint
- [x] Design OG image layout (title, category, branding)
- [x] Wire OG image URL to `generateMetadata()` openGraph.images

### Meta Utilities
- [x] Create `src/lib/seo/meta.ts` - meta description helpers
- [x] Implement auto-excerpt generation from content

---

## Phase 4: Admin Blog Management ✅

### Admin Navigation
- [x] Add "Blog" section to `src/components/admin/admin-sidebar.tsx`
- [x] Add nav items: Posts, New Post, Blog Optimizer

### Post List Page
- [x] Create `src/app/admin/blog/page.tsx` - post management list
- [x] Create table with columns: title, category, status, date, actions
- [x] Add status filter (draft/published/archived)
- [x] Implement delete functionality with confirmation

### Post API Routes
- [x] Create `src/app/api/blog/posts/route.ts` - GET (list), POST (create)
- [x] Create `src/app/api/blog/posts/[id]/route.ts` - GET, PUT, DELETE
- [x] Create `src/app/api/blog/posts/[id]/publish/route.ts` - publish to MDX

### Post Editor
- [x] Create `src/app/admin/blog/new/page.tsx` - new post page
- [x] Create `src/app/admin/blog/[id]/page.tsx` - edit post page
- [x] Create `src/components/admin/blog/post-editor.tsx` - Tiptap editor
- [x] Create `src/components/admin/blog/post-form.tsx` - metadata form
- [x] Implement auto-slug generation from title
- [x] Add featured image upload with alt text requirement
- [x] Implement Save Draft functionality
- [x] Implement Preview functionality
- [x] Implement Publish workflow (writes MDX file)

---

## Phase 5: Image Management System ✅

### Blob Storage Service
- [x] Create `src/lib/services/blog-storage.ts` - blog image upload functions
- [x] Implement `uploadBlogImage()` - upload to Vercel Blob
- [x] Implement `deleteBlogImage()` - remove from Blob and DB
- [x] Implement `listBlogImages()` - query with filters

### Image API Routes
- [x] Create `src/app/api/blog/images/route.ts` - POST (upload), GET (list)
- [x] Create `src/app/api/blog/images/[id]/route.ts` - DELETE
- [x] Validate file type (jpg, png, gif, webp)
- [x] Validate file size (max 5MB)
- [x] Require alt text on upload

### Media Library UI
- [x] Create `src/components/admin/blog/media-library.tsx` - image grid
- [x] Create `src/components/admin/blog/image-upload.tsx` - drag-drop upload
- [x] Implement alt text modal before upload completes
- [x] Add search by filename
- [x] Add date filter
- [x] Add click-to-copy markdown functionality
- [x] Add delete with confirmation

### Editor Integration
- [x] Add image button to Tiptap toolbar
- [x] Implement drag-drop in editor (triggers upload modal)
- [x] Add "Insert from Media Library" button

---

## Phase 6: AI SEO Features ✅

### Analysis API
- [x] Create `src/app/api/blog/analyze/route.ts` - AI analysis endpoint
- [x] Define Zod schema for structured analysis output
- [x] Implement OpenRouter integration with system prompt
- [x] Fetch business names for entity recognition
- [x] Return: score, keywords, headings, entities, links, suggestions

### Rewrite API
- [x] Create `src/app/api/blog/rewrite/route.ts` - AI rewrite endpoint
- [x] Accept content + analysis + optional instructions
- [x] Return rewritten content + change summary
- [x] Use OpenRouter with SEO optimization prompt

### Blog Optimizer Page
- [x] Create `src/app/admin/blog-optimizer/page.tsx` - main page
- [x] Implement tabs: Content Input, Analysis, AI Rewrite, Media Library
- [x] Create `src/components/admin/blog/seo-analyzer.tsx` - analysis display
  - [x] Score gauge/progress bar
  - [x] Keyword density table
  - [x] Heading structure visualization
  - [x] Entity mentions list with business links
  - [x] Linking suggestions with reasons
- [x] Create `src/components/admin/blog/ai-rewrite-panel.tsx` - rewrite UI
  - [x] Side-by-side diff view
  - [x] Changes summary list
  - [x] Apply/Reject buttons

---

## Phase 7: Auto-Linking & Related Content ✅

### Auto-Linking System
- [x] Create `src/lib/blog/auto-link.ts` - business name detection
- [x] Implement `buildBusinessIndex()` - fetch published businesses
- [x] Implement `generateAliases()` - create name variations
- [x] Implement `autoLinkContent()` - replace names with links
- [x] Add 5-link maximum limit
- [x] Create `src/components/blog/mdx-components.tsx` - custom MDX components
- [x] Integrate auto-linking into MDX compilation

### Related Posts
- [x] Implement `getRelatedPosts()` in `src/lib/blog/get-posts.ts`
- [x] Query same category, exclude current, limit 3
- [x] Create `src/components/blog/related-posts.tsx` - related posts section

### Featured Businesses Sidebar
- [x] Create `src/components/blog/blog-sidebar.tsx` - sidebar wrapper
- [x] Create `src/components/blog/featured-business-card.tsx` - business card
- [x] Implement logic: use frontmatter slugs or auto-select featured
- [x] Add to blog post page layout

---

## Phase 8: Polish & Finalization ✅

### Loading States
- [x] Add `src/app/blog/loading.tsx` - listing skeleton
- [x] Add `src/app/blog/[slug]/loading.tsx` - post skeleton
- [x] Add loading states to admin pages

### Error Handling
- [x] Add `src/app/blog/[slug]/not-found.tsx` - 404 page
- [x] Add error boundaries to admin pages
- [x] Handle API errors gracefully in UI

### Validation & Quality
- [x] Run `pnpm lint` and fix issues
- [x] Run `pnpm typecheck` and fix issues
- [x] Test all public pages render correctly
- [x] Test admin CRUD operations
- [x] Test image upload flow
- [x] Test AI analysis and rewrite
- [x] Test publish workflow (DB to MDX)

### Sample Content
- [x] Create 1-2 sample blog posts in `/content/blog/`
- [x] Verify auto-linking works with real business names
- [x] Verify OG images generate correctly
- [x] Verify Schema.org markup with Google Rich Results Test

---

## Critical Files to Modify

| File | Change |
|------|--------|
| `src/lib/schema.ts` | Add `blogPost` and `blogImage` tables |
| `src/components/admin/admin-sidebar.tsx` | Add Blog and Blog Optimizer nav items |

## Critical Files to Reference

| File | Reason |
|------|--------|
| `src/lib/schema.ts` | Drizzle schema patterns |
| `src/lib/services/blob-storage.ts` | Blob upload patterns |
| `src/app/api/chat/route.ts` | OpenRouter AI integration |
| `src/lib/data/businesses-db.ts` | Database query patterns |
| `src/lib/data/categories.ts` | Category definitions |
| `src/app/[category]/[slug]/page.tsx` | Dynamic route + metadata patterns |

---

## Dependencies Summary

```bash
# MDX & Content
pnpm add next-mdx-remote reading-time gray-matter

# MDX Plugins
pnpm add rehype-slug rehype-autolink-headings remark-gfm

# OG Images
pnpm add @vercel/og

# Rich Text Editor
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
```
