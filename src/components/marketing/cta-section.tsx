"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TrustSignals } from "./trust-signals";

interface CTAProps {
  text: string;
  href: string;
  variant?: "default" | "outline" | "secondary";
}

interface Stat {
  label: string;
  value: string;
  icon?: string;
}

interface CTASectionProps {
  headline: string;
  subheadline?: string;
  primaryCTA: CTAProps;
  secondaryCTA?: CTAProps;
  stats?: Stat[];
  className?: string;
}

export function CTASection({
  headline,
  subheadline,
  primaryCTA,
  secondaryCTA,
  stats,
  className,
}: CTASectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden py-16 md:py-24",
        "bg-gradient-to-br from-primary/10 via-background to-secondary/10",
        "dark:from-primary/20 dark:via-background dark:to-secondary/20",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
            {headline}
          </h2>

          {subheadline && (
            <p className="mb-8 text-lg text-muted-foreground">
              {subheadline}
            </p>
          )}

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant={primaryCTA.variant || "default"}>
              <Link href={primaryCTA.href}>{primaryCTA.text}</Link>
            </Button>

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

          {stats && stats.length > 0 && (
            <div className="mt-12">
              <TrustSignals stats={stats} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
