import { notFound } from "next/navigation";
import { categories, getCategoryBySlug } from "@/lib/data/categories";
import { getBusinessesByCategoryFromDb } from "@/lib/data/businesses-db";
import { CategoryPageClient } from "./category-page-client";

// Dynamic rendering - fetch fresh data from database
export const dynamic = "force-dynamic";

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

  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://freddybeach.com"}/${categorySlug}`;

  return {
    title: `${category.name} in Fredericton | Freddy Beach Directory`,
    description: category.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${category.name} in Fredericton | Freddy Beach Directory`,
      description: category.description,
      url,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  // Fetch published businesses from database
  const businesses = await getBusinessesByCategoryFromDb(category.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryPageClient
        category={category}
        businesses={businesses}
      />
    </div>
  );
}
