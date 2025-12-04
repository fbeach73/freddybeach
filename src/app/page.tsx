import { AIHeroSection } from "@/components/home/ai-hero-section";
import { FeaturedBusinessesSection } from "@/components/home/featured-businesses-section";
import { AIToolsGrid } from "@/components/home/ai-tools-grid";
import { TestimonialsSlider } from "@/components/home/testimonials-slider";
import { ConsultationCTA } from "@/components/home/consultation-cta";
import { getFeaturedBusinessesFromDb } from "@/lib/data/businesses-db";

// Revalidate homepage every 60 seconds to pick up changes
export const revalidate = 60;

export default async function Home() {
  // Fetch featured businesses from database
  const featuredBusinesses = await getFeaturedBusinessesFromDb();

  return (
    <div className="flex-1">
      {/* Hero Section - Full Width */}
      <div className="container mx-auto px-4">
        <AIHeroSection />
      </div>

      {/* Main Content Sections */}
      <div className="container mx-auto px-4">
        <FeaturedBusinessesSection businesses={featuredBusinesses} />
        <AIToolsGrid />
        <TestimonialsSlider />
      </div>

      {/* Consultation CTA - Full Width */}
      <ConsultationCTA />
    </div>
  );
}
