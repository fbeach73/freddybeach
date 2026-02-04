import Link from "next/link";
import { DynamicIcon } from "@/lib/utils/icons";
import type { Category } from "@/lib/types";

const ACCENT_COLORS = [
  "bg-nb-yellow",
  "bg-nb-blue",
  "bg-nb-pink",
  "bg-nb-green",
  "bg-nb-orange",
];

interface CategoryCardProps {
  category: Category;
  index?: number;
}

export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <Link href={`/${category.slug}`}>
      <div className="nb-card bg-card h-full">
        <div className={`h-1.5 ${accentColor} border-b-2 border-nb-border`} />
        <div className="flex flex-col items-center p-4 text-center">
          <div className={`flex h-12 w-12 items-center justify-center ${accentColor} border-2 border-nb-border`}>
            <DynamicIcon name={category.icon} className="h-6 w-6 text-black" />
          </div>
          <h3 className="mt-3 font-bold">{category.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground font-bold">
            {category.businessCount} {category.businessCount === 1 ? "business" : "businesses"}
          </p>
        </div>
      </div>
    </Link>
  );
}
