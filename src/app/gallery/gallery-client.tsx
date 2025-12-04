"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/generate";
import { useGallery } from "@/hooks/use-gallery";

export function GalleryClient() {
  const {
    images,
    isLoading,
    hasMore,
    sort,
    loadGallery,
    loadMore,
    changeSort,
    toggleLike,
    isLiked,
  } = useGallery({ pageSize: 24, initialSort: "recent" });

  // Load gallery images on mount
  useEffect(() => {
    loadGallery("recent", 1);
  }, [loadGallery]);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {images.length > 0 && `Showing ${images.length} images`}
        </p>
        <Button asChild>
          <Link href="/ai-tools/image-generator">
            <Sparkles className="mr-2 h-4 w-4" />
            Create Your Own
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Gallery */}
      <ImageGallery
        images={images}
        isLoading={isLoading}
        hasMore={hasMore}
        sort={sort}
        onChangeSort={changeSort}
        onLoadMore={loadMore}
        onToggleLike={toggleLike}
        isLiked={isLiked}
        showHeader={true}
      />
    </div>
  );
}
