"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Copy,
  Trash2,
  Check,
  Image as ImageIcon,
  Loader2,
  Calendar,
  FileImage,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "./image-upload";
import type { BlogImage } from "@/types/blog";

interface MediaLibraryProps {
  onSelect?: (image: BlogImage) => void;
  selectionMode?: boolean;
  blogPostId?: string;
}

export function MediaLibrary({
  onSelect,
  selectionMode = false,
  blogPostId,
}: MediaLibraryProps) {
  const [images, setImages] = useState<BlogImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch images
  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (blogPostId) params.set("blogPostId", blogPostId);

      const response = await fetch(`/api/blog/images?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch images");

      const data = await response.json();
      setImages(data.images);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load images. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [search, blogPostId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchImages();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchImages]);

  // Handle image upload
  const handleUpload = (image: BlogImage) => {
    setImages((prev) => [image, ...prev]);
    setTotal((prev) => prev + 1);
  };

  // Copy markdown to clipboard
  const copyMarkdown = async (image: BlogImage) => {
    const markdown = `![${image.altText}](${image.url})`;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedId(image.id);
      toast.success("Markdown copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  // Delete image
  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId);
    try {
      const response = await fetch(`/api/blog/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete image");
      }

      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setTotal((prev) => prev - 1);
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format file size
  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Upload section */}
        <ImageUpload onUpload={handleUpload} blogPostId={blogPostId} />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                {total} image{total !== 1 ? "s" : ""}
                {search && ` matching "${search}"`}
              </>
            )}
          </span>
        </div>

        {/* Image grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No images found</p>
            <p className="text-sm mt-1">
              {search
                ? "Try a different search term"
                : "Upload your first image above"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`group relative rounded-lg overflow-hidden bg-muted border ${
                  selectionMode
                    ? "cursor-pointer hover:ring-2 hover:ring-primary"
                    : ""
                }`}
                onClick={() => selectionMode && onSelect?.(image)}
              >
                {/* Image */}
                <div className="aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.altText}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  {/* Actions */}
                  <div className="flex gap-1 mb-2">
                    {/* Copy markdown */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyMarkdown(image);
                          }}
                        >
                          {copiedId === image.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {copiedId === image.id
                          ? "Copied!"
                          : "Copy Markdown"}
                      </TooltipContent>
                    </Tooltip>

                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                          disabled={deletingId === image.id}
                        >
                          {deletingId === image.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Image</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this image? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(image.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Info */}
                  <div className="text-white text-xs space-y-0.5">
                    <p className="font-medium truncate">{image.filename}</p>
                    <p className="text-white/70 truncate">{image.altText}</p>
                    <div className="flex items-center gap-2 text-white/50">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(image.createdAt)}
                      </span>
                      {image.fileSize && (
                        <span>{formatSize(image.fileSize)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selection indicator */}
                {selectionMode && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
