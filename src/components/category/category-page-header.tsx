import { Badge } from "@/components/ui/badge";
import { DynamicIcon } from "@/lib/utils/icons";
import type { Category } from "@/lib/types";

const ACCENT_COLORS = [
  "bg-nb-yellow",
  "bg-nb-blue",
  "bg-nb-pink",
  "bg-nb-green",
  "bg-nb-orange",
];

interface CategoryPageHeaderProps {
  category: Category;
  businessCount: number;
}

export function CategoryPageHeader({
  category,
  businessCount,
}: CategoryPageHeaderProps) {
  // Derive a consistent accent color from the category name
  const accentIndex =
    category.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    ACCENT_COLORS.length;
  const accentColor = ACCENT_COLORS[accentIndex];

  return (
    <header className="mb-8">
      {/* Colored accent bar */}
      <div
        className={`h-2 ${accentColor} border-2 border-nb-border mb-6`}
      />
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center ${accentColor} border-2 border-nb-border`}
        >
          <DynamicIcon
            name={category.icon}
            className="h-7 w-7 text-black"
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight uppercase">
              {category.name}
            </h1>
            <Badge className="nb-badge bg-nb-yellow text-black">
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
