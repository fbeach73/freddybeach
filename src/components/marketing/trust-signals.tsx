"use client";

import { cn } from "@/lib/utils";
import {
  Award,
  Building2,
  Clock,
  Shield,
  Star,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  clock: Clock,
  star: Star,
  award: Award,
  shield: Shield,
  building: Building2,
  trending: TrendingUp,
};

interface Stat {
  label: string;
  value: string;
  icon?: string;
}

interface TrustSignalsProps {
  stats: Stat[];
  testimonial?: {
    quote: string;
    author: string;
    title?: string;
  };
  className?: string;
}

export function TrustSignals({
  stats,
  testimonial,
  className,
}: TrustSignalsProps) {
  return (
    <div className={cn("space-y-8", className)}>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon ? iconMap[stat.icon] : null;
          return (
            <div key={index} className="text-center">
              {Icon && (
                <Icon className="mx-auto mb-2 h-6 w-6 text-primary" />
              )}
              <div className="text-2xl font-bold md:text-3xl">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {testimonial && (
        <blockquote className="mx-auto max-w-2xl rounded-lg border bg-card p-6 text-center">
          <p className="mb-4 text-lg italic text-muted-foreground">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <footer>
            <cite className="not-italic">
              <span className="font-semibold">{testimonial.author}</span>
              {testimonial.title && (
                <span className="text-muted-foreground">
                  {" "}
                  &mdash; {testimonial.title}
                </span>
              )}
            </cite>
          </footer>
        </blockquote>
      )}
    </div>
  );
}
