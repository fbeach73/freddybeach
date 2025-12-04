"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/components/auth/user-profile";
import { ImageGallery } from "@/components/generate";
import { useGallery } from "@/hooks/use-gallery";

interface GenerateClientSectionProps {
  isAuthenticated: boolean;
}

export function GenerateClientSection({
  isAuthenticated,
}: GenerateClientSectionProps) {
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
  } = useGallery({ pageSize: 8, initialSort: "popular" });

  // Load featured gallery images on mount
  useEffect(() => {
    loadGallery("popular", 1);
  }, [loadGallery]);

  if (!isAuthenticated) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
                Try It Now
              </h2>
              <p className="text-muted-foreground">
                Sign in to start creating amazing images with AI
              </p>
            </div>

            {/* Preview Card */}
            <Card className="relative overflow-hidden">
              {/* Blurred Preview */}
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="mx-auto max-w-md p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">
                    Sign In to Generate
                  </h3>
                  <p className="mb-6 text-muted-foreground">
                    Create a free account to start generating AI images. Get 10
                    free generations per month.
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    <UserProfile />
                    <p className="text-xs text-muted-foreground">
                      Free account • No credit card required
                    </p>
                  </div>
                </div>
              </div>

              {/* Blurred Content Preview */}
              <CardContent
                className="pointer-events-none select-none p-6 blur-sm"
                aria-hidden="true"
              >
                <div className="space-y-6">
                  {/* Fake prompt area */}
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-32 rounded-lg border bg-muted/50" />
                  </div>

                  {/* Fake settings row */}
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-3 w-16 rounded bg-muted" />
                        <div className="h-10 rounded-lg border bg-muted/50" />
                      </div>
                    ))}
                  </div>

                  {/* Fake generate button */}
                  <div className="flex justify-end">
                    <div className="h-10 w-32 rounded-lg bg-muted" />
                  </div>

                  {/* Fake output area */}
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg bg-muted/50"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  // Authenticated view - show featured gallery
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Featured Creations
            </h2>
            <p className="text-muted-foreground">
              See what the community has been creating
            </p>
          </div>
          <Button asChild>
            <Link href="/ai-tools/image-generator">
              <Sparkles className="mr-2 h-4 w-4" />
              Start Creating
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ImageGallery
          images={images}
          isLoading={isLoading}
          hasMore={hasMore}
          sort={sort}
          onChangeSort={changeSort}
          onLoadMore={loadMore}
          onToggleLike={toggleLike}
          isLiked={isLiked}
          showHeader={false}
        />

        {images.length > 0 && (
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/gallery">
                View Full Gallery
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
