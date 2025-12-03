import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Lock, Sparkles, Zap } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { DashboardToolCard } from "@/components/dashboard/dashboard-tool-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { aiTools, getFreeTools, getPremiumTools } from "@/lib/data/ai-tools";
import { db } from "@/lib/db";
import { creditTransaction } from "@/lib/schema";
import { eq, and, or, count } from "drizzle-orm";
import { getSubscriptionInfo, hasOwnApiKey, checkSoftCap } from "@/lib/services/token-system";

export const metadata = {
  title: "AI Tools | Dashboard",
  description: "Access AI-powered tools for your business",
};

export default async function AIToolsPage() {
  // Server-side session validation
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Show sign-in prompt for unauthenticated users
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Protected Page</h1>
        <p className="mt-2 text-muted-foreground">
          You need to sign in to access AI Tools
        </p>
        <div className="mt-6">
          <UserProfile />
        </div>
      </div>
    );
  }

  // Fetch actual usage and subscription data
  const [aiToolUsageResult, subscriptionInfo, hasByok, softCapStatus] = await Promise.all([
    db
      .select({ count: count() })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, session.user.id),
          or(
            eq(creditTransaction.type, "usage"),
            eq(creditTransaction.type, "subscription_usage")
          )
        )
      ),
    getSubscriptionInfo(session.user.id),
    hasOwnApiKey(session.user.id),
    checkSoftCap(session.user.id),
  ]);

  const totalUsage = aiToolUsageResult[0]?.count || 0;

  // Determine user tier based on subscription status
  const userTier: "free" | "enhanced" | "featured" =
    hasByok || subscriptionInfo.isActive ? "featured" : "free";

  // Usage limits based on tier (for display purposes)
  const usageLimits = {
    free: 10,       // Free tier: 10 generations per month
    enhanced: 500,  // Subscribers: soft cap at 500
    featured: 500,  // Subscribers: soft cap at 500 (same as enhanced)
  };

  // For subscribers with BYOK, show "unlimited"
  const isUnlimited = hasByok;
  const usageLimit = isUnlimited ? Infinity : usageLimits[userTier];
  const usageRemaining = isUnlimited ? Infinity : Math.max(0, usageLimit - (userTier === "free" ? totalUsage : softCapStatus.usage));
  const usagePercentage = isUnlimited ? 0 : ((userTier === "free" ? totalUsage : softCapStatus.usage) / usageLimit) * 100;
  const isNearingLimit = !isUnlimited && usagePercentage >= 80;

  // Get tools by tier
  const freeTools = getFreeTools();
  const premiumTools = getPremiumTools();

  return (
    <div className="space-y-8">
      {/* Page Header Section */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeader
            title="AI Tools"
            description="Powerful AI-powered tools to grow your business"
          />
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              {isUnlimited
                ? "Unlimited"
                : `${usageRemaining}/${usageLimit} remaining`}
            </Badge>
          </div>
        </div>
      </section>

      {/* Usage Summary Card */}
      <section>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Monthly Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isUnlimited ? (
              <div className="flex items-center gap-3 rounded-lg bg-green-500/10 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    Unlimited Access
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Using your own API key - no limits on generations
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {userTier === "free" ? totalUsage : softCapStatus.usage} of {usageLimit} generations used
                    </span>
                    <span className="font-medium">
                      {Math.round(usagePercentage)}%
                    </span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                </div>
                {isNearingLimit && userTier === "free" && (
                  <div className="flex items-center justify-between rounded-lg bg-amber-500/10 p-3 text-sm">
                    <p className="text-amber-700 dark:text-amber-400">
                      You&apos;re nearing your monthly limit. Upgrade for more generations.
                    </p>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/ai-tools#pricing">Upgrade</Link>
                    </Button>
                  </div>
                )}
                {!isNearingLimit && (
                  <p className="text-sm text-muted-foreground">
                    Your usage resets on the 1st of each month.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Free Tools Section */}
      <section className="space-y-4">
        <SectionHeader
          title="Free Tools"
          description="Always available with your free account"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {freeTools.map((tool) => (
            <DashboardToolCard
              key={tool.id}
              tool={tool}
              usageCount={totalUsage}
              userTier={userTier}
            />
          ))}
        </div>
      </section>

      {/* Premium Tools Section */}
      <section className="space-y-4">
        <SectionHeader
          title="Premium Tools"
          description={
            userTier === "free"
              ? "Unlock these tools by upgrading your plan"
              : "Advanced tools for your business"
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {premiumTools.map((tool) => (
            <DashboardToolCard
              key={tool.id}
              tool={tool}
              usageCount={totalUsage}
              userTier={userTier}
            />
          ))}
        </div>

        {/* Unlock CTA for free users */}
        {userTier === "free" && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Unlock Premium Tools</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upgrade to Enhanced or Featured to access Business Description Writer,
                  Email Template Generator, and more powerful features.
                </p>
              </div>
              <Button asChild>
                <Link href="/ai-tools#pricing">View Plans</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
