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
    <div className={cn("", className)}>
      <h2 className="text-xl font-semibold mb-4">About {name}</h2>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
