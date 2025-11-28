import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReadingTimeBadge } from "./reading-time-badge";
import { cn } from "@/lib/utils";
import type { BlogPostCard } from "@/types/blog";

interface BlogCardProps {
  post: BlogPostCard;
  className?: string;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function BlogCard({ post, className }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <Card
        className={cn(
          "overflow-hidden transition-all hover:shadow-lg hover:border-primary/20",
          className
        )}
      >
        {/* Featured Image */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={post.featuredImage}
            alt={post.featuredImageAlt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Category Badge */}
          {post.categoryName && (
            <Badge className="absolute top-3 left-3" variant="default">
              {post.categoryName}
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {post.excerpt}
          </p>
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
          <time dateTime={post.publishedAt.toISOString()}>
            {formatDate(post.publishedAt)}
          </time>
          <ReadingTimeBadge minutes={post.readingTime} />
        </CardFooter>
      </Card>
    </Link>
  );
}
