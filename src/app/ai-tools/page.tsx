import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";
import { auth } from "@/lib/auth";
import { SectionHero } from "@/components/marketing/section-hero";
import { AIPricingSection } from "@/components/marketing/ai-pricing-section";
import { DashboardToolCard } from "@/components/dashboard/dashboard-tool-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIToolsShowcase } from "./ai-tools-showcase";
import { aiTools, getFreeTools, getPremiumTools } from "@/lib/data/ai-tools";
import { db } from "@/lib/db";
import { business, businessTool, creditTransaction } from "@/lib/schema";
import { eq, and, or, count, sql } from "drizzle-orm";
import { getSubscriptionInfo, hasOwnApiKey, checkSoftCap } from "@/lib/services/token-system";
import type { AITool } from "@/lib/types";

export const metadata: Metadata = {
  title: "AI Tools for Local Businesses | FreddyBeach Directory",
  description:
    "Save hours every week with AI-powered tools designed for Fredericton businesses. Generate review responses, social posts, business descriptions, and more.",
  openGraph: {
    title: "AI Tools for Local Businesses | FreddyBeach Directory",
    description:
      "Save hours every week with AI-powered tools designed for Fredericton businesses.",
  },
};

export default async function AIToolsPage() {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // For authenticated users, fetch usage data
  let usageData = null;
  if (session?.user?.id) {
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
    const userTier: "free" | "enhanced" | "featured" =
      hasByok || subscriptionInfo.isActive ? "featured" : "free";

    const usageLimits = {
      free: 10,
      enhanced: 500,
      featured: 500,
    };

    const isUnlimited = hasByok;
    const usageLimit = isUnlimited ? Infinity : usageLimits[userTier];
    const usageRemaining = isUnlimited ? Infinity : Math.max(0, usageLimit - (userTier === "free" ? totalUsage : softCapStatus.usage));
    const usagePercentage = isUnlimited ? 0 : ((userTier === "free" ? totalUsage : softCapStatus.usage) / usageLimit) * 100;
    const isNearingLimit = !isUnlimited && usagePercentage >= 80;

    usageData = {
      totalUsage,
      userTier,
      isUnlimited,
      usageLimit,
      usageRemaining,
      usagePercentage,
      isNearingLimit,
      softCapUsage: softCapStatus.usage,
    };
  }

  const isAuthenticated = !!session?.user;
  const freeTools = getFreeTools();
  const premiumTools = getPremiumTools();

  // Surface per-business tools the user has been granted (e.g. Review Collector)
  // ahead of generic free tools, so a freshly-granted tool isn't buried.
  let unlockedPerBusinessSlugs: Set<string> = new Set();
  if (session?.user?.id) {
    const grantedRows = await db
      .select({ toolSlug: businessTool.toolSlug })
      .from(businessTool)
      .innerJoin(business, eq(businessTool.businessId, business.id))
      .where(
        and(
          or(
            eq(business.ownerId, session.user.id),
            eq(business.submittedById, session.user.id)
          ),
          sql`${businessTool.expiresAt} is null or ${businessTool.expiresAt} > now()`
        )
      );
    unlockedPerBusinessSlugs = new Set(grantedRows.map((r) => r.toolSlug));
  }

  const perBusinessAccessSlugs = new Set(
    aiTools
      .filter((t) => t.accessModel === "per-business" && unlockedPerBusinessSlugs.has(t.slug))
      .map((t) => t.slug)
  );

  // Build Quick Access: granted per-business tools first, then standard free tools.
  const quickAccessTools: AITool[] = [
    ...aiTools.filter((t) => perBusinessAccessSlugs.has(t.slug)),
    ...freeTools.filter(
      (t) =>
        // Skip per-business tools here — they're either already at the top
        // (if granted) or shouldn't tease in Quick Access (if not granted).
        t.accessModel !== "per-business"
    ),
  ].slice(0, 4);

  return (
    <div className="flex-1">
      {/* Authenticated User Dashboard Section */}
      {isAuthenticated && usageData && (
        <section className="border-b-2 border-nb-border bg-muted/30 py-8">
          <div className="container mx-auto space-y-6 px-4">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold uppercase">AI Tools</h1>
                <p className="text-muted-foreground">
                  Powerful AI-powered tools to grow your business
                </p>
              </div>
              <Badge className="nb-badge bg-nb-yellow text-black w-fit text-sm">
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                {usageData.isUnlimited
                  ? "Unlimited"
                  : `${usageData.usageRemaining}/${usageData.usageLimit} remaining`}
              </Badge>
            </div>

            {/* Usage Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Monthly Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {usageData.isUnlimited ? (
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
                          {usageData.userTier === "free" ? usageData.totalUsage : usageData.softCapUsage} of {usageData.usageLimit} generations used
                        </span>
                        <span className="font-medium">
                          {Math.round(usageData.usagePercentage)}%
                        </span>
                      </div>
                      <Progress value={usageData.usagePercentage} className="h-2" />
                    </div>
                    {usageData.isNearingLimit && usageData.userTier === "free" && (
                      <div className="flex items-center justify-between rounded-lg bg-amber-500/10 p-3 text-sm">
                        <p className="text-amber-700 dark:text-amber-400">
                          You&apos;re nearing your monthly limit. Upgrade for more generations.
                        </p>
                        <Button size="sm" variant="outline" asChild>
                          <Link href="#pricing">Upgrade</Link>
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Access Tools */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold uppercase tracking-wide">Quick Access</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {quickAccessTools.map((tool) => (
                  <DashboardToolCard
                    key={tool.id}
                    tool={tool}
                    usageCount={usageData.totalUsage}
                    userTier={usageData.userTier}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section - Only show for non-authenticated users */}
      {!isAuthenticated && (
        <SectionHero
          title="AI Tools That Work While You Run Your Business"
          subtitle="Save hours every week with AI-powered tools designed specifically for Fredericton local businesses. Respond to reviews, create social content, and market your business—all in seconds."
          badges={["Free Tools Available", "No Credit Card Required"]}
          gradient
          secondaryCTA={{
            text: "More Info",
            href: "#pricing",
          }}
        />
      )}

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <div className="h-2 bg-nb-orange border-2 border-nb-border mb-6 mx-auto max-w-xs" />
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl uppercase">
              Simple, Flexible Pricing
            </h2>
            <p className="text-muted-foreground">
              Pay per generation, subscribe for unlimited access, or use your
              own API key for free.
            </p>
          </div>
          <AIPricingSection className="mx-auto max-w-5xl" />
        </div>
      </section>

      {/* Interactive Demos & All Tools - Client Component */}
      <AIToolsShowcase />
    </div>
  );
}
