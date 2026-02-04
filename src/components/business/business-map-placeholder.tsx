import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessMapPlaceholderProps {
  className?: string;
}

export function BusinessMapPlaceholder({ className }: BusinessMapPlaceholderProps) {
  return (
    <div className={cn("nb-card overflow-hidden", className)}>
      <div className="h-2 bg-nb-orange border-b-2 border-nb-border" />
      <div className="aspect-video flex flex-col items-center justify-center bg-muted/50">
        <div className="flex h-12 w-12 items-center justify-center bg-nb-orange/20 border-2 border-nb-border/20">
          <MapPin className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-2 text-sm font-bold text-muted-foreground">Map coming soon</p>
      </div>
    </div>
  );
}
