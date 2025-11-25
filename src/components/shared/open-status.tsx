"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BusinessHours } from "@/lib/types";
import { isOpenNow, getNextOpenTime, getTodayHours, formatHours } from "@/lib/utils/business";

interface OpenStatusProps {
  hours: BusinessHours[];
  showNextOpen?: boolean;
  showTodayHours?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function OpenStatus({
  hours,
  showNextOpen = true,
  showTodayHours = false,
  size = "md",
  className,
}: OpenStatusProps) {
  const open = isOpenNow(hours);
  const todayHours = getTodayHours(hours);
  const nextOpen = !open ? getNextOpenTime(hours) : null;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge
        variant={open ? "default" : "secondary"}
        className={cn(
          sizeClasses[size],
          open
            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Clock className={cn("mr-1", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
        {open ? "Open" : "Closed"}
      </Badge>

      {showNextOpen && nextOpen && (
        <span className="text-xs text-muted-foreground">{nextOpen}</span>
      )}

      {showTodayHours && todayHours && (
        <span className="text-xs text-muted-foreground">
          {formatHours(todayHours)}
        </span>
      )}
    </div>
  );
}
