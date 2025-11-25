"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PricingTier } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";

interface PricingCardProps {
  tier: PricingTier;
  className?: string;
  highlighted?: boolean;
}

export function PricingCard({
  tier,
  className,
  highlighted = false,
}: PricingCardProps) {
  const isPopular = tier.isPopular || highlighted;

  return (
    <Card
      className={cn(
        "relative flex flex-col",
        isPopular && "border-primary shadow-lg ring-2 ring-primary/20",
        className
      )}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-xl">{tier.name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">{tier.priceLabel}</span>
          {tier.period && (
            <span className="text-muted-foreground">/{tier.period}</span>
          )}
        </div>
        <CardDescription className="mt-2">{tier.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          asChild
          className="w-full"
          variant={isPopular ? "default" : "outline"}
          size="lg"
        >
          <Link href={tier.price === 0 ? "/claim" : `/pricing/${tier.id}`}>
            {tier.ctaText}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
