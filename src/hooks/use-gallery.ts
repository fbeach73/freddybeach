"use client";

import { useState, useCallback } from "react";
import type { GalleryImage, GalleryResponse } from "@/lib/types/image-generation";

type SortOption = "recent" | "popular";

interface UseGalleryOptions {
  pageSize?: number;
  initialSort?: SortOption;
}

export function useGallery(options: UseGalleryOptions = {}) {
  const { pageSize = 20, initialSort = "recent" } = options;

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track liked images locally for optimistic updates
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  // Track pending like requests to prevent double requests
  const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());

  /**
   * Fetch gallery images (initial load or when sort changes)
   */
  const loadGallery = useCallback(
    async (sortOption?: SortOption, pageNum: number = 1) => {
      setIsLoading(true);
      setError(null);

      const sortToUse = sortOption || sort;

      try {
        const response = await fetch(
          `/api/gallery?page=${pageNum}&pageSize=${pageSize}&sort=${sortToUse}`
        );
        const data: GalleryResponse = await response.json();

        if (!response.ok) {
          const errorMsg =
            (data as unknown as { error?: string }).error || "Failed to load gallery";
          setError(errorMsg);
          return;
        }

        const loadedImages: GalleryImage[] = data.images.map((img) => ({
          ...img,
          createdAt: new Date(img.createdAt),
        }));

        setImages(loadedImages);
        setTotal(data.total);
        setPage(data.page);
        setHasMore(data.hasMore);

        // Update liked images set based on isLiked flag
        const liked = new Set<string>();
        loadedImages.forEach((img) => {
          if (img.isLiked) {
            liked.add(img.id);
          }
        });
        setLikedImages(liked);

        if (sortOption && sortOption !== sort) {
          setSort(sortOption);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load gallery";
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [sort, pageSize]
  );

  /**
   * Load more images (infinite scroll / pagination)
   */
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    const nextPage = page + 1;

    try {
      const response = await fetch(
        `/api/gallery?page=${nextPage}&pageSize=${pageSize}&sort=${sort}`
      );
      const data: GalleryResponse = await response.json();

      if (!response.ok) {
        const errorMsg =
          (data as unknown as { error?: string }).error || "Failed to load more images";
        setError(errorMsg);
        return;
      }

      const newImages: GalleryImage[] = data.images.map((img) => ({
        ...img,
        createdAt: new Date(img.createdAt),
      }));

      setImages((prev) => [...prev, ...newImages]);
      setPage(data.page);
      setHasMore(data.hasMore);

      // Update liked images set
      newImages.forEach((img) => {
        if (img.isLiked) {
          setLikedImages((prev) => new Set(prev).add(img.id));
        }
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load more images";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, pageSize, sort]);

  /**
   * Change the sort order and reload
   */
  const changeSort = useCallback(
    async (newSort: SortOption) => {
      if (newSort === sort) return;
      setSort(newSort);
      await loadGallery(newSort, 1);
    },
    [sort, loadGallery]
  );

  /**
   * Toggle like on an image (optimistic update)
   */
  const toggleLike = useCallback(
    async (imageId: string): Promise<boolean> => {
      // Prevent double requests
      if (pendingLikes.has(imageId)) {
        return false;
      }

      setPendingLikes((prev) => new Set(prev).add(imageId));
      const isCurrentlyLiked = likedImages.has(imageId);

      // Optimistic update
      setLikedImages((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(imageId);
        } else {
          newSet.add(imageId);
        }
        return newSet;
      });

      // Update like count optimistically
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                likeCount: isCurrentlyLiked
                  ? img.likeCount - 1
                  : img.likeCount + 1,
                isLiked: !isCurrentlyLiked,
              }
            : img
        )
      );

      try {
        const response = await fetch(`/api/gallery/${imageId}/like`, {
          method: isCurrentlyLiked ? "DELETE" : "POST",
        });

        if (!response.ok) {
          // Revert optimistic update on failure
          setLikedImages((prev) => {
            const newSet = new Set(prev);
            if (isCurrentlyLiked) {
              newSet.add(imageId);
            } else {
              newSet.delete(imageId);
            }
            return newSet;
          });

          setImages((prev) =>
            prev.map((img) =>
              img.id === imageId
                ? {
                    ...img,
                    likeCount: isCurrentlyLiked
                      ? img.likeCount + 1
                      : img.likeCount - 1,
                    isLiked: isCurrentlyLiked,
                  }
                : img
            )
          );

          return false;
        }

        return true;
      } catch {
        // Revert optimistic update on error
        setLikedImages((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlyLiked) {
            newSet.add(imageId);
          } else {
            newSet.delete(imageId);
          }
          return newSet;
        });

        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  likeCount: isCurrentlyLiked
                    ? img.likeCount + 1
                    : img.likeCount - 1,
                  isLiked: isCurrentlyLiked,
                }
              : img
          )
        );

        return false;
      } finally {
        // Remove from pending set
        setPendingLikes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(imageId);
          return newSet;
        });
      }
    },
    [likedImages, pendingLikes]
  );

  /**
   * Check if an image is liked
   */
  const isLiked = useCallback(
    (imageId: string): boolean => {
      return likedImages.has(imageId);
    },
    [likedImages]
  );

  /**
   * Clear any error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh the gallery (reload from page 1)
   */
  const refresh = useCallback(() => {
    loadGallery(sort, 1);
  }, [loadGallery, sort]);

  return {
    // State
    images,
    total,
    page,
    hasMore,
    sort,
    isLoading,
    error,

    // Actions
    loadGallery,
    loadMore,
    changeSort,
    toggleLike,
    refresh,

    // Helpers
    isLiked,
    clearError,
  };
}
