import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { blogPost } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { generateExcerpt, stripHtml } from "@/lib/blog/mdx";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/blog/posts/[id]/publish
 * Publish a blog post - writes MDX file and updates status (admin only)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Get the post
    const [post] = await db.select().from(blogPost).where(eq(blogPost.id, id));

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Validate required fields for publishing
    const errors: string[] = [];

    if (!post.title || post.title.trim() === "") {
      errors.push("Title is required");
    }

    if (!post.content || post.content.trim() === "") {
      errors.push("Content is required");
    }

    if (!post.featuredImageUrl) {
      errors.push("Featured image is required");
    }

    if (!post.featuredImageAlt) {
      errors.push("Featured image alt text is required");
    }

    if (!post.categoryId) {
      errors.push("Category is required");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", details: errors },
        { status: 400 }
      );
    }

    // Generate excerpt if not provided
    const excerpt =
      post.excerpt || generateExcerpt(stripHtml(post.content), 160);

    // Set published date
    const publishedAt = post.publishedAt || new Date();

    // Build frontmatter
    const frontmatter = [
      "---",
      `title: "${escapeYaml(post.title)}"`,
      `slug: "${post.slug}"`,
      `excerpt: "${escapeYaml(excerpt)}"`,
      `categoryId: "${post.categoryId}"`,
      `featuredImage: "${post.featuredImageUrl}"`,
      `featuredImageAlt: "${escapeYaml(post.featuredImageAlt || "")}"`,
      `authorName: "${escapeYaml(post.authorName)}"`,
      post.authorImage ? `authorImage: "${post.authorImage}"` : null,
      `publishedAt: "${publishedAt.toISOString()}"`,
      post.featuredBusinessSlugs && post.featuredBusinessSlugs.length > 0
        ? `featuredBusinessSlugs:\n${post.featuredBusinessSlugs.map((s) => `  - "${s}"`).join("\n")}`
        : null,
      post.metaTitle ? `metaTitle: "${escapeYaml(post.metaTitle)}"` : null,
      post.metaDescription
        ? `metaDescription: "${escapeYaml(post.metaDescription)}"`
        : null,
      "---",
    ]
      .filter(Boolean)
      .join("\n");

    // Convert HTML content to MDX-compatible format
    // For now, we'll store the HTML content as-is since MDX can render HTML
    const mdxContent = `${frontmatter}\n\n${post.content}`;

    // Ensure content directory exists
    const contentDir = path.join(process.cwd(), "content", "blog");
    if (!existsSync(contentDir)) {
      await mkdir(contentDir, { recursive: true });
    }

    // Write MDX file
    const mdxPath = path.join(contentDir, `${post.slug}.mdx`);
    await writeFile(mdxPath, mdxContent, "utf-8");

    // Update database status
    const [updatedPost] = await db
      .update(blogPost)
      .set({
        status: "published",
        publishedAt,
        excerpt,
      })
      .where(eq(blogPost.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      post: updatedPost,
      mdxPath: `content/blog/${post.slug}.mdx`,
    });
  } catch (error) {
    console.error("Publish blog post error:", error);
    return NextResponse.json(
      { error: "Failed to publish blog post" },
      { status: 500 }
    );
  }
}

/**
 * Escape special characters for YAML strings
 */
function escapeYaml(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}
