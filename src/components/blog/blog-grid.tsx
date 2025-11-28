import { BlogCard } from "./blog-card";
import { cn } from "@/lib/utils";
import type { BlogPostCard } from "@/types/blog";

interface BlogGridProps {
  posts: BlogPostCard[];
  className?: string;
}

export function BlogGrid({ posts, className }: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No blog posts yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
