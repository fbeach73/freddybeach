"use client";

import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  reviewCount,
  className,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    if (i <= Math.floor(rating)) {
      // Full star
      stars.push(
        <Star
          key={i}
          className={cn(sizeClasses[size], "fill-primary text-primary")}
        />
      );
    } else if (i === Math.ceil(rating) && rating % 1 >= 0.5) {
      // Half star
      stars.push(
        <StarHalf
          key={i}
          className={cn(sizeClasses[size], "fill-primary text-primary")}
        />
      );
    } else {
      // Empty star
      stars.push(
        <Star
          key={i}
          className={cn(sizeClasses[size], "text-muted-foreground/55")}
        />
      );
    }
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">{stars}</div>
      {showValue && (
        <span className={cn("font-medium", textSizeClasses[size])}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={cn("text-muted-foreground", textSizeClasses[size])}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
