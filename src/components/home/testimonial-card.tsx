import Image from "next/image";
import { Quote } from "lucide-react";
import type { Testimonial } from "@/lib/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="nb-card bg-card p-6">
      <div className="relative">
        <Quote className="absolute -top-2 -left-2 h-14 w-14 text-nb-pink/30" />
      </div>
      <blockquote className="mt-4 text-lg font-bold leading-relaxed">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <div className="mt-6 flex items-center gap-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-none border-2 border-nb-border">
          <Image
            src={testimonial.personImage}
            alt={testimonial.personName}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div>
          <p className="font-bold">{testimonial.personName}</p>
          <p className="text-sm text-muted-foreground">
            {testimonial.personTitle}, {testimonial.businessName}
          </p>
        </div>
      </div>
    </div>
  );
}
