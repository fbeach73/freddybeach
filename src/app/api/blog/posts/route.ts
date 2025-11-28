import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { blogPost } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { slugify } from "@/lib/blog/mdx";

/**
 * GET /api/blog/posts
 * List all blog posts (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build query based on status filter
    const whereClause = status
      ? eq(blogPost.status, status as "draft" | "published" | "archived")
      : undefined;

    const posts = await db
      .select()
      .from(blogPost)
      .where(whereClause)
      .orderBy(desc(blogPost.updatedAt));

    return NextResponse.json(posts);
  } catch (error) {
    console.error("List blog posts error:", error);
    return NextResponse.json(
      { error: "Failed to list blog posts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog/posts
 * Create a new blog post (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || body.title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const slug = body.slug
      ? slugify(body.slug)
      : slugify(body.title);

    // Check for duplicate slug
    const [existing] = await db
      .select({ id: blogPost.id })
      .from(blogPost)
      .where(eq(blogPost.slug, slug));

    if (existing) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 400 }
      );
    }

    // Create the blog post
    const [newPost] = await db
      .insert(blogPost)
      .values({
        id: nanoid(),
        title: body.title.trim(),
        slug,
        content: body.content || "",
        excerpt: body.excerpt || null,
        categoryId: body.categoryId || null,
        featuredImageUrl: body.featuredImageUrl || null,
        featuredImageAlt: body.featuredImageAlt || null,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        authorName: body.authorName || "FreddyBeach Team",
        authorImage: body.authorImage || null,
        featuredBusinessSlugs: body.featuredBusinessSlugs || null,
        status: "draft",
      })
      .returning();

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Create blog post error:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
