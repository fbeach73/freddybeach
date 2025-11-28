import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/page-header";
import { TestimonialCard } from "@/components/home/testimonial-card";
import { getFeaturedTestimonials } from "@/lib/data";

export function TestimonialSection() {
  const featuredTestimonials = getFeaturedTestimonials();
  const testimonial = featuredTestimonials[0];

  if (!testimonial) {
    return null;
  }

  return (
    <section className="py-16">
      <SectionHeader
        title="What Local Businesses Are Saying"
        description="Success stories from businesses using our platform"
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/success-stories" className="flex items-center gap-1">
              Read more stories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />
      <div className="mt-8 max-w-3xl">
        <TestimonialCard testimonial={testimonial} />
      </div>
    </section>
  );
}
