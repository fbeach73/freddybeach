import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import {
  MessageSquareText,
  Share2,
  PenLine,
  Mail,
  Image as ImageIcon,
  LucideIcon,
  ArrowLeft,
  ArrowRight,
  Zap,
  Sparkles,
  Star,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { ToolCostBadge } from "@/components/shared/tier-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIToolInterface } from "@/components/dashboard/ai-tool-interface";
import { aiTools, getToolBySlug } from "@/lib/data/ai-tools";
import { db } from "@/lib/db";
import { creditTransaction } from "@/lib/schema";
import { eq, and, or, count } from "drizzle-orm";
import { getUserTierData } from "@/lib/services/token-system";

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  MessageSquareText,
  Share2,
  PenLine,
  Mail,
  Star,
  Image: ImageIcon,
};

// Generate static params for all AI tools
export async function generateStaticParams() {
  return aiTools.map((tool) => ({
    slug: tool.slug,
  }));
}

// Generate metadata for each tool page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool Not Found | AI Tools",
    };
  }

  return {
    title: `${tool.name} | AI Tools`,
    description: tool.shortDescription,
  };
}

export default async function AIToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Redirect image-generator to its dedicated page
  if (slug === "image-generator") {
    redirect("/ai-tools/image-generator");
  }

  const tool = getToolBySlug(slug);

  // Show 404 if tool not found
  if (!tool) {
    notFound();
  }

  // Server-side session validation
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Review Collector has its own per-business surface for signed-in users.
  // Unauthenticated visitors fall through to the standard preview below.
  if (slug === "review-collector" && session) {
    redirect("/ai-tools/review-collector");
  }

  const Icon = iconMap[tool.icon] || MessageSquareText;

  // Signed-out: show the real example input/output — let visitors see the
  // value before asking them to sign up. No blur, no lock.
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Back Navigation */}
        <Button variant="ghost" size="sm" asChild className="nb-btn -ml-2 bg-card text-foreground hover:bg-card">
          <Link href="/ai-tools">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to AI Tools
          </Link>
        </Button>

        {/* Tool Header */}
        <header className="nb-card bg-card">
          <div className="h-2 bg-nb-blue border-b-2 border-nb-border" />
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-nb-blue border-2 border-nb-border">
                <Icon className="h-7 w-7 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black uppercase">{tool.name}</h1>
                  <ToolCostBadge costLabel={tool.costLabel} size="sm" />
                </div>
                <p className="mt-1 text-muted-foreground max-w-2xl">
                  {tool.description}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Real example — what you put in, what you get back */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="nb-card bg-card">
            <div className="h-2 bg-nb-yellow border-b-2 border-nb-border" />
            <div className="p-6 space-y-3">
              <h2 className="font-black uppercase text-sm tracking-wide">
                You type this
              </h2>
              <p className="whitespace-pre-wrap border-2 border-nb-border/20 bg-muted/50 p-4 text-sm">
                {tool.exampleInput}
              </p>
            </div>
          </div>
          <div className="nb-card bg-card">
            <div className="h-2 bg-nb-green border-b-2 border-nb-border" />
            <div className="p-6 space-y-3">
              <h2 className="font-black uppercase text-sm tracking-wide">
                The AI writes this
              </h2>
              <p className="whitespace-pre-wrap border-2 border-nb-border/20 bg-muted/50 p-4 text-sm">
                {tool.exampleOutput}
              </p>
            </div>
          </div>
        </div>

        {/* Sign-up CTA */}
        <div className="nb-card bg-nb-yellow text-black">
          <div className="p-6 sm:p-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black uppercase">
              Want this for your business?
            </h2>
            <p className="mt-1 text-sm">
              Create a free account and get 10 free credits every month — no
              credit card needed.
            </p>
          </div>
          <AuthDialog defaultTab="sign-up">
            <Button className="nb-btn shrink-0 bg-black text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-white">
              <Sparkles className="mr-2 h-4 w-4" />
              Get 10 free credits
            </Button>
          </AuthDialog>
          </div>
        </div>
      </div>
    );
  }

  // Signed-in: fetch usage + tier data for the header badges
  const [aiToolUsageResult, tierData] = await Promise.all([
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
    getUserTierData(session.user.id),
  ]);

  const usageCount = aiToolUsageResult[0]?.count || 0;

  // Plain-language allowance for the header badge
  const allowanceLabel = tierData.hasByok
    ? "Unlimited — your API key"
    : tierData.hasSubscription && tierData.subscriptionTier === "pro"
      ? `${tierData.monthlyUsage} of ${tierData.softCapLimit} this month`
      : `${tierData.creditsRemaining} credit${tierData.creditsRemaining === 1 ? "" : "s"} left`;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Back Navigation */}
      <Button variant="ghost" size="sm" asChild className="nb-btn -ml-2 bg-card text-foreground hover:bg-card">
        <Link href="/ai-tools">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to AI Tools
        </Link>
      </Button>

      {/* Tool Header */}
      <header className="nb-card bg-card">
        <div className="h-2 bg-nb-blue border-b-2 border-nb-border" />
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {/* Tool Icon */}
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center bg-nb-blue border-2 border-nb-border">
                <Icon className="h-7 w-7 text-black" />
              </div>

              {/* Tool Info */}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black uppercase">{tool.name}</h1>
                  <ToolCostBadge costLabel={tool.costLabel} size="sm" />
                </div>
                <p className="mt-1 text-muted-foreground max-w-2xl">
                  {tool.description}
                </p>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="nb-badge bg-nb-yellow/20 text-foreground text-sm">
                Used {usageCount} {usageCount === 1 ? "time" : "times"}
              </Badge>
              <Badge className="nb-badge bg-nb-green/20 text-foreground text-sm">
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                {allowanceLabel}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Tool Interface — out-of-credits is handled by the 402 response.
          BYOK/Pro users don't spend credits, so don't gate their button on
          a zero balance. */}
      <AIToolInterface
        tool={tool}
        initialCredits={
          tierData.hasByok ||
          (tierData.hasSubscription && tierData.subscriptionTier === "pro")
            ? undefined
            : tierData.creditsRemaining
        }
      />

      {/* Low-credit nudge for credit users */}
      {!tierData.hasByok &&
        !tierData.hasSubscription &&
        tierData.creditsRemaining <= 3 && (
          <div className="nb-card bg-card">
            <div className="p-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Running low on credits? Starter gives you 100 every month for $9.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/pricing">
                  See plans
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}
