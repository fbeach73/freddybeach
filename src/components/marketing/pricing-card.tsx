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
import { AuthDialog } from "@/components/auth/auth-dialog";
import { SubscribeButton } from "@/components/billing";
import type { PricingTier } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

interface PricingCardProps {
  tier: PricingTier;
  className?: string;
  highlighted?: boolean;
  /** Signed-in users get direct checkout; signed-out users get the sign-up dialog */
  isAuthenticated?: boolean;
}

// Plan ids that map straight to the Stripe subscription checkout
const SUBSCRIBABLE_PLANS = ["starter", "pro"] as const;
type SubscribablePlan = (typeof SUBSCRIBABLE_PLANS)[number];

function isSubscribablePlan(id: string): id is SubscribablePlan {
  return SUBSCRIBABLE_PLANS.includes(id as SubscribablePlan);
}

export function PricingCard({
  tier,
  className,
  highlighted = false,
  isAuthenticated = false,
}: PricingCardProps) {
  const isPopular = tier.isPopular || highlighted;

  const cta = (() => {
    if (!isAuthenticated) {
      return (
        <AuthDialog defaultTab="sign-up">
          <Button
            className="w-full"
            variant={isPopular ? "default" : "outline"}
            size="lg"
          >
            {tier.ctaText}
          </Button>
        </AuthDialog>
      );
    }

    if (isSubscribablePlan(tier.id)) {
      return (
        <SubscribeButton
          plan={tier.id}
          className="w-full"
          variant={isPopular ? "default" : "outline"}
          size="lg"
        >
          {tier.ctaText}
        </SubscribeButton>
      );
    }

    // Free plan for signed-in users: straight to the tools
    return (
      <Button
        asChild
        className="w-full"
        variant={isPopular ? "default" : "outline"}
        size="lg"
      >
        <Link href="/ai-tools">{tier.ctaText}</Link>
      </Button>
    );
  })();

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
        {tier.foundingPriceLabel && (
          <p className="mt-2 inline-flex items-center justify-center gap-1 border-2 border-nb-border bg-nb-yellow px-2 py-1 text-xs font-bold text-black">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {tier.foundingPriceLabel}
          </p>
        )}
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

      <CardFooter>{cta}</CardFooter>
    </Card>
  );
}
