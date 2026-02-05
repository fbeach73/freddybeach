import { cn } from "@/lib/utils";

interface BusinessDescriptionProps {
  name: string;
  description: string;
  className?: string;
}

export function BusinessDescription({
  name,
  description,
  className,
}: BusinessDescriptionProps) {
  return (
    <div className={cn("nb-card bg-card", className)}>
      <div className="h-2 bg-nb-green border-b-2 border-nb-border" />
      <div className="p-5">
        <h2 className="text-xl font-bold uppercase tracking-tight mb-4">About {name}</h2>
        <div className="border-b-2 border-nb-border/10 mb-4" />
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
