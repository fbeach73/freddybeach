import { Badge } from "@/components/ui/badge";
import { DynamicIcon } from "@/lib/utils/icons";
import type { Category } from "@/lib/types";

interface CategoryPageHeaderProps {
  category: Category;
  businessCount: number;
}

export function CategoryPageHeader({
  category,
  businessCount,
}: CategoryPageHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <DynamicIcon
            name={category.icon}
            className="h-8 w-8 text-primary"
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {category.name}
            </h1>
            <Badge variant="secondary">
              {businessCount} {businessCount === 1 ? "business" : "businesses"}
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            {category.description}
          </p>
        </div>
      </div>
    </header>
  );
}
