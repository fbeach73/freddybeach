// Blog Sidebar Component
// Wrapper for sidebar content including TOC, featured businesses, and author info

import { TableOfContents } from "./table-of-contents";
import { FeaturedBusinessCard } from "./featured-business-card";
import type { TOCItem } from "@/types/blog";
import type { BlogAuthor } from "@/types/blog";
import type { Business } from "@/lib/types";

interface BlogSidebarProps {
  tocItems?: TOCItem[];
  author?: BlogAuthor;
  featuredBusinesses?: Business[];
}

export function BlogSidebar({
  tocItems,
  author,
  featuredBusinesses,
}: BlogSidebarProps) {
  const hasToc = tocItems && tocItems.length > 0;
  const hasFeaturedBusinesses = featuredBusinesses && featuredBusinesses.length > 0;
  const hasAuthor = author?.bio;

  // Don't render if nothing to show
  if (!hasToc && !hasFeaturedBusinesses && !hasAuthor) {
    return null;
  }

  return (
    <div className="lg:sticky lg:top-24 space-y-6">
      {/* Table of Contents */}
      {hasToc && (
        <div className="nb-card bg-card">
          <div className="h-2 bg-nb-blue border-b-2 border-nb-border" />
          <div className="p-4">
            <TableOfContents items={tocItems} />
          </div>
        </div>
      )}

      {/* Featured Businesses */}
      {hasFeaturedBusinesses && (
        <div className="nb-card bg-card">
          <div className="h-2 bg-nb-orange border-b-2 border-nb-border" />
          <div className="p-4">
            <h4 className="text-sm font-bold uppercase tracking-tight mb-3">Featured Local Businesses</h4>
            <div className="border-b-2 border-nb-border/10 mb-3" />
            <div className="space-y-3">
              {featuredBusinesses.map((business) => (
                <FeaturedBusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Author Card */}
      {hasAuthor && (
        <div className="nb-card bg-card">
          <div className="h-2 bg-nb-pink border-b-2 border-nb-border" />
          <div className="p-4">
            <h4 className="font-bold text-sm uppercase tracking-tight mb-2">About the Author</h4>
            <div className="border-b-2 border-nb-border/10 mb-2" />
            <p className="text-sm text-muted-foreground">{author.bio}</p>
          </div>
        </div>
      )}
    </div>
  );
}
