"use client";

import { Badge } from "@/components/ui/badge";
import { Coins, Crown, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// NOTE: TierBadge is for BUSINESS LISTING tiers (free/enhanced/featured) —
// a directory concept. AI tools use ToolCostBadge below (tool tiers retired).
interface TierBadgeProps {
  tier: "free" | "enhanced" | "featured";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function TierBadge({
  tier,
  size = "md",
  showLabel = true,
  className,
}: TierBadgeProps) {
  const config = {
    free: {
      label: "Free",
      icon: Star,
      className: "bg-muted text-muted-foreground hover:bg-muted",
    },
    enhanced: {
      label: "Enhanced",
      icon: Sparkles,
      className:
        "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400",
    },
    featured: {
      label: "Featured",
      icon: Crown,
      className:
        "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400",
    },
  };

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  const { label, icon: Icon, className: tierClassName } = config[tier];

  return (
    <Badge
      variant="secondary"
      className={cn(sizeClasses[size], tierClassName, className)}
    >
      <Icon className={cn(iconSizes[size], showLabel && "mr-1")} />
      {showLabel && label}
    </Badge>
  );
}

interface ToolCostBadgeProps {
  /** Plain-language cost, e.g. "1 credit", "Free" */
  costLabel: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Cost badge for AI tools — shows what a generation costs in plain language.
 */
export function ToolCostBadge({
  costLabel,
  size = "md",
  className,
}: ToolCostBadgeProps) {
  const isFree = costLabel.toLowerCase() === "free";

  return (
    <Badge
      variant="secondary"
      className={cn(
        size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-0.5",
        isFree
          ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
          : "bg-nb-yellow/20 text-foreground",
        className
      )}
    >
      {isFree ? (
        <Star className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5", "mr-1")} />
      ) : (
        <Coins className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5", "mr-1")} />
      )}
      {costLabel}
    </Badge>
  );
}

interface ClaimBadgeProps {
  isClaimed: boolean;
  isVerified?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ClaimBadge({
  isClaimed,
  isVerified = false,
  size = "md",
  className,
}: ClaimBadgeProps) {
  if (!isClaimed) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-dashed",
          size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-0.5",
          className
        )}
      >
        Unclaimed
      </Badge>
    );
  }

  if (isVerified) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
          size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-0.5",
          className
        )}
      >
        Verified
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-0.5",
        className
      )}
    >
      Claimed
    </Badge>
  );
}
