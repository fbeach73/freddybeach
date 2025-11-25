"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
    <div className={cn("", className)}>
      <h2 className="text-xl font-semibold mb-4">Photos</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <DialogTitle className="sr-only">{businessName} photo gallery</DialogTitle>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                  <span className="sr-only">Previous image</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
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
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentIndex
                          ? "bg-white"
                          : "bg-white/40 hover:bg-white/60"
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
