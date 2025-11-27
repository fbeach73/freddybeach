import { HeroSection } from "@/components/home/hero-section";
import { FeaturedBusinessesCarousel } from "@/components/home/featured-businesses-carousel";
import { CategoryGrid } from "@/components/home/category-grid";
import { AIToolsTeaser } from "@/components/home/ai-tools-teaser";
import { TestimonialSection } from "@/components/home/testimonial-section";
import { SEOContent } from "@/components/home/seo-content";
import { getFeaturedBusinessesFromDb } from "@/lib/data/businesses-db";

export default async function Home() {
  // Fetch featured businesses from database
  const featuredBusinesses = await getFeaturedBusinessesFromDb();

  return (
    <main className="flex-1 container mx-auto px-4">
      <HeroSection />
      <FeaturedBusinessesCarousel businesses={featuredBusinesses} />
      <CategoryGrid />
      <AIToolsTeaser />
      <TestimonialSection />
      <SEOContent />
    </main>
  );
}
