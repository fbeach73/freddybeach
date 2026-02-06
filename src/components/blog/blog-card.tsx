import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ReadingTimeBadge } from "./reading-time-badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";
import type { BlogPostCard } from "@/types/blog";

const ACCENT_COLORS = [
  "bg-nb-yellow",
  "bg-nb-blue",
  "bg-nb-pink",
  "bg-nb-green",
  "bg-nb-orange",
];

interface BlogCardProps {
  post: BlogPostCard;
  index?: number;
  className?: string;
}

export function BlogCard({ post, index = 0, className }: BlogCardProps) {
  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <Link href={`/${post.slug}`} className="group">
      <div
        className={cn(
          "nb-card bg-card overflow-hidden flex flex-col h-full",
          className
        )}
      >
        {/* Colored top bar */}
        <div className={`h-2 ${accentColor} border-b-2 border-nb-border`} />

        {/* Featured Image */}
        <div className="relative aspect-video overflow-hidden border-b-2 border-nb-border">
          <Image
            src={post.featuredImage}
            alt={post.featuredImageAlt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Category Badge */}
          {post.categoryName && (
            <Badge className="nb-badge bg-nb-yellow text-black absolute top-3 left-3">
              {post.categoryName}
            </Badge>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          {/* Title */}
          <h3 className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {post.excerpt}
          </p>

          <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground font-bold">
            <time dateTime={post.publishedAt.toISOString()}>
              {formatDate(post.publishedAt)}
            </time>
            <ReadingTimeBadge minutes={post.readingTime} />
          </div>
        </div>
      </div>
    </Link>
  );
}
