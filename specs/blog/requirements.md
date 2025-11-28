# Blog System Requirements

## Overview

A comprehensive blog system for FreddyBeach Directory to drive SEO and position the site owner as a local business expert. The blog will serve as a lead magnet driving traffic to both the directory listings and consultation services.

## Key Decisions Made

- **Single author** - Author info hardcoded (no multi-author management needed)
- **Admin UI editor** - Create/edit drafts in `/admin/blog`, exports to MDX on publish
- **One-click AI rewrite** - Full post optimization with approval before saving
- **Categories only** - Matching existing directory categories (no tags)

---

## Functional Requirements

### FR-1: Public Blog Pages

#### FR-1.1: Blog Listing Page (`/blog`)
- Display all published blog posts in a responsive grid layout
- Show for each post: featured image, title, excerpt, category badge, reading time, publish date
- Pagination or infinite scroll for large post counts
- Filter by category (matching directory categories)

#### FR-1.2: Individual Blog Post Page (`/blog/[slug]`)
- Full article content rendered from MDX
- Post header with title, author info, publish date, updated date, reading time
- Featured image with Next.js Image optimization
- Table of contents (auto-generated from headings)
- Social share buttons
- Related posts section (3 posts from same category)
- Sidebar with featured local businesses relevant to post topic

### FR-2: SEO Requirements

#### FR-2.1: Schema.org Markup
- **Article schema** (JSON-LD) on each blog post with:
  - headline, description, image
  - author (Person), publisher (Organization)
  - datePublished, dateModified
  - mainEntityOfPage
- **BreadcrumbList schema** showing: Home > Blog > Post Title

#### FR-2.2: Meta Tags
- Auto-generated meta descriptions from post excerpt
- Dynamic `<title>` tags
- Canonical URLs

#### FR-2.3: Open Graph Images
- Auto-generated OG images (1200x630) using @vercel/og
- Display post title, category, site branding
- Serve from `/api/blog/og/[slug]`

### FR-3: Admin Blog Management

#### FR-3.1: Post List (`/admin/blog`)
- Table view of all posts (drafts and published)
- Columns: title, category, status, created date, actions
- Quick actions: Edit, Preview, Delete
- Filter by status (draft/published/archived)

#### FR-3.2: Post Editor (`/admin/blog/new` and `/admin/blog/[id]`)
- **Rich text editor** (Tiptap) with:
  - Heading levels (H1, H2, H3)
  - Bold, italic, strikethrough
  - Links (internal and external)
  - Inline images with drag-and-drop upload
  - Insert from media library
- **Metadata sidebar:**
  - Title input
  - Slug (auto-generated from title, editable)
  - Category dropdown (from directory categories)
  - Featured image upload with required alt text
  - Excerpt (auto-generated or manual override)
  - Publish date picker
- **Actions:** Save Draft, Preview, Publish

#### FR-3.3: Publish Workflow
- On publish:
  1. Validate all required fields
  2. Generate MDX file in `/content/blog/[slug].mdx`
  3. Update database status to "published"
  4. Set publishedAt timestamp

### FR-4: AI-Powered Blog Optimizer (`/admin/blog-optimizer`)

#### FR-4.1: Content Analysis
- Paste draft content into textarea
- AI analyzes and returns:
  - **Overall SEO score** (0-100)
  - **Keyword density** - primary/secondary keywords with counts and percentages
  - **Heading structure** - validate H1/H2/H3 hierarchy, flag issues
  - **Entity mentions** - detect business names from directory
  - **Internal linking opportunities** - suggest links to directory listings
  - **Meta description quality** - length and keyword presence
  - **Readability assessment**
  - **Semantic triples** - subject-predicate-object relationships for local SEO

#### FR-4.2: AI Rewrite
- One-click full content rewrite
- AI optimizes for:
  - Target keyword placement
  - Proper heading hierarchy
  - Natural business entity mentions
  - Local SEO signals
  - Semantic richness
- Side-by-side comparison: Original | Rewritten
- Summary of changes made
- "Apply Rewrite" button to accept changes

### FR-5: Auto-Linking System

#### FR-5.1: Business Name Detection
- On MDX compile, scan content for published business names
- Match exact names and common aliases (e.g., "Read's Cafe" and "Reads Cafe")
- Convert first occurrence of each business to internal link: `[Business Name](/category/business-slug)`

#### FR-5.2: Linking Limits
- Maximum 5 auto-linked businesses per post (avoid over-optimization)
- Only link to published/active businesses
- Skip if business already manually linked

### FR-6: Image Management

#### FR-6.1: Image Upload
- Drag-and-drop upload in editor
- Click-to-upload alternative
- **Required alt text** input before insertion (modal prompt)
- Upload to Vercel Blob: `blog/images/{nanoid}.{ext}`
- Store metadata in `blog_image` database table

#### FR-6.2: Media Library (`/admin/blog-optimizer` tab or modal)
- Grid view of all uploaded blog images
- Display: thumbnail, filename, upload date, alt text
- Search by filename
- Filter by date range
- Click image to copy markdown: `![alt](url)`
- Delete with confirmation (removes from Blob and database)

#### FR-6.3: Image Optimization
- Use Next.js Image component for automatic optimization
- Generate srcset for responsive images
- Lazy loading by default

### FR-7: Related Content

#### FR-7.1: Related Posts
- Show 3 posts from same category
- Exclude current post
- Order by publish date (newest first)

#### FR-7.2: Featured Businesses Sidebar
- If post has `relatedBusinessSlugs` in frontmatter, show those businesses
- Otherwise, auto-select 3 featured businesses from matching category
- Display: business card with image, name, short description, link

---

## Non-Functional Requirements

### NFR-1: Performance
- Blog listing page should load in < 2 seconds
- Individual posts statically generated at build time
- Images lazy-loaded and optimized

### NFR-2: SEO
- All pages must pass Google Lighthouse SEO audit (90+ score)
- Proper semantic HTML structure
- Mobile-friendly responsive design

### NFR-3: Accessibility
- All images must have alt text (enforced at upload)
- Proper heading hierarchy
- Keyboard navigation support

### NFR-4: Security
- Admin routes protected by requireAdmin() middleware
- Image uploads validated for file type and size
- Sanitize user input in editor

---

## Technical Specifications

### Content Storage
- **Drafts:** PostgreSQL database (`blog_post` table)
- **Published posts:** MDX files in `/content/blog/`
- **Images:** Vercel Blob storage

### MDX Frontmatter Schema
```yaml
title: string (required)
slug: string (required, unique)
description: string (required, for meta)
publishedAt: ISO date string (required)
updatedAt: ISO date string (optional)
category: string (required, matches directory category slug)
featuredImage: URL string (required)
featuredImageAlt: string (required)
relatedBusinessSlugs: string[] (optional)
status: "published" (always published in MDX files)
```

### Author Configuration
Hardcoded in `src/lib/blog/author.ts`:
```typescript
export const BLOG_AUTHOR = {
  name: "Kyle Sweezey",
  role: "Local Business Expert",
  image: "/images/kyle-sweezey.jpg",
  bio: "Helping Fredericton businesses thrive online.",
};
```

### Dependencies
- `next-mdx-remote` - MDX rendering
- `@vercel/og` - OG image generation
- `reading-time` - Calculate reading time
- `gray-matter` - Parse MDX frontmatter
- `rehype-slug` - Add IDs to headings
- `rehype-autolink-headings` - Linkable headings
- `remark-gfm` - GitHub Flavored Markdown
- `@tiptap/react` + extensions - Rich text editor
