import { cn } from "@/lib/utils";
import { LucideIcon, Search, Building2, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Button
          className="mt-4"
          onClick={action.onClick}
          asChild={!!action.href}
        >
          {action.href ? (
            <a href={action.href}>{action.label}</a>
          ) : (
            action.label
          )}
        </Button>
      )}
    </div>
  );
}

export function NoSearchResults({
  query,
  suggestions,
  onSuggestionClick,
}: {
  query: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No results found</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We couldn&apos;t find any businesses matching &quot;{query}&quot;
      </p>
      {suggestions && suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">Did you mean:</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => onSuggestionClick?.(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function NoBusinesses({ categoryName }: { categoryName?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <Building2 className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No businesses yet</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {categoryName
          ? `There are no businesses listed in ${categoryName} yet.`
          : "There are no businesses listed yet."}
      </p>
      <Button className="mt-4" asChild>
        <a href="/consultation">Add Your Business</a>
      </Button>
    </div>
  );
}
