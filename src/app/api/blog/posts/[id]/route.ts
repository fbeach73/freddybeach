import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { blogPost } from "@/lib/schema";
import { eq, and, ne } from "drizzle-orm";
import { slugify } from "@/lib/blog/mdx";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/blog/posts/[id]
 * Get a single blog post by ID (admin only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const [post] = await db
      .select()
      .from(blogPost)
      .where(eq(blogPost.id, id));

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Get blog post error:", error);
    return NextResponse.json(
      { error: "Failed to get blog post" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/blog/posts/[id]
 * Update a blog post (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify post exists
    const [existing] = await db
      .select({ id: blogPost.id })
      .from(blogPost)
      .where(eq(blogPost.id, id));

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Build update data
    const updateData: Partial<{
      title: string;
      slug: string;
      content: string;
      excerpt: string | null;
      categoryId: string | null;
      featuredImageUrl: string | null;
      featuredImageAlt: string | null;
      metaTitle: string | null;
      metaDescription: string | null;
      authorName: string;
      authorImage: string | null;
      featuredBusinessSlugs: string[] | null;
      status: "draft" | "published" | "archived";
    }> = {};

    if (body.title !== undefined) {
      updateData.title = body.title.trim();
    }

    if (body.slug !== undefined) {
      const newSlug = slugify(body.slug);

      // Check for duplicate slug (excluding current post)
      const [duplicate] = await db
        .select({ id: blogPost.id })
        .from(blogPost)
        .where(and(eq(blogPost.slug, newSlug), ne(blogPost.id, id)));

      if (duplicate) {
        return NextResponse.json(
          { error: "A post with this slug already exists" },
          { status: 400 }
        );
      }

      updateData.slug = newSlug;
    }

    if (body.content !== undefined) updateData.content = body.content;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt || null;
    if (body.categoryId !== undefined)
      updateData.categoryId = body.categoryId || null;
    if (body.featuredImageUrl !== undefined)
      updateData.featuredImageUrl = body.featuredImageUrl || null;
    if (body.featuredImageAlt !== undefined)
      updateData.featuredImageAlt = body.featuredImageAlt || null;
    if (body.metaTitle !== undefined)
      updateData.metaTitle = body.metaTitle || null;
    if (body.metaDescription !== undefined)
      updateData.metaDescription = body.metaDescription || null;
    if (body.authorName !== undefined) updateData.authorName = body.authorName;
    if (body.authorImage !== undefined)
      updateData.authorImage = body.authorImage || null;
    if (body.featuredBusinessSlugs !== undefined)
      updateData.featuredBusinessSlugs = body.featuredBusinessSlugs || null;
    if (body.status !== undefined) updateData.status = body.status;

    // Update the post
    const [updatedPost] = await db
      .update(blogPost)
      .set(updateData)
      .where(eq(blogPost.id, id))
      .returning();

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Update blog post error:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/posts/[id]
 * Delete a blog post (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Verify post exists
    const [existing] = await db
      .select({ id: blogPost.id, slug: blogPost.slug })
      .from(blogPost)
      .where(eq(blogPost.id, id));

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Delete the post
    await db.delete(blogPost).where(eq(blogPost.id, id));

    // Note: MDX file deletion would be handled separately if needed
    // For now, we just delete from database

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete blog post error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
