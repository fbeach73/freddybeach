"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { TestimonialCard } from "@/components/home/testimonial-card";
import { testimonials } from "@/lib/data/testimonials";
import { cn } from "@/lib/utils";

export function TestimonialsSlider() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Use testimonials length for count since it's static
  const count = testimonials.length;

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <section className="py-16">
      <div className="mb-8">
        <div className="w-16 h-2 bg-nb-pink mb-4" />
        <h2 className="text-2xl md:text-3xl font-black uppercase">
          What Local Businesses Are Saying
        </h2>
        <p className="mt-2 text-muted-foreground">
          Real results from Fredericton businesses using our AI tools
        </p>
      </div>

      <div className="mt-8">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial) => (
              <CarouselItem
                key={testimonial.id}
                className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
              >
                <TestimonialCard testimonial={testimonial} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex left-0 -translate-x-1/2 rounded-none border-2 border-nb-border shadow-nb-sm hover:translate-x-[calc(-50%+2px)] hover:translate-y-[2px] hover:shadow-none transition-all duration-150" />
          <CarouselNext className="hidden sm:flex right-0 translate-x-1/2 rounded-none border-2 border-nb-border shadow-nb-sm hover:translate-x-[calc(50%+2px)] hover:translate-y-[2px] hover:shadow-none transition-all duration-150" />
        </Carousel>

        {/* Dot Navigation */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-3 w-3 rounded-none border-2 border-nb-border transition-all duration-200",
                index === current
                  ? "bg-nb-pink w-8 shadow-nb-sm"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
