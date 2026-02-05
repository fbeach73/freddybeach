import { BlogCard } from "./blog-card";
import { cn } from "@/lib/utils";
import type { BlogPostCard } from "@/types/blog";
import { FileText } from "lucide-react";

interface BlogGridProps {
  posts: BlogPostCard[];
  className?: string;
}

export function BlogGrid({ posts, className }: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <div className="nb-card bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center bg-nb-blue border-2 border-nb-border">
          <FileText className="h-8 w-8 text-black" />
        </div>
        <h3 className="mt-4 text-lg font-bold uppercase">No blog posts yet</h3>
        <p className="mt-2 text-muted-foreground">
          Check back soon for local insights and community stories!
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
      {posts.map((post, index) => (
        <BlogCard key={post.slug} post={post} index={index} />
      ))}
    </div>
  );
}
