import { notFound } from "next/navigation";
import { categories, getCategoryBySlug } from "@/lib/data/categories";
import { getBusinessesByCategory } from "@/lib/data/businesses";
import { CategoryPageClient } from "./category-page-client";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} in Fredericton | Freddy Beach Directory`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const businesses = getBusinessesByCategory(categorySlug);

  return (
    <main className="container mx-auto px-4 py-8">
      <CategoryPageClient
        category={category}
        businesses={businesses}
      />
    </main>
  );
}
