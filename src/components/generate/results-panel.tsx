"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  ImageIcon,
  Share2,
  Link,
  Trash2,
  Wand2,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { GeneratedImage } from "@/lib/types/image-generation";

// ============================================================================
// Types
// ============================================================================

interface ResultsPanelProps {
  /** Array of generated images to display */
  images: GeneratedImage[];
  /** Whether generation is in progress */
  isLoading?: boolean;
  /** The prompt used to generate these images */
  prompt?: string;
  /** Callback when toggling image public/private status */
  onTogglePublic?: (imageId: string, isPublic: boolean) => Promise<void>;
  /** Callback when requesting refinement for an image */
  onRefine?: (image: GeneratedImage) => void;
  /** Callback when deleting an image */
  onDelete?: (imageId: string) => Promise<void>;
}

// ============================================================================
// Subcomponents
// ============================================================================

function EmptyState() {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 p-8 text-center">
      <div className="mb-4 rounded-full bg-muted/50 p-4">
        <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-medium">No images yet</h3>
      <p className="mt-2 max-w-[260px] text-sm text-muted-foreground">
        Build your prompt using scene settings and generate images to see them here
      </p>
    </div>
  );
}

function LoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative overflow-hidden rounded-lg">
          <Skeleton className="aspect-square w-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ImageCardProps {
  image: GeneratedImage;
  onViewFull: () => void;
  onDownload: () => void;
  onCopyUrl: () => void;
  onTogglePublic?: (isPublic: boolean) => void;
  onRefine?: () => void;
  onDelete?: () => void;
  isLoadingPublic?: boolean;
  isDeleting?: boolean;
}

function ImageCard({
  image,
  onViewFull,
  onDownload,
  onCopyUrl,
  onTogglePublic,
  onRefine,
  onDelete,
  isLoadingPublic = false,
  isDeleting = false,
}: ImageCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-muted transition-all",
        "hover:border-primary/50 hover:shadow-lg",
        isDeleting && "pointer-events-none opacity-50"
      )}
    >
      {/* Image */}
      <button
        type="button"
        onClick={onViewFull}
        className="relative block aspect-square w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="View full size image"
      >
        <Image
          src={image.imageUrl}
          alt="Generated image"
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          unoptimized
        />
        {/* Zoom hint on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
          <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
      </button>

      {/* Public Badge */}
      {image.isPublic && (
        <div className="absolute right-2 top-2 z-10">
          <Badge variant="secondary" className="gap-1 bg-green-500/90 text-white hover:bg-green-500">
            <Share2 className="h-3 w-3" />
            Public
          </Badge>
        </div>
      )}

      {/* Overlay Actions */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 via-black/50 to-transparent px-3 py-3 opacity-0 transition-opacity group-hover:opacity-100">
        <TooltipProvider delayDuration={0}>
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload();
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Download</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyUrl();
                  }}
                >
                  <Link className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Copy URL</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewFull();
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">View full size</TooltipContent>
            </Tooltip>

            {onRefine && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefine();
                    }}
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Refine</TooltipContent>
              </Tooltip>
            )}

            {onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Delete</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>

        {/* Share Toggle */}
        {onTogglePublic && (
          <div className="flex items-center gap-2">
            <Label
              htmlFor={`public-${image.id}`}
              className="text-xs font-medium text-white"
            >
              Share
            </Label>
            {isLoadingPublic ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Switch
                id={`public-${image.id}`}
                checked={image.isPublic}
                onCheckedChange={(checked) => {
                  onTogglePublic(checked);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Lightbox Modal
// ============================================================================

interface LightboxModalProps {
  image: GeneratedImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (image: GeneratedImage) => void;
  onCopyUrl: (url: string) => void;
  onRefine?: (image: GeneratedImage) => void;
}

function LightboxModal({
  image,
  open,
  onOpenChange,
  onDownload,
  onCopyUrl,
  onRefine,
}: LightboxModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = useCallback(() => {
    if (!image) return;
    onCopyUrl(image.imageUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }, [image, onCopyUrl]);

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Generated Image</DialogTitle>
          <DialogDescription>
            View and manage your generated image
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="relative mx-auto aspect-square max-h-[60vh] w-full max-w-[60vh] overflow-hidden rounded-lg bg-muted">
            <Image
              src={image.imageUrl}
              alt="Generated image"
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>

          {/* Info & Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Image Info */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {image.width && image.height && (
                <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                  {image.width} × {image.height}
                </span>
              )}
              {image.isPublic && (
                <Badge variant="secondary" className="gap-1">
                  <Share2 className="h-3 w-3" />
                  Public
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                {copiedUrl ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link className="mr-2 h-4 w-4" />
                    Copy URL
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(image)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              {onRefine && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    onRefine(image);
                    onOpenChange(false);
                  }}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Refine
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ResultsPanel({
  images,
  isLoading = false,
  prompt,
  onTogglePublic,
  onRefine,
  onDelete,
}: ResultsPanelProps) {
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [loadingPublicId, setLoadingPublicId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Handle downloading an image
  const handleDownload = useCallback(async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch (error) {
      console.error("Failed to download image:", error);
      toast.error("Failed to download image");
    }
  }, []);

  // Handle copying image URL
  const handleCopyUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Image URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  }, []);

  // Handle toggling public status
  const handleTogglePublic = useCallback(
    async (image: GeneratedImage, isPublic: boolean) => {
      if (!onTogglePublic) return;
      setLoadingPublicId(image.id);
      try {
        await onTogglePublic(image.id, isPublic);
        toast.success(isPublic ? "Image shared to gallery" : "Image made private");
      } catch {
        toast.error("Failed to update image visibility");
      } finally {
        setLoadingPublicId(null);
      }
    },
    [onTogglePublic]
  );

  // Handle deleting an image
  const handleDelete = useCallback(
    async (imageId: string) => {
      if (!onDelete) return;

      const confirmed = window.confirm(
        "Are you sure you want to delete this image? This action cannot be undone."
      );
      if (!confirmed) return;

      setDeletingId(imageId);
      try {
        await onDelete(imageId);
        toast.success("Image deleted");
        // Close lightbox if the deleted image was being viewed
        if (lightboxImage?.id === imageId) {
          setLightboxImage(null);
        }
      } catch {
        toast.error("Failed to delete image");
      } finally {
        setDeletingId(null);
      }
    },
    [onDelete, lightboxImage]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Results</h2>
        <p className="text-sm text-muted-foreground">
          Your generated images will appear here
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton count={4} />
      ) : images.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Image Count */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {images.length} {images.length === 1 ? "image" : "images"}
            </span>
          </div>

          {/* Images Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onViewFull={() => setLightboxImage(image)}
                onDownload={() => handleDownload(image)}
                onCopyUrl={() => handleCopyUrl(image.imageUrl)}
                onTogglePublic={
                  onTogglePublic
                    ? (isPublic) => handleTogglePublic(image, isPublic)
                    : undefined
                }
                onRefine={onRefine ? () => onRefine(image) : undefined}
                onDelete={onDelete ? () => handleDelete(image.id) : undefined}
                isLoadingPublic={loadingPublicId === image.id}
                isDeleting={deletingId === image.id}
              />
            ))}
          </div>
        </>
      )}

      {/* Lightbox Modal */}
      <LightboxModal
        image={lightboxImage}
        open={!!lightboxImage}
        onOpenChange={(open) => !open && setLightboxImage(null)}
        onDownload={handleDownload}
        onCopyUrl={handleCopyUrl}
        onRefine={onRefine}
      />
    </div>
  );
}
