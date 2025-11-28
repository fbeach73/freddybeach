import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { blogPost } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { PostForm } from "@/components/admin/blog/post-form";
import type { Metadata } from "next";
import type { BlogPostDraft } from "@/types/blog";

export const metadata: Metadata = {
  title: "Edit Blog Post | Admin",
  description: "Edit an existing blog post",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const { id } = await params;

  // Fetch the post from database
  const [post] = await db
    .select()
    .from(blogPost)
    .where(eq(blogPost.id, id));

  if (!post) {
    notFound();
  }

  // Convert to BlogPostDraft type
  const postDraft: BlogPostDraft = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt || undefined,
    categoryId: post.categoryId || undefined,
    featuredImageUrl: post.featuredImageUrl || undefined,
    featuredImageAlt: post.featuredImageAlt || undefined,
    authorName: post.authorName,
    authorImage: post.authorImage || undefined,
    status: post.status,
    featuredBusinessSlugs: post.featuredBusinessSlugs || undefined,
    metaTitle: post.metaTitle || undefined,
    metaDescription: post.metaDescription || undefined,
    publishedAt: post.publishedAt || undefined,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };

  return <PostForm post={postDraft} mode="edit" />;
}
