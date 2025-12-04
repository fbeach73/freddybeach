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
import { cn } from "@/lib/utils";
import { Check, Coins, Key, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { creditPackages, byokOption } from "@/lib/data/packages";

interface AIPricingSectionProps {
  className?: string;
}

export function AIPricingSection({ className }: AIPricingSectionProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Two-column pricing grid */}
      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        {/* Left Column: Credit Packs */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold">Credit Packs</h3>
              <p className="text-sm text-muted-foreground">
                Pay as you go - credits never expire
              </p>
            </div>
          </div>

          {creditPackages.map((pack) => (
            <Card
              key={pack.id}
              className={cn(
                "relative",
                pack.isPopular &&
                  "border-primary shadow-md ring-2 ring-primary/20"
              )}
            >
              {pack.isPopular && (
                <Badge className="absolute -top-2.5 left-4">Most Popular</Badge>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{pack.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {pack.credits} credits · {pack.pricePerCredit}/credit
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">{pack.priceLabel}</span>
                    <p className="text-xs text-muted-foreground">one-time</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-3">
                <ul className="grid gap-1.5 text-sm">
                  {pack.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={pack.isPopular ? "default" : "outline"}
                  size="sm"
                >
                  <Link href={`/dashboard/billing?purchase=${pack.id}`}>
                    Buy {pack.credits} Credits
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Right Column: FREE BYOK (Limited Time Promotion) */}
        <Card className="relative flex flex-col border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white dark:border-emerald-900 dark:from-emerald-950/30 dark:to-background">
          <Badge
            variant="secondary"
            className="absolute -top-2.5 left-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
          >
            <Clock className="mr-1 h-3 w-3" />
            Limited Time Offer
          </Badge>

          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Key className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-xl">{byokOption.name}</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {byokOption.priceLabel}
              </span>
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
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
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
            <Button
              asChild
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              <Link href="/dashboard/billing#api-key">Configure API Key</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
