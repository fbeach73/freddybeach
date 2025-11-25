import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CaseStudyResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface ResultMetricProps {
  result: CaseStudyResult;
  className?: string;
  variant?: "default" | "compact";
}

export function ResultMetric({
  result,
  className,
  variant = "default",
}: ResultMetricProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "rounded-lg bg-primary/5 text-center",
        isCompact ? "p-3" : "p-4",
        className
      )}
    >
      <div
        className={cn(
          "font-bold text-primary",
          isCompact ? "text-xl" : "text-2xl md:text-3xl"
        )}
      >
        {result.value}
      </div>
      <div
        className={cn(
          "text-muted-foreground",
          isCompact ? "text-xs" : "mt-1 text-sm"
        )}
      >
        {result.metric}
        {result.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="ml-1 inline h-3 w-3 cursor-help opacity-60" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px] text-xs">{result.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
