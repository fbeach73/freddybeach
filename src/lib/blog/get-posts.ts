// Blog Post Fetching Utilities

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { db } from "@/lib/db";
import { blogPost } from "@/lib/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { calculateReadingTime } from "./reading-time";
import { getCategoryById } from "./categories";
import { getAuthor } from "./author";
import type {
  BlogPost,
  BlogPostCard,
  BlogPostDraft,
  BlogFrontmatter,
  BlogFilters,
  BlogListResponse,
} from "@/types/blog";

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");
const DEFAULT_PAGE_SIZE = 12;

/**
 * Get all published blog posts from MDX files
 * Returns posts sorted by date (newest first)
 */
export async function getAllPosts(): Promise<BlogPostCard[]> {
  const posts: BlogPostCard[] = [];

  // Check if directory exists
  if (!fs.existsSync(CONTENT_DIR)) {
    return posts;
  }

  const files = fs.readdirSync(CONTENT_DIR);
  const mdxFiles = files.filter((file) => file.endsWith(".mdx"));

  for (const file of mdxFiles) {
    const filePath = path.join(CONTENT_DIR, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);
    const frontmatter = data as BlogFrontmatter;

    // Skip if no published date (draft)
    if (!frontmatter.publishedAt) {
      continue;
    }

    const readingTime = calculateReadingTime(fileContent);
    const category = getCategoryById(frontmatter.categoryId);

    posts.push({
      slug: frontmatter.slug,
      title: frontmatter.title,
      excerpt: frontmatter.excerpt,
      featuredImage: frontmatter.featuredImage,
      featuredImageAlt: frontmatter.featuredImageAlt,
      categoryId: frontmatter.categoryId,
      categoryName: category?.name,
      authorName: frontmatter.authorName,
      publishedAt: new Date(frontmatter.publishedAt),
      readingTime,
    });
  }

  // Sort by published date (newest first)
  posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return posts;
}

/**
 * Get paginated blog posts with optional filters
 */
export async function getPosts(filters: BlogFilters = {}): Promise<BlogListResponse> {
  const { category, page = 1, limit = DEFAULT_PAGE_SIZE } = filters;

  let posts = await getAllPosts();

  // Apply category filter
  if (category) {
    posts = posts.filter((post) => post.categoryId === category);
  }

  const totalCount = posts.length;
  const totalPages = Math.ceil(totalCount / limit);

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const paginatedPosts = posts.slice(startIndex, startIndex + limit);

  return {
    posts: paginatedPosts,
    totalCount,
    page,
    totalPages,
  };
}

/**
 * Get a single blog post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const frontmatter = data as BlogFrontmatter;

  const readingTime = calculateReadingTime(content);
  const category = getCategoryById(frontmatter.categoryId);
  const author = getAuthor(frontmatter.authorName);

  return {
    id: slug,
    title: frontmatter.title,
    slug: frontmatter.slug,
    content,
    excerpt: frontmatter.excerpt,
    categoryId: frontmatter.categoryId,
    category: category ?? undefined,
    featuredImage: frontmatter.featuredImage,
    featuredImageAlt: frontmatter.featuredImageAlt,
    author,
    publishedAt: new Date(frontmatter.publishedAt),
    readingTime,
    featuredBusinessSlugs: frontmatter.featuredBusinessSlugs,
    metaTitle: frontmatter.metaTitle,
    metaDescription: frontmatter.metaDescription,
  };
}

/**
 * Get related posts (same category, excluding current post)
 */
export async function getRelatedPosts(
  currentSlug: string,
  categoryId: string,
  limit: number = 3
): Promise<BlogPostCard[]> {
  const allPosts = await getAllPosts();

  const relatedPosts = allPosts
    .filter((post) => post.slug !== currentSlug && post.categoryId === categoryId)
    .slice(0, limit);

  // If not enough posts in same category, fill with recent posts
  if (relatedPosts.length < limit) {
    const otherPosts = allPosts
      .filter(
        (post) =>
          post.slug !== currentSlug && !relatedPosts.some((rp) => rp.slug === post.slug)
      )
      .slice(0, limit - relatedPosts.length);

    relatedPosts.push(...otherPosts);
  }

  return relatedPosts;
}

/**
 * Get all post slugs for static generation
 */
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const files = fs.readdirSync(CONTENT_DIR);
  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(".mdx", ""));
}

// ============================================
// Draft Post Functions (Database Operations)
// ============================================

/**
 * Get all draft posts from database
 */
export async function getDraftPosts(
  status?: "draft" | "published" | "archived"
): Promise<BlogPostDraft[]> {
  const conditions = status ? [eq(blogPost.status, status)] : [];

  const posts = await db
    .select()
    .from(blogPost)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(blogPost.updatedAt));

  return posts.map(mapDbPostToDraft);
}

/**
 * Get a single draft post by ID
 */
export async function getDraftPostById(id: string): Promise<BlogPostDraft | null> {
  const [post] = await db.select().from(blogPost).where(eq(blogPost.id, id)).limit(1);

  if (!post) {
    return null;
  }

  return mapDbPostToDraft(post);
}

/**
 * Get a draft post by slug
 */
export async function getDraftPostBySlug(slug: string): Promise<BlogPostDraft | null> {
  const [post] = await db.select().from(blogPost).where(eq(blogPost.slug, slug)).limit(1);

  if (!post) {
    return null;
  }

  return mapDbPostToDraft(post);
}

/**
 * Create a new draft post
 */
export async function createDraftPost(
  data: Omit<BlogPostDraft, "id" | "createdAt" | "updatedAt" | "status">
): Promise<BlogPostDraft> {
  const id = crypto.randomUUID();

  const [post] = await db
    .insert(blogPost)
    .values({
      id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      categoryId: data.categoryId,
      featuredImageUrl: data.featuredImageUrl,
      featuredImageAlt: data.featuredImageAlt,
      authorName: data.authorName,
      authorImage: data.authorImage,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      featuredBusinessSlugs: data.featuredBusinessSlugs,
      status: "draft",
    })
    .returning();

  return mapDbPostToDraft(post);
}

/**
 * Update a draft post
 */
export async function updateDraftPost(
  id: string,
  data: Partial<Omit<BlogPostDraft, "id" | "createdAt" | "updatedAt">>
): Promise<BlogPostDraft | null> {
  const [post] = await db
    .update(blogPost)
    .set({
      ...(data.title && { title: data.title }),
      ...(data.slug && { slug: data.slug }),
      ...(data.content && { content: data.content }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.featuredImageUrl !== undefined && {
        featuredImageUrl: data.featuredImageUrl,
      }),
      ...(data.featuredImageAlt !== undefined && {
        featuredImageAlt: data.featuredImageAlt,
      }),
      ...(data.authorName && { authorName: data.authorName }),
      ...(data.authorImage !== undefined && { authorImage: data.authorImage }),
      ...(data.status && { status: data.status }),
      ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
      ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
      ...(data.featuredBusinessSlugs !== undefined && {
        featuredBusinessSlugs: data.featuredBusinessSlugs,
      }),
      ...(data.publishedAt !== undefined && { publishedAt: data.publishedAt }),
    })
    .where(eq(blogPost.id, id))
    .returning();

  if (!post) {
    return null;
  }

  return mapDbPostToDraft(post);
}

/**
 * Delete a draft post
 */
export async function deleteDraftPost(id: string): Promise<boolean> {
  const result = await db.delete(blogPost).where(eq(blogPost.id, id)).returning({ id: blogPost.id });
  return result.length > 0;
}

/**
 * Check if a slug is already in use
 */
export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  // Check database
  const conditions = excludeId
    ? and(eq(blogPost.slug, slug), sql`${blogPost.id} != ${excludeId}`)
    : eq(blogPost.slug, slug);

  const [existingPost] = await db.select({ id: blogPost.id }).from(blogPost).where(conditions).limit(1);

  if (existingPost) {
    return false;
  }

  // Check MDX files
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  return !fs.existsSync(filePath);
}

// Helper function to map database post to BlogPostDraft type
function mapDbPostToDraft(post: typeof blogPost.$inferSelect): BlogPostDraft {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt ?? undefined,
    categoryId: post.categoryId ?? undefined,
    featuredImageUrl: post.featuredImageUrl ?? undefined,
    featuredImageAlt: post.featuredImageAlt ?? undefined,
    authorName: post.authorName,
    authorImage: post.authorImage ?? undefined,
    status: post.status,
    featuredBusinessSlugs: post.featuredBusinessSlugs ?? undefined,
    metaTitle: post.metaTitle ?? undefined,
    metaDescription: post.metaDescription ?? undefined,
    publishedAt: post.publishedAt ?? undefined,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}
