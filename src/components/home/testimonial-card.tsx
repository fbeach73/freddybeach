import Image from "next/image";
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Testimonial } from "@/lib/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <Quote className="h-8 w-8 text-primary/20" />
        <blockquote className="mt-4 text-lg leading-relaxed">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        <div className="mt-6 flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            <Image
              src={testimonial.personImage}
              alt={testimonial.personName}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div>
            <p className="font-medium">{testimonial.personName}</p>
            <p className="text-sm text-muted-foreground">
              {testimonial.personTitle}, {testimonial.businessName}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
