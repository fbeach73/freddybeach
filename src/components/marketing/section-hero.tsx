"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CTAProps {
  text: string;
  href: string;
  variant?: "default" | "outline" | "secondary";
}

interface SectionHeroProps {
  title: string;
  subtitle?: string;
  badges?: string[];
  primaryCTA?: CTAProps;
  secondaryCTA?: CTAProps;
  gradient?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function SectionHero({
  title,
  subtitle,
  badges,
  primaryCTA,
  secondaryCTA,
  gradient = false,
  className,
  children,
}: SectionHeroProps) {
  return (
    <section
      className={cn(
        "relative py-16 md:py-24 lg:py-32",
        gradient &&
          "bg-gradient-to-br from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:via-background dark:to-secondary/10",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          {badges && badges.length > 0 && (
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {badges.map((badge, index) => (
                <Badge key={index} variant="secondary">
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              {subtitle}
            </p>
          )}

          {(primaryCTA || secondaryCTA) && (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {primaryCTA && (
                <Button asChild size="lg" variant={primaryCTA.variant || "default"}>
                  <Link href={primaryCTA.href}>{primaryCTA.text}</Link>
                </Button>
              )}
              {secondaryCTA && (
                <Button
                  asChild
                  size="lg"
                  variant={secondaryCTA.variant || "outline"}
                >
                  <Link href={secondaryCTA.href}>{secondaryCTA.text}</Link>
                </Button>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </section>
  );
}
