"use client";

import { useState, useCallback } from "react";
import {
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  ImageOff,
  Link,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GeneratedImage } from "@/lib/types/image-generation";

interface GenerationOutputProps {
  images: GeneratedImage[];
  prompt?: string;
  isLoading?: boolean;
  onTogglePublic?: (imageId: string, isPublic: boolean) => Promise<void>;
}

export function GenerationOutput({
  images,
  prompt,
  isLoading = false,
  onTogglePublic,
}: GenerationOutputProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [loadingPublic, setLoadingPublic] = useState<string | null>(null);

  const handleCopyPrompt = useCallback(async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
    toast.success("Prompt copied to clipboard");
  }, [prompt]);

  const handleCopyImageUrl = useCallback(async (imageUrl: string) => {
    await navigator.clipboard.writeText(imageUrl);
    toast.success("Image URL copied to clipboard");
  }, []);

  const handleDownload = useCallback(async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  }, []);

  const handleTogglePublic = useCallback(
    async (image: GeneratedImage) => {
      if (!onTogglePublic) return;
      setLoadingPublic(image.id);
      try {
        await onTogglePublic(image.id, !image.isPublic);
      } finally {
        setLoadingPublic(null);
      }
    },
    [onTogglePublic]
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating images...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (images.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ImageOff className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No images yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter a prompt above and click Generate to create images
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Generated Images</CardTitle>
          {prompt && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyPrompt}
              className="gap-2"
            >
              {copiedPrompt ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Prompt
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {/* Prompt Display */}
          {prompt && (
            <div className="mb-4 rounded-lg bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">{prompt}</p>
            </div>
          )}

          {/* Images Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-lg border bg-muted"
              >
                {/* Image */}
                <button
                  type="button"
                  onClick={() => setLightboxImage(image)}
                  className="block w-full"
                >
                  <img
                    src={image.imageUrl}
                    alt="Generated image"
                    className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                </button>

                {/* Overlay Actions */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => handleDownload(image)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => handleCopyImageUrl(image.imageUrl)}
                      title="Copy image URL"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => setLightboxImage(image)}
                      title="View full size"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Share to Gallery Toggle */}
                  {onTogglePublic && (
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`public-${image.id}`}
                        className="text-xs text-white"
                      >
                        Share
                      </Label>
                      {loadingPublic === image.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <Switch
                          id={`public-${image.id}`}
                          checked={image.isPublic}
                          onCheckedChange={() => handleTogglePublic(image)}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Public Badge */}
                {image.isPublic && (
                  <div className="absolute right-2 top-2">
                    <div className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                      <Share2 className="h-3 w-3" />
                      Public
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generated Image</DialogTitle>
          </DialogHeader>
          {lightboxImage && (
            <div className="space-y-4">
              <img
                src={lightboxImage.imageUrl}
                alt="Generated image"
                className="w-full rounded-lg"
              />
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {lightboxImage.width && lightboxImage.height && (
                    <span>
                      {lightboxImage.width} x {lightboxImage.height}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCopyImageUrl(lightboxImage.imageUrl)}
                  >
                    <Link className="mr-2 h-4 w-4" />
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(lightboxImage)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
