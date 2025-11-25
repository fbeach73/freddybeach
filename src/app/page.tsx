import { HeroSection } from "@/components/home/hero-section";
import { FeaturedBusinessesCarousel } from "@/components/home/featured-businesses-carousel";
import { CategoryGrid } from "@/components/home/category-grid";
import { AIToolsTeaser } from "@/components/home/ai-tools-teaser";
import { TestimonialSection } from "@/components/home/testimonial-section";
import { SEOContent } from "@/components/home/seo-content";

export default function Home() {
  return (
    <main className="flex-1 container mx-auto px-4">
      <HeroSection />
      <FeaturedBusinessesCarousel />
      <CategoryGrid />
      <AIToolsTeaser />
      <TestimonialSection />
      <SEOContent />
    </main>
  );
}
