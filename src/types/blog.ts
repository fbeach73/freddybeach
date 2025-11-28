// FreddyBeach.com - Blog System Types

import type { Category } from "@/lib/types";

// Blog post status
export type BlogPostStatus = "draft" | "published" | "archived";

// Author information (currently hardcoded, but typed for flexibility)
export interface BlogAuthor {
  name: string;
  image?: string;
  bio?: string;
}

// Frontmatter for MDX files
export interface BlogFrontmatter {
  title: string;
  slug: string;
  excerpt: string;
  categoryId: string;
  featuredImage: string;
  featuredImageAlt: string;
  authorName: string;
  authorImage?: string;
  publishedAt: string; // ISO date string
  featuredBusinessSlugs?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

// Full blog post (used for rendering)
export interface BlogPost {
  // Core fields
  id: string;
  title: string;
  slug: string;
  content: string; // MDX or HTML content
  excerpt: string;
  // Category
  categoryId: string;
  category?: Category;
  // Images
  featuredImage: string;
  featuredImageAlt: string;
  // Author
  author: BlogAuthor;
  // Dates
  publishedAt: Date;
  updatedAt?: Date;
  // Computed fields
  readingTime: number; // minutes
  // Optional business links for sidebar
  featuredBusinessSlugs?: string[];
  // SEO
  metaTitle?: string;
  metaDescription?: string;
}

// Blog post from database (draft state)
export interface BlogPostDraft {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML from editor
  excerpt?: string;
  categoryId?: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  authorName: string;
  authorImage?: string;
  status: BlogPostStatus;
  featuredBusinessSlugs?: string[];
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Blog post card (for list views)
export interface BlogPostCard {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  featuredImageAlt: string;
  categoryId: string;
  categoryName?: string;
  authorName: string;
  publishedAt: Date;
  readingTime: number;
}

// Blog image (for media library)
export interface BlogImage {
  id: string;
  url: string;
  filename: string;
  altText: string;
  blogPostId?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  createdAt: Date;
}

// Table of contents item (for blog post sidebar)
export interface TOCItem {
  id: string;
  text: string;
  level: number; // h2 = 2, h3 = 3, etc.
}

// Blog listing page filters
export interface BlogFilters {
  category?: string;
  page?: number;
  limit?: number;
}

// Blog listing response
export interface BlogListResponse {
  posts: BlogPostCard[];
  totalCount: number;
  page: number;
  totalPages: number;
}

// SEO analysis result (for AI features - Phase 6)
export interface SEOAnalysis {
  score: number; // 0-100
  keywords: { keyword: string; count: number; density: number }[];
  headings: { level: number; text: string }[];
  entities: { name: string; type: string; businessSlug?: string }[];
  suggestions: string[];
  linkOpportunities: { businessName: string; slug: string; reason: string }[];
}
