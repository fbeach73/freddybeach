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
import { PurchaseCreditsButton } from "@/components/billing";
import { cn } from "@/lib/utils";
import { Check, Coins, Key } from "lucide-react";
import Link from "next/link";
import { creditPacks } from "@/lib/data/plans";
import { PricingGrid } from "./pricing-grid";

interface AIPricingSectionProps {
  className?: string;
  /** Signed-in users get direct checkout; signed-out users get the sign-up dialog */
  isAuthenticated?: boolean;
}

export function AIPricingSection({
  className,
  isAuthenticated = false,
}: AIPricingSectionProps) {
  return (
    <div className={cn("space-y-12", className)}>
      {/* The three plans */}
      <PricingGrid isAuthenticated={isAuthenticated} />

      {/* Credit packs — one-time top-ups */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold">Just topping up?</h3>
            <p className="text-sm text-muted-foreground">
              One-time credit packs — no subscription, credits never expire
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {creditPacks.map((pack) => (
            <Card
              key={pack.id}
              className={cn(
                "relative flex flex-col",
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

              <CardContent className="flex-1 pb-3">
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
                {isAuthenticated ? (
                  <PurchaseCreditsButton
                    packId={pack.id}
                    credits={pack.credits}
                    priceLabel={pack.priceLabel}
                    className="w-full"
                    variant={pack.isPopular ? "default" : "outline"}
                    size="sm"
                  >
                    Buy {pack.credits} Credits
                  </PurchaseCreditsButton>
                ) : (
                  <AuthDialog defaultTab="sign-up">
                    <Button
                      className="w-full"
                      variant={pack.isPopular ? "default" : "outline"}
                      size="sm"
                    >
                      Buy {pack.credits} Credits
                    </Button>
                  </AuthDialog>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* BYOK footnote */}
      <div className="flex flex-col items-start gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <Key className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold">Have your own API key?</p>
            <p className="text-sm text-muted-foreground">
              Bring your own Google Gemini key and generate for free — or go
              BYOK Pro for priority processing and higher resolutions.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/dashboard/billing#api-key">Set up your key</Link>
        </Button>
      </div>
    </div>
  );
}
