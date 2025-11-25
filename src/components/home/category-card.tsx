import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { DynamicIcon } from "@/lib/utils/icons";
import type { Category } from "@/lib/types";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/category/${category.slug}`}>
      <Card className="group h-full transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col items-center p-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <DynamicIcon name={category.icon} className="h-6 w-6" />
          </div>
          <h3 className="mt-3 font-medium">{category.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {category.businessCount} {category.businessCount === 1 ? "business" : "businesses"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
