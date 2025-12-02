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
      title: "Tool Not Found | Dashboard",
    };
  }

  return {
    title: `${tool.name} | Dashboard`,
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
    redirect("/dashboard/ai-tools/image-generator");
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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Protected Page</h1>
        <p className="mt-2 text-muted-foreground">
          You need to sign in to access this AI tool
        </p>
        <div className="mt-6">
          <UserProfile />
        </div>
      </div>
    );
  }

  // TODO: Track actual tool usage when implemented
  const usageCount = 0;
  const totalUsage = 0;
  const userTier = "free" as const; // TODO: Get from subscription system

  // Usage limits based on tier
  const usageLimits = {
    free: 100,
    enhanced: 500,
    featured: 2000,
  };

  const usageLimit = usageLimits[userTier];
  const usageRemaining = usageLimit - totalUsage;

  // Check if user has access to this tool
  const isLocked = tool.tier !== "free" && userTier === "free";

  // Get icon component
  const Icon = iconMap[tool.icon] || MessageSquareText;

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/ai-tools">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to AI Tools
        </Link>
      </Button>

      {/* Tool Header */}
      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {/* Tool Icon */}
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-7 w-7 text-primary" />
            </div>

            {/* Tool Info */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{tool.name}</h1>
                <TierBadge tier={tool.tier} size="sm" />
              </div>
              <p className="mt-1 text-muted-foreground max-w-2xl">
                {tool.description}
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              Used {usageCount} {usageCount as number === 1 ? "time" : "times"}
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              {usageRemaining} remaining
            </Badge>
          </div>
        </div>
      </header>

      {/* Tool Interface or Premium Gate */}
      {isLocked ? (
        <PremiumToolGate tool={tool} />
      ) : (
        <AIToolInterface tool={tool} userTier={userTier} />
      )}
    </div>
  );
}

// Premium Tool Gate Component
function PremiumToolGate({ tool }: { tool: { name: string; tier: string; exampleOutput: string } }) {
  return (
    <div className="relative">
      {/* Blurred Preview */}
      <div className="relative overflow-hidden rounded-xl border bg-card">
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-md text-center p-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">
              Unlock {tool.name}
            </h2>
            <p className="mt-2 text-muted-foreground">
              This is a premium tool available with Enhanced or Featured plans.
              Upgrade to access advanced AI-powered features for your business.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/ai-tools#pricing">View Plans</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/ai-tools">Browse Free Tools</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Blurred Content Preview */}
        <div className="p-6 blur-sm pointer-events-none select-none" aria-hidden="true">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-32 rounded-lg border bg-muted/50" />
              <div className="flex gap-2">
                <div className="h-9 w-24 rounded bg-muted" />
                <div className="h-9 flex-1 rounded bg-muted" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-64 rounded-lg border bg-muted/50 p-4">
                <div className="space-y-2">
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-5/6 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
