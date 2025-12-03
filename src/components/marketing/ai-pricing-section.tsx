"use client";

import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { Check, Coins, Crown, Key, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  creditPackages,
  subscriptionPlans,
  byokOption,
} from "@/lib/data/packages";

interface AIPricingSectionProps {
  className?: string;
}

export function AIPricingSection({ className }: AIPricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "yearly"
  );

  const creditPackage = creditPackages[0]; // 100 credits for $10
  const selectedPlan = subscriptionPlans.find(
    (plan) => plan.period === billingPeriod
  );

  return (
    <div className={cn("space-y-8", className)}>
      {/* Three-column pricing grid */}
      <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
        {/* Left Column: Credit Package */}
        <Card className="relative flex flex-col">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Coins className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-xl">{creditPackage.name}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">
                {creditPackage.priceLabel}
              </span>
              <span className="text-muted-foreground"> one-time</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {creditPackage.pricePerCredit} per credit
            </p>
            <CardDescription className="mt-2">
              {creditPackage.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1">
            <ul className="space-y-3">
              {creditPackage.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter>
            <Button asChild className="w-full" variant="outline" size="lg">
              <Link href="/dashboard/billing?purchase=credits">
                Buy Credits
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Center Column: Subscription (Featured) */}
        <Card className="relative flex flex-col border-primary shadow-lg ring-2 ring-primary/20 md:-mt-4 md:mb-4">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
            Best Value
          </Badge>

          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Unlimited Access</CardTitle>

            {/* Billing Period Toggle */}
            <div className="mx-auto mt-4 flex items-center rounded-full border bg-muted/50 p-1">
              <button
                type="button"
                onClick={() => setBillingPeriod("monthly")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  billingPeriod === "monthly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod("yearly")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  billingPeriod === "yearly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Yearly
              </button>
            </div>

            <div className="mt-4">
              <span className="text-4xl font-bold">
                {selectedPlan?.priceLabel}
              </span>
              <span className="text-muted-foreground">
                /{billingPeriod === "monthly" ? "mo" : "yr"}
              </span>
            </div>
            {billingPeriod === "yearly" && selectedPlan?.yearlyEquivalent && (
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                {selectedPlan.yearlyEquivalent} &middot; Save 43%
              </p>
            )}
            <CardDescription className="mt-2">
              {selectedPlan?.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1">
            <ul className="space-y-3">
              {selectedPlan?.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter>
            <Button asChild className="w-full" size="lg">
              <Link
                href={`/dashboard/billing?subscribe=${billingPeriod}`}
              >
                Subscribe Now
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Right Column: BYOK (Bring Your Own Key) */}
        <Card className="relative flex flex-col">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Key className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-xl">{byokOption.name}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">{byokOption.priceLabel}</span>
              <span className="text-muted-foreground"> forever</span>
            </div>
            <CardDescription className="mt-2">
              {byokOption.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 space-y-4">
            <ul className="space-y-3">
              {byokOption.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                    Requirements
                  </p>
                  <ul className="space-y-1">
                    {byokOption.requirements.map((req, index) => (
                      <li
                        key={index}
                        className="text-xs text-amber-700 dark:text-amber-400"
                      >
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button asChild className="w-full" variant="outline" size="lg">
              <Link href="/dashboard/settings?tab=api-keys">
                Configure API Key
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
