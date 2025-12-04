import { HeroSection } from "@/components/home/hero-section";
import { FeaturedBusinessesWrapper } from "@/components/home/featured-businesses-wrapper";
import { CategoryGrid } from "@/components/home/category-grid";
import { AIToolsTeaser } from "@/components/home/ai-tools-teaser";
import { TestimonialSection } from "@/components/home/testimonial-section";
import { SEOContent } from "@/components/home/seo-content";
import { getFeaturedBusinessesFromDb } from "@/lib/data/businesses-db";
import { getCategoriesWithCounts } from "@/lib/data/categories-db";

// Backup of original homepage from Dec 4, 2025
// This page is accessible at /home-12-04-25

// Revalidate homepage every 60 seconds to pick up changes
export const revalidate = 60;

export default async function OriginalHome() {
  // Fetch featured businesses and categories with counts from database
  const [featuredBusinesses, categoriesWithCounts] = await Promise.all([
    getFeaturedBusinessesFromDb(),
    getCategoriesWithCounts(),
  ]);

  return (
    <div className="flex-1 container mx-auto px-4 pb-8">
      <HeroSection />
      <FeaturedBusinessesWrapper businesses={featuredBusinesses} />
      <CategoryGrid categories={categoriesWithCounts} />
      <AIToolsTeaser />
      <TestimonialSection />
      <SEOContent />
    </div>
  );
}
