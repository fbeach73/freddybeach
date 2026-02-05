import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  accentColor?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  accentColor = "bg-nb-yellow",
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className={`h-2 ${accentColor} border-2 border-nb-border mb-6`} />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl uppercase">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  accentColor?: string;
}

export function SectionHeader({
  title,
  description,
  action,
  className,
  accentColor,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {accentColor && (
        <div className={`h-2 ${accentColor} border-2 border-nb-border`} />
      )}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight uppercase">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
