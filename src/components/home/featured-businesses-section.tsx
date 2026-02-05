import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { BusinessCard } from "@/components/home/business-card";
import type { Business } from "@/lib/types";

interface FeaturedBusinessesSectionProps {
  businesses: Business[];
}

export function FeaturedBusinessesSection({
  businesses,
}: FeaturedBusinessesSectionProps) {
  if (businesses.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="mb-8">
        <div className="w-16 h-2 bg-nb-blue mb-4" />
        <h2 className="text-2xl md:text-3xl font-black uppercase">
          Featured Freddy Beach Businesses
        </h2>
        <p className="mt-2 text-muted-foreground">
          Discover top-rated local businesses in Freddy Beach, Fredericton
        </p>
      </div>

      <div className="mt-8">
        <Carousel
          opts={{
            align: "start",
            loop: businesses.length > 3,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {businesses.map((business) => (
              <CarouselItem
                key={business.id}
                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <BusinessCard business={business} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex left-0 -translate-x-1/2 rounded-none border-2 border-nb-border shadow-nb-sm hover:translate-x-[calc(-50%+2px)] hover:translate-y-[2px] hover:shadow-none transition-all duration-150" />
          <CarouselNext className="hidden sm:flex right-0 translate-x-1/2 rounded-none border-2 border-nb-border shadow-nb-sm hover:translate-x-[calc(50%+2px)] hover:translate-y-[2px] hover:shadow-none transition-all duration-150" />
        </Carousel>
      </div>

      <div className="mt-6 text-center">
        <Button asChild className="nb-btn bg-nb-blue text-white hover:bg-nb-blue">
          <Link href="/search" className="gap-2">
            Explore the full directory
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
