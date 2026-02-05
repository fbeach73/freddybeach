import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog/get-posts";
import { BlogGrid } from "@/components/blog/blog-grid";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Discover local insights, business spotlights, and community stories from Fredericton. The FreddyBeach Blog brings you the best of Freddy Beach.",
  openGraph: {
    title: "Blog | FreddyBeach",
    description:
      "Discover local insights, business spotlights, and community stories from Fredericton.",
    type: "website",
  },
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="h-2 bg-nb-orange border-2 border-nb-border mb-6" />
        <h1 className="text-3xl md:text-4xl font-bold mb-2 uppercase">FreddyBeach Blog</h1>
        <p className="text-muted-foreground text-lg">
          Local insights, business spotlights, and community stories from
          Fredericton.
        </p>
      </div>

      {/* Blog Grid */}
      <BlogGrid posts={posts} />
    </div>
  );
}
