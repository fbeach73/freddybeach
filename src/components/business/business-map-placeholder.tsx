import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessMapPlaceholderProps {
  className?: string;
}

export function BusinessMapPlaceholder({ className }: BusinessMapPlaceholderProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-0">
        <div className="aspect-video flex flex-col items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
          <MapPin className="h-12 w-12 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Map coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
