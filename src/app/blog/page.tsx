import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog/get-posts";
import { BlogGrid } from "@/components/blog/blog-grid";

export const metadata: Metadata = {
  title: "Freddy Beach Blog | Local Business Insights & Community Stories",
  description:
    "The Freddy Beach Blog — local business spotlights, Fredericton guides, community stories, and insider tips. Explore what makes Freddy Beach, New Brunswick a great place to live and visit.",
  openGraph: {
    title: "Freddy Beach Blog | Local Business Insights & Community Stories",
    description:
      "Local business spotlights, Fredericton guides, community stories, and insider tips from Freddy Beach, New Brunswick.",
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
        <h1 className="text-3xl md:text-4xl font-bold mb-2 uppercase">Freddy Beach Blog</h1>
        <p className="text-muted-foreground text-lg">
          Local business insights, community stories, and guides to the best of
          Freddy Beach, Fredericton.
        </p>
      </div>

      {/* Blog Grid */}
      <BlogGrid posts={posts} />
    </div>
  );
}
