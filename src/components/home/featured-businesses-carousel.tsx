"use client";

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
import { SectionHeader } from "@/components/shared/page-header";
import { BusinessCard } from "@/components/home/business-card";
import type { Business } from "@/lib/types";

interface FeaturedBusinessesCarouselProps {
  businesses: Business[];
}

export function FeaturedBusinessesCarousel({ businesses }: FeaturedBusinessesCarouselProps) {
  if (businesses.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <SectionHeader
        title="Featured Businesses"
        description="Discover top-rated local businesses in Fredericton"
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/search?featured=true" className="flex items-center gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />
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
          <CarouselPrevious className="hidden sm:flex left-0 -translate-x-1/2" />
          <CarouselNext className="hidden sm:flex right-0 translate-x-1/2" />
        </Carousel>
      </div>
    </section>
  );
}
