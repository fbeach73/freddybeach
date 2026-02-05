import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReadingTimeBadge } from "./reading-time-badge";
import { formatDate, getInitials } from "@/lib/utils/format";
import type { BlogPost } from "@/types/blog";

interface BlogPostHeaderProps {
  post: BlogPost;
}

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  return (
    <header className="mb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm font-bold mb-4">
        <Link href="/" className="hover:text-nb-yellow transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 text-nb-border" />
        <Link href="/blog" className="hover:text-nb-yellow transition-colors">
          Blog
        </Link>
        {post.category && (
          <>
            <ChevronRight className="h-4 w-4 mx-2 text-nb-border" />
            <span className="font-black text-nb-yellow">{post.category.name}</span>
          </>
        )}
      </nav>

      {/* Category Badge */}
      {post.category && (
        <Badge className="nb-badge bg-nb-yellow text-black mb-4">
          {post.category.name}
        </Badge>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase mb-6 leading-tight tracking-tight">
        {post.title}
      </h1>

      {/* Author and Meta */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-nb-border">
            {post.author.image && (
              <AvatarImage src={post.author.image} alt={post.author.name} />
            )}
            <AvatarFallback className="font-bold">{getInitials(post.author.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-sm">{post.author.name}</p>
            <time
              dateTime={post.publishedAt.toISOString()}
              className="text-sm text-muted-foreground"
            >
              {formatDate(post.publishedAt)}
            </time>
          </div>
        </div>

        <ReadingTimeBadge minutes={post.readingTime} />
      </div>

      {/* Featured Image */}
      <div className="relative aspect-video overflow-hidden border-4 border-nb-border shadow-nb-lg">
        <Image
          src={post.featuredImage}
          alt={post.featuredImageAlt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 896px"
        />
      </div>
    </header>
  );
}
