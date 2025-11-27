import { HeroSection } from "@/components/home/hero-section";
import { FeaturedBusinessesCarousel } from "@/components/home/featured-businesses-carousel";
import { CategoryGrid } from "@/components/home/category-grid";
import { AIToolsTeaser } from "@/components/home/ai-tools-teaser";
import { TestimonialSection } from "@/components/home/testimonial-section";
import { SEOContent } from "@/components/home/seo-content";
import { getFeaturedBusinessesFromDb } from "@/lib/data/businesses-db";
import { getCategoriesWithCounts } from "@/lib/data/categories";

// Revalidate homepage every 60 seconds to pick up changes
export const revalidate = 60;

export default async function Home() {
  // Fetch featured businesses and categories with counts from database
  const [featuredBusinesses, categoriesWithCounts] = await Promise.all([
    getFeaturedBusinessesFromDb(),
    getCategoriesWithCounts(),
  ]);

  return (
    <main className="flex-1 container mx-auto px-4">
      <HeroSection />
      <FeaturedBusinessesCarousel businesses={featuredBusinesses} />
      <CategoryGrid categories={categoriesWithCounts} />
      <AIToolsTeaser />
      <TestimonialSection />
      <SEOContent />
    </main>
  );
}
