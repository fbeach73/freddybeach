// Blog Sidebar Component
// Wrapper for sidebar content including TOC, featured businesses, and author info

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Card>
          <CardContent className="p-4">
            <TableOfContents items={tocItems} />
          </CardContent>
        </Card>
      )}

      {/* Featured Businesses */}
      {hasFeaturedBusinesses && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Featured Local Businesses</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {featuredBusinesses.map((business) => (
              <FeaturedBusinessCard key={business.id} business={business} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Author Card */}
      {hasAuthor && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-2">About the Author</h4>
            <p className="text-sm text-muted-foreground">{author.bio}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
