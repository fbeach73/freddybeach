"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Heart,
  Loader2,
  ImageOff,
  TrendingUp,
  Clock,
  X,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/lib/types/image-generation";

type SortOption = "recent" | "popular";

interface ImageGalleryProps {
  images: GalleryImage[];
  isLoading?: boolean;
  hasMore?: boolean;
  sort?: SortOption;
  onChangeSort?: (sort: SortOption) => void;
  onLoadMore?: () => void;
  onToggleLike?: (imageId: string) => Promise<boolean>;
  isLiked?: (imageId: string) => boolean;
  showHeader?: boolean;
}

export function ImageGallery({
  images,
  isLoading = false,
  hasMore = false,
  sort = "recent",
  onChangeSort,
  onLoadMore,
  onToggleLike,
  isLiked,
  showHeader = true,
}: ImageGalleryProps) {
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [likingImages, setLikingImages] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (!loadMoreRef.current || !onLoadMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoading]);

  const handleToggleLike = useCallback(
    async (image: GalleryImage) => {
      if (!onToggleLike) return;

      setLikingImages((prev) => new Set(prev).add(image.id));
      try {
        await onToggleLike(image.id);
      } finally {
        setLikingImages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(image.id);
          return newSet;
        });
      }
    },
    [onToggleLike]
  );

  const handleDownload = useCallback(async (image: GalleryImage) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gallery-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  }, []);

  // Loading skeleton
  if (isLoading && images.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Community Gallery</CardTitle>
            <CardDescription>
              Discover images created by the community
            </CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton
                key={i}
                className="mb-4 aspect-square w-full rounded-lg"
                style={{
                  aspectRatio: [1, 4 / 3, 3 / 4, 16 / 9][i % 4],
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!isLoading && images.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Community Gallery</CardTitle>
            <CardDescription>
              Discover images created by the community
            </CardDescription>
          </CardHeader>
        )}
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ImageOff className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No images yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to share your creations with the community
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        {showHeader && (
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Community Gallery</CardTitle>
              <CardDescription>
                Discover images created by the community
              </CardDescription>
            </div>
            {onChangeSort && (
              <Tabs
                value={sort}
                onValueChange={(v) => onChangeSort(v as SortOption)}
              >
                <TabsList>
                  <TabsTrigger value="recent" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Recent
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Popular
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </CardHeader>
        )}
        <CardContent>
          {/* Masonry Grid */}
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {images.map((image) => {
              const liked = isLiked ? isLiked(image.id) : image.isLiked;
              const isLiking = likingImages.has(image.id);

              return (
                <div
                  key={image.id}
                  className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg border bg-muted"
                >
                  {/* Image */}
                  <button
                    type="button"
                    onClick={() => setLightboxImage(image)}
                    className="block w-full"
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.prompt || "Generated image"}
                      className="w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </button>

                  {/* Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    {/* User info */}
                    {(image.userName || image.userImage) && (
                      <div className="mb-2 flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={image.userImage || undefined} />
                          <AvatarFallback className="text-xs">
                            {image.userName?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white">
                          {image.userName}
                        </span>
                      </div>
                    )}

                    {/* Prompt preview */}
                    {image.prompt && (
                      <p className="line-clamp-2 text-xs text-white/80">
                        {image.prompt}
                      </p>
                    )}
                  </div>

                  {/* Like button */}
                  {onToggleLike && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLike(image);
                      }}
                      disabled={isLiking}
                      className={cn(
                        "absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-sm text-white transition-all",
                        liked && "bg-red-500/80 text-white",
                        "hover:scale-110"
                      )}
                    >
                      {isLiking ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart
                          className={cn("h-4 w-4", liked && "fill-current")}
                        />
                      )}
                      <span>{image.likeCount}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Load More Trigger */}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="flex items-center justify-center py-8"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <Button variant="outline" onClick={onLoadMore}>
                  Load More
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog
        open={!!lightboxImage}
        onOpenChange={() => setLightboxImage(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="flex items-center gap-2">
              {lightboxImage?.userName && (
                <>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={lightboxImage.userImage || undefined} />
                    <AvatarFallback>
                      {lightboxImage.userName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{lightboxImage.userName}</span>
                </>
              )}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLightboxImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {lightboxImage && (
            <div className="space-y-4">
              <img
                src={lightboxImage.imageUrl}
                alt={lightboxImage.prompt || "Generated image"}
                className="w-full rounded-lg"
              />

              {/* Prompt */}
              {lightboxImage.prompt && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground">
                    {lightboxImage.prompt}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {onToggleLike && (
                    <button
                      type="button"
                      onClick={() => handleToggleLike(lightboxImage)}
                      disabled={likingImages.has(lightboxImage.id)}
                      className={cn(
                        "flex items-center gap-2 text-sm",
                        (isLiked
                          ? isLiked(lightboxImage.id)
                          : lightboxImage.isLiked) && "text-red-500"
                      )}
                    >
                      {likingImages.has(lightboxImage.id) ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Heart
                          className={cn(
                            "h-5 w-5",
                            (isLiked
                              ? isLiked(lightboxImage.id)
                              : lightboxImage.isLiked) && "fill-current"
                          )}
                        />
                      )}
                      <span>{lightboxImage.likeCount} likes</span>
                    </button>
                  )}

                  {lightboxImage.width && lightboxImage.height && (
                    <span className="text-sm text-muted-foreground">
                      {lightboxImage.width} x {lightboxImage.height}
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleDownload(lightboxImage)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
