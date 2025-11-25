import { SectionHeader } from "@/components/shared/page-header";
import { CategoryCard } from "@/components/home/category-card";
import { categories } from "@/lib/data";

export function CategoryGrid() {
  return (
    <section className="py-12">
      <SectionHeader
        title="Browse by Category"
        description="Explore local businesses by category"
      />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
