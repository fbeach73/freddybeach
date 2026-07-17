import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import {
  ArrowRight,
  Image as ImageIcon,
  LucideIcon,
  Mail,
  MessageSquareText,
  PenLine,
  Share2,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { FoundingMemberBanner } from "@/components/marketing/founding-member-banner";
import { ReviewCollectorDemoWidget } from "@/components/home/review-collector-demo-widget";
import { ToolCostBadge } from "@/components/shared/tier-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getToolBySlug,
  getToolsByCategory,
  TOOL_CATEGORIES,
} from "@/lib/data/ai-tools";
import { PLANS } from "@/lib/data/plans";
import { getUserTierData } from "@/lib/services/token-system";
import type { AITool } from "@/lib/types";

export const metadata: Metadata = {
  title: "AI Tools for Atlantic Canada Small Business | FreddyBeach",
  description:
    "Six AI tools built for Atlantic Canada small businesses. Reply to reviews, write posts and emails, make images — 10 free credits every month, no credit card.",
  openGraph: {
    title: "AI Tools for Atlantic Canada Small Business | FreddyBeach",
    description:
      "Six AI tools built for Atlantic Canada small businesses. 10 free credits every month.",
  },
};

const iconMap: Record<string, LucideIcon> = {
  MessageSquareText,
  Share2,
  PenLine,
  Mail,
  Star,
  Image: ImageIcon,
};

// A friendly tool card: what it does, what it costs, a peek at real output
function ToolHubCard({ tool }: { tool: AITool }) {
  const Icon = iconMap[tool.icon] || Sparkles;

  return (
    <Card className="nb-card flex flex-col bg-card">
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 items-center justify-center bg-nb-blue/20 border-2 border-nb-border">
            <Icon className="h-5 w-5" />
          </div>
          <ToolCostBadge costLabel={tool.costLabel} size="sm" />
        </div>

        <h3 className="mt-3 font-bold">{tool.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {tool.shortDescription}
        </p>

        {/* Example peek — a taste of the real output */}
        <div className="mt-3 flex-1">
          <p className="border-2 border-nb-border/20 bg-muted/50 p-3 text-xs text-muted-foreground line-clamp-4 whitespace-pre-wrap">
            {tool.exampleOutput}
          </p>
        </div>

        <Button size="sm" className="mt-4 w-full" asChild>
          <Link href={`/ai-tools/${tool.slug}`}>
            Try it
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function AIToolsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAuthenticated = !!session?.user;

  // Friendly usage meter for signed-in users
  const tierData = session?.user?.id
    ? await getUserTierData(session.user.id)
    : null;

  const reviewCollector = getToolBySlug("review-collector");

  return (
    <div className="flex-1">
      {/* Founding member strip */}
      <div className="container mx-auto px-4 pt-6">
        <FoundingMemberBanner variant="compact" />
      </div>

      {/* Hero (signed-out) / usage meter (signed-in) */}
      {!isAuthenticated ? (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="nb-badge bg-nb-yellow text-black mb-6">
                No credit card required
              </Badge>
              <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl uppercase">
                AI tools that do the boring stuff for you
              </h1>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                Review replies, social posts, emails, images — each one takes
                seconds, not an afternoon. Every account gets 10 free credits a
                month.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <AuthDialog defaultTab="sign-up">
                  <Button size="lg" className="nb-btn bg-nb-green text-black hover:bg-nb-green">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create a free account
                  </Button>
                </AuthDialog>
                <Button
                  asChild
                  size="lg"
                  className="nb-btn bg-card text-foreground hover:bg-card"
                >
                  <Link href="#tools">See the tools</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        tierData && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <Card className="nb-card bg-card">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-xl font-bold uppercase">Your toolkit</h1>
                      <p className="text-sm text-muted-foreground">
                        {tierData.hasByok
                          ? "Unlimited — you're using your own API key."
                          : tierData.hasSubscription &&
                              tierData.subscriptionTier === "pro"
                            ? `${tierData.monthlyUsage} of ${tierData.softCapLimit} generations used this month.`
                            : `${tierData.creditsRemaining} credit${tierData.creditsRemaining === 1 ? "" : "s"} left this month.`}
                      </p>
                    </div>
                    <Badge className="nb-badge bg-nb-yellow text-black w-fit text-sm">
                      <Zap className="mr-1.5 h-3.5 w-3.5" />
                      {tierData.hasByok
                        ? "Unlimited"
                        : tierData.hasSubscription &&
                            tierData.subscriptionTier === "pro"
                          ? "Pro"
                          : `${tierData.creditsRemaining} credits`}
                    </Badge>
                  </div>

                  {/* Pro soft-cap progress */}
                  {!tierData.hasByok &&
                    tierData.hasSubscription &&
                    tierData.subscriptionTier === "pro" && (
                      <Progress
                        value={Math.min(
                          100,
                          (tierData.monthlyUsage / tierData.softCapLimit) * 100
                        )}
                        className="mt-4 h-2"
                      />
                    )}

                  {/* Upgrade nudge near depletion */}
                  {!tierData.hasByok &&
                    !tierData.hasSubscription &&
                    tierData.creditsRemaining <= 3 && (
                      <div className="mt-4 flex flex-col items-start gap-3 border-2 border-nb-border bg-nb-yellow/20 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <p>
                          Running low? {PLANS.starter.name} gives you{" "}
                          {PLANS.starter.allowance.monthlyCredits} credits every
                          month for {PLANS.starter.priceLabel}.
                        </p>
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/pricing">See plans</Link>
                        </Button>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>
          </section>
        )
      )}

      {/* Flagship: Review Collector, pinned first */}
      {reviewCollector && (
        <section className="border-y-2 border-nb-border bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-2">
              <div>
                <Badge className="nb-badge bg-nb-green text-black mb-4">
                  <Star className="mr-1.5 h-3.5 w-3.5" />
                  Start here — it&apos;s free
                </Badge>
                <h2 className="text-2xl font-bold uppercase tracking-tight md:text-3xl">
                  {reviewCollector.name}
                </h2>
                <p className="mt-3 text-muted-foreground">
                  {reviewCollector.shortDescription} Happy customers get routed
                  to Google. Unhappy ones reach you privately — before they post.
                </p>
                <Button className="mt-6 nb-btn bg-nb-green text-black hover:bg-nb-green" asChild>
                  <Link href="/ai-tools/review-collector">
                    Set it up free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mx-auto w-full max-w-md">
                <ReviewCollectorDemoWidget />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tools by category */}
      <section id="tools" className="py-12 md:py-16">
        <div className="container mx-auto space-y-12 px-4">
          {TOOL_CATEGORIES.map((category) => {
            // Review Collector is pinned above as the flagship
            const tools = getToolsByCategory(category.id).filter(
              (t) => t.slug !== "review-collector"
            );
            if (tools.length === 0) return null;

            return (
              <div key={category.id} className="mx-auto max-w-5xl">
                <div className="mb-6">
                  <h2 className="text-xl font-bold uppercase tracking-tight">
                    {category.name}
                  </h2>
                  <p className="text-muted-foreground">{category.tagline}</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool) => (
                    <ToolHubCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-t-2 border-nb-border bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-3 text-2xl font-bold uppercase tracking-tight">
              Simple pricing
            </h2>
            <p className="mb-6 text-muted-foreground">
              Every text tool costs 1 credit. Free accounts get 10 credits a
              month, {PLANS.starter.name} gets{" "}
              {PLANS.starter.allowance.monthlyCredits} for{" "}
              {PLANS.starter.priceLabel}, and {PLANS.pro.name} is unlimited for{" "}
              {PLANS.pro.priceLabel}.
            </p>
            <Button size="lg" asChild className="nb-btn bg-nb-yellow text-black hover:bg-nb-yellow">
              <Link href="/pricing">
                See all plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
