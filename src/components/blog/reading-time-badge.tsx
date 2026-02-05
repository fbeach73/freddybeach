import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatReadingTime } from "@/lib/blog/reading-time";

interface ReadingTimeBadgeProps {
  minutes: number;
  className?: string;
  showIcon?: boolean;
}

export function ReadingTimeBadge({
  minutes,
  className,
  showIcon = true,
}: ReadingTimeBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("nb-badge bg-nb-blue/10 text-nb-blue font-bold", className)}
    >
      {showIcon && <Clock className="mr-1 h-3 w-3" />}
      {formatReadingTime(minutes)}
    </Badge>
  );
}
