// Related Posts Component
// Displays related blog posts at the bottom of a blog post

import { BlogCard } from "./blog-card";
import type { BlogPostCard } from "@/types/blog";

interface RelatedPostsProps {
  posts: BlogPostCard[];
  title?: string;
}

export function RelatedPosts({
  posts,
  title = "Related Articles",
}: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="h-2 bg-nb-green border-2 border-nb-border mb-6" />
      <h2 className="text-2xl font-bold uppercase tracking-tight mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <BlogCard key={post.slug} post={post} index={index} />
        ))}
      </div>
    </section>
  );
}
