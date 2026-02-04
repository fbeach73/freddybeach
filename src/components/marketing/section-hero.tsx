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
        "relative py-16 md:py-24 lg:py-32 border-b-2 border-nb-border",
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
                <Badge key={index} className="nb-badge bg-nb-yellow text-black">
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl uppercase">
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
                <Button asChild size="lg" className="nb-btn bg-nb-green text-black hover:bg-nb-green">
                  <Link href={primaryCTA.href}>{primaryCTA.text}</Link>
                </Button>
              )}
              {secondaryCTA && (
                <Button
                  asChild
                  size="lg"
                  className="nb-btn bg-card text-foreground hover:bg-card"
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
