import Link from "next/link";
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
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
  accentColor?: string;
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  secondaryAction,
  className,
  accentColor = "bg-nb-yellow",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "nb-card bg-card p-12 flex flex-col items-center justify-center text-center",
        className
      )}
    >
      <div className={`flex h-16 w-16 items-center justify-center ${accentColor} border-2 border-nb-border`}>
        <Icon className="h-8 w-8 text-black" />
      </div>
      <h3 className="mt-4 text-lg font-bold uppercase">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              asChild={!!action.href}
              className="nb-btn bg-nb-green text-black hover:bg-nb-green"
            >
              {action.href ? (
                <Link href={action.href}>{action.label}</Link>
              ) : (
                action.label
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              asChild={!!secondaryAction.href}
              className="nb-btn bg-card text-foreground hover:bg-card"
            >
              {secondaryAction.href ? (
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              ) : (
                secondaryAction.label
              )}
            </Button>
          )}
        </div>
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
    <div className="nb-card bg-card p-12 flex flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center bg-nb-pink border-2 border-nb-border">
        <Search className="h-8 w-8 text-black" />
      </div>
      <h3 className="mt-4 text-lg font-bold uppercase">No results found</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We couldn&apos;t find any businesses matching &quot;{query}&quot;
      </p>
      {suggestions && suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Did you mean:</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                size="sm"
                onClick={() => onSuggestionClick?.(suggestion)}
                className="nb-btn bg-nb-blue text-black hover:bg-nb-blue text-xs"
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
    <div className="nb-card bg-card p-12 flex flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center bg-nb-orange border-2 border-nb-border">
        <Building2 className="h-8 w-8 text-black" />
      </div>
      <h3 className="mt-4 text-lg font-bold uppercase">No businesses yet</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {categoryName
          ? `There are no businesses listed in ${categoryName} yet.`
          : "There are no businesses listed yet."}
      </p>
      <Button className="nb-btn mt-4 bg-nb-green text-black hover:bg-nb-green" asChild>
        <Link href="/consultation">Add Your Business</Link>
      </Button>
    </div>
  );
}
