"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessPhotoGalleryProps {
  images: string[];
  businessName: string;
  className?: string;
}

export function BusinessPhotoGallery({
  images,
  businessName,
  className,
}: BusinessPhotoGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  return (
    <div className={cn("nb-card bg-card", className)}>
      <div className="h-2 bg-nb-pink border-b-2 border-nb-border" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center bg-nb-pink border-2 border-nb-border">
            <Camera className="h-4 w-4 text-black" />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-tight">Photos</h2>
        </div>
        <div className="border-b-2 border-nb-border/10 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="relative aspect-square overflow-hidden group cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-nb-yellow focus-visible:ring-offset-2 border-4 border-nb-border shadow-nb-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
            >
              <Image
                src={image}
                alt={`${businessName} photo ${index + 1}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 border-4 border-nb-border rounded-none bg-black/95">
          <DialogTitle className="sr-only">{businessName} photo gallery</DialogTitle>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-none border-2 border-white/30"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </Button>

            <div className="relative aspect-video">
              <Image
                src={images[currentIndex]}
                alt={`${businessName} photo ${currentIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-none border-2 border-white/30"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                  <span className="sr-only">Previous image</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-none border-2 border-white/30"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                  <span className="sr-only">Next image</span>
                </Button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "w-3 h-3 border-2 border-white transition-colors",
                        index === currentIndex
                          ? "bg-white"
                          : "bg-white/20 hover:bg-white/50"
                      )}
                    >
                      <span className="sr-only">Go to image {index + 1}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
