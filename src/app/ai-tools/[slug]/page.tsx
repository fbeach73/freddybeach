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
  Lock,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { UserProfile } from "@/components/auth/user-profile";
import { TierBadge } from "@/components/shared/tier-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIToolInterface } from "@/components/dashboard/ai-tool-interface";
import { aiTools, getToolBySlug } from "@/lib/data/ai-tools";
import { db } from "@/lib/db";
import { creditTransaction } from "@/lib/schema";
import { eq, and, or, count } from "drizzle-orm";
import { getSubscriptionInfo, hasOwnApiKey, checkSoftCap, getUserCredits } from "@/lib/services/token-system";

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  MessageSquareText,
  Share2,
  PenLine,
  Mail,
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

  // Show sign-in prompt for unauthenticated users
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="nb-card bg-card max-w-md mx-auto">
          <div className="h-2 bg-nb-pink border-b-2 border-nb-border" />
          <div className="p-8 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center bg-nb-pink border-2 border-nb-border">
              <Lock className="h-8 w-8 text-black" />
            </div>
            <h1 className="mt-4 text-2xl font-black uppercase">Sign In Required</h1>
            <p className="mt-2 text-muted-foreground">
              You need to sign in to access this AI tool
            </p>
            <div className="mt-6">
              <UserProfile />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch actual usage and subscription data
  const [aiToolUsageResult, subscriptionInfo, hasByok, softCapStatus, userCredits] = await Promise.all([
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
    getUserCredits(session.user.id),
  ]);

  const usageCount = aiToolUsageResult[0]?.count || 0;
  const totalUsage = usageCount;

  // Determine user tier based on subscription status
  const userTier: "free" | "enhanced" | "featured" =
    hasByok || subscriptionInfo.isActive ? "featured" : "free";

  // Usage limits based on tier
  const usageLimits = {
    free: 10,       // Free tier: 10 generations per month
    enhanced: 500,  // Subscribers: soft cap at 500
    featured: 500,  // Subscribers: soft cap at 500
  };

  const isUnlimited = hasByok;
  const usageLimit = isUnlimited ? Infinity : usageLimits[userTier];
  const usageRemaining = isUnlimited ? Infinity : Math.max(0, usageLimit - (userTier === "free" ? totalUsage : softCapStatus.usage));

  // Check if user has access to this tool
  const isLocked = tool.tier !== "free" && userTier === "free";

  // Get icon component
  const Icon = iconMap[tool.icon] || MessageSquareText;

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
                  <TierBadge tier={tool.tier} size="sm" />
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
                {isUnlimited ? "Unlimited" : `${usageRemaining} remaining`}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Tool Interface or Premium Gate */}
      {isLocked ? (
        <PremiumToolGate tool={tool} />
      ) : (
        <AIToolInterface tool={tool} userTier={userTier} initialCredits={userCredits} />
      )}
    </div>
  );
}

// Premium Tool Gate Component
function PremiumToolGate({ tool }: { tool: { name: string; tier: string; exampleOutput: string } }) {
  return (
    <div className="relative">
      {/* Blurred Preview */}
      <div className="relative overflow-hidden border-4 border-nb-border bg-card">
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-md text-center p-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center bg-nb-orange border-2 border-nb-border">
              <Lock className="h-8 w-8 text-black" />
            </div>
            <h2 className="mt-4 text-xl font-black uppercase">
              Unlock {tool.name}
            </h2>
            <p className="mt-2 text-muted-foreground">
              This is a premium tool available with Enhanced or Featured plans.
              Upgrade to access advanced AI-powered features for your business.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="nb-btn bg-nb-orange text-black hover:bg-nb-orange">
                <Link href="/ai-tools#pricing">View Plans</Link>
              </Button>
              <Button variant="outline" asChild className="nb-btn bg-card text-foreground hover:bg-card">
                <Link href="/ai-tools">Browse Free Tools</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Blurred Content Preview */}
        <div className="p-6 blur-sm pointer-events-none select-none" aria-hidden="true">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="h-4 w-24 bg-muted border-2 border-nb-border/10" />
              <div className="h-32 border-2 border-nb-border/10 bg-muted/50" />
              <div className="flex gap-2">
                <div className="h-9 w-24 bg-muted border-2 border-nb-border/10" />
                <div className="h-9 flex-1 bg-muted border-2 border-nb-border/10" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 w-24 bg-muted border-2 border-nb-border/10" />
              <div className="h-64 border-2 border-nb-border/10 bg-muted/50 p-4">
                <div className="space-y-2">
                  <div className="h-3 w-3/4 bg-muted" />
                  <div className="h-3 w-full bg-muted" />
                  <div className="h-3 w-5/6 bg-muted" />
                  <div className="h-3 w-full bg-muted" />
                  <div className="h-3 w-2/3 bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
