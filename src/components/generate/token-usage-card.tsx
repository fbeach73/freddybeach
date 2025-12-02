"use client";

import { Sparkles, TrendingUp, AlertTriangle, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TokenUsageCardProps {
  used: number;
  limit: number;
  tier: string;
  month?: string;
  hasApiKey?: boolean;
  onUpgrade?: () => void;
  onAddApiKey?: () => void;
}

export function TokenUsageCard({
  used,
  limit,
  tier,
  month,
  hasApiKey = false,
  onUpgrade,
  onAddApiKey,
}: TokenUsageCardProps) {
  const remaining = Math.max(0, limit - used);
  const percentUsed = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const isNearLimit = percentUsed >= 80;
  const isAtLimit = used >= limit;

  // Format month for display
  const formatMonth = (monthStr?: string) => {
    if (!monthStr) return "";
    const [year, mon] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(mon) - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  // If user has their own API key, show unlimited status
  if (hasApiKey) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5" />
              Generation Usage
            </CardTitle>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Key className="mr-1 h-3 w-3" />
              Unlimited
            </Badge>
          </div>
          <CardDescription>Using your own API key</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-lg bg-green-50 py-8 dark:bg-green-950/30">
            <div className="text-center">
              <Sparkles className="mx-auto mb-2 h-8 w-8 text-green-600 dark:text-green-400" />
              <p className="font-medium text-green-800 dark:text-green-200">
                Unlimited Generations
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                No limits when using your own key
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5" />
            Generation Usage
          </CardTitle>
          <Badge variant="secondary" className="capitalize">
            {tier} Tier
          </Badge>
        </div>
        {month && (
          <CardDescription>{formatMonth(month)}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {used} of {limit} generations used
            </span>
            <span
              className={cn(
                "font-medium",
                isAtLimit
                  ? "text-destructive"
                  : isNearLimit
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-muted-foreground"
              )}
            >
              {percentUsed}%
            </span>
          </div>
          <Progress
            value={percentUsed}
            className={cn(
              "h-2",
              isAtLimit
                ? "[&>div]:bg-destructive"
                : isNearLimit
                  ? "[&>div]:bg-yellow-500"
                  : ""
            )}
          />
        </div>

        {/* Remaining Count */}
        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
          <span className="text-sm text-muted-foreground">Remaining</span>
          <span
            className={cn(
              "text-2xl font-bold",
              isAtLimit
                ? "text-destructive"
                : isNearLimit
                  ? "text-yellow-600 dark:text-yellow-400"
                  : ""
            )}
          >
            {remaining}
          </span>
        </div>

        {/* Warning or Upgrade CTA */}
        {isAtLimit ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  Monthly limit reached
                </p>
                <p className="text-xs text-destructive/80">
                  Add your own API key for unlimited generations
                </p>
              </div>
            </div>
            {onAddApiKey && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={onAddApiKey}
              >
                <Key className="mr-2 h-4 w-4" />
                Add API Key
              </Button>
            )}
          </div>
        ) : isNearLimit ? (
          <div className="rounded-lg border border-yellow-500/50 bg-yellow-50 p-3 dark:bg-yellow-950/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Running low on generations
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Consider upgrading or adding your own API key
                </p>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              {onUpgrade && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={onUpgrade}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Upgrade
                </Button>
              )}
              {onAddApiKey && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={onAddApiKey}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Add Key
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            {onUpgrade && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onUpgrade}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Upgrade for More
              </Button>
            )}
            {onAddApiKey && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onAddApiKey}
              >
                <Key className="mr-2 h-4 w-4" />
                Use Own Key
              </Button>
            )}
          </div>
        )}

        {/* Tier Info */}
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium capitalize">{tier}</span> tier includes{" "}
            {limit} generations per month. Resets on the 1st of each month.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
