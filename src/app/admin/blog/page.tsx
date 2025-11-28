import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { blogPost } from "@/lib/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getCategoryById } from "@/lib/data/categories";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { BlogPostActions } from "@/components/admin/blog/blog-post-actions";
import { BlogStatusFilter } from "@/components/admin/blog/blog-status-filter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Posts | Admin",
  description: "Manage blog posts and content",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminBlogPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const statusFilter = params.status || "all";

  // Build query based on status filter
  const whereClause =
    statusFilter !== "all"
      ? eq(
          blogPost.status,
          statusFilter as "draft" | "published" | "archived"
        )
      : undefined;

  // Fetch blog posts from database
  const posts = await db
    .select()
    .from(blogPost)
    .where(whereClause)
    .orderBy(desc(blogPost.updatedAt));

  // Get counts for stats
  const [counts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      draft: sql<number>`count(*) filter (where ${blogPost.status} = 'draft')::int`,
      published: sql<number>`count(*) filter (where ${blogPost.status} = 'published')::int`,
      archived: sql<number>`count(*) filter (where ${blogPost.status} = 'archived')::int`,
    })
    .from(blogPost);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground">
            Create and manage blog posts for FreddyBeach.com
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {counts?.draft || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {counts?.published || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {counts?.archived || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Post List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Posts</CardTitle>
              <CardDescription>
                Manage your blog posts. Click to edit or publish.
              </CardDescription>
            </div>
            <BlogStatusFilter currentStatus={statusFilter} />
          </div>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No posts found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {statusFilter !== "all"
                  ? `No ${statusFilter} posts yet. Try a different filter.`
                  : "Get started by creating your first blog post."}
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/blog/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => {
                  const category = post.categoryId
                    ? getCategoryById(post.categoryId)
                    : null;
                  return (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="font-medium hover:underline truncate block max-w-[300px]"
                          >
                            {post.title}
                          </Link>
                          <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                            /{post.slug}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {category ? (
                          <Badge variant="outline">{category.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            post.status === "published" ? "default" : "secondary"
                          }
                          className={
                            post.status === "published"
                              ? "bg-green-600"
                              : post.status === "draft"
                              ? "bg-amber-500 text-white"
                              : ""
                          }
                        >
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {post.publishedAt ? (
                            <>
                              <span className="text-muted-foreground">
                                Published:{" "}
                              </span>
                              {new Date(post.publishedAt).toLocaleDateString()}
                            </>
                          ) : (
                            <>
                              <span className="text-muted-foreground">
                                Updated:{" "}
                              </span>
                              {new Date(post.updatedAt).toLocaleDateString()}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <BlogPostActions post={post} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
