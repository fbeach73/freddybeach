import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserProfile } from "@/components/auth/user-profile";
import { Lock, ArrowRight, Building2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { SectionHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { OwnedBusinessCard } from "@/components/dashboard/owned-business-card";
import { DashboardToolCard } from "@/components/dashboard/dashboard-tool-card";
import { UpgradeCTACard } from "@/components/dashboard/upgrade-cta-card";
import { ConsultationCTACard } from "@/components/dashboard/consultation-cta-card";
import { Badge } from "@/components/ui/badge";

import { aiTools } from "@/lib/data/ai-tools";
import { db } from "@/lib/db";
import { business, claim } from "@/lib/schema";
import { eq, and, count } from "drizzle-orm";

export default async function DashboardPage() {
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
          You need to sign in to access the dashboard
        </p>
        <div className="mt-6">
          <UserProfile />
        </div>
      </div>
    );
  }

  // Fetch real data from database
  const ownedBusinesses = await db
    .select()
    .from(business)
    .where(eq(business.ownerId, session.user.id));

  // Fetch pending claims count for this user
  const pendingClaimsResult = await db
    .select({ count: count() })
    .from(claim)
    .where(
      and(eq(claim.userId, session.user.id), eq(claim.status, "pending"))
    );
  const pendingClaimsCount = pendingClaimsResult[0]?.count || 0;

  // Build real stats
  const stats = {
    businessesClaimed: ownedBusinesses.length,
    aiToolsUsed: 0, // TODO: Track actual AI tool usage when implemented
    hoursSaved: 0, // TODO: Calculate based on AI tool usage
    currentPlan: "Free", // TODO: Get from subscription system when implemented
  };

  // Get current date for welcome message
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get featured/recent tools (first 4)
  const featuredTools = aiTools.slice(0, 4);

  // User role for display
  const isAdmin = session.user.role === "admin";
  const isClient = session.user.role === "client";

  return (
    <div className="space-y-8">
      {/* Welcome Header Section */}
      <section className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Welcome back, {session.user.name}!
            </h1>
            <p className="text-muted-foreground">{formattedDate}</p>
          </div>
          <Badge variant={isAdmin ? "destructive" : "secondary"} className="w-fit">
            {isAdmin ? "Admin" : isClient ? "Business Owner" : "Member"}
          </Badge>
        </div>
      </section>

      {/* Stats Grid Section */}
      <section>
        <StatsGrid stats={stats} />
      </section>

      {/* My Businesses Section */}
      <section className="space-y-4">
        <SectionHeader
          title="My Businesses"
          action={
            ownedBusinesses.length > 0 ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/my-businesses">
                  View All
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            ) : null
          }
        />
        {ownedBusinesses.length > 0 ? (
          <div className="space-y-4">
            {ownedBusinesses.slice(0, 2).map((biz) => (
              <OwnedBusinessCard key={biz.id} business={biz} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title={
              pendingClaimsCount > 0
                ? "No approved businesses yet"
                : "No businesses yet"
            }
            description={
              pendingClaimsCount > 0
                ? `You have ${pendingClaimsCount} pending claim${pendingClaimsCount > 1 ? "s" : ""} being reviewed. Once approved, your business will appear here.`
                : "Claim an existing business from the directory, or create a new listing if your business isn't on Google yet."
            }
            action={{
              label: "Browse Directory",
              href: "/",
            }}
            secondaryAction={{
              label: "Create New Listing",
              href: "/dashboard/my-businesses/new",
            }}
          />
        )}
      </section>

      {/* AI Tools Quick Access Section */}
      <section className="space-y-4">
        <SectionHeader
          title="AI Tools"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/ai-tools">
                View All
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredTools.map((tool) => (
            <DashboardToolCard
              key={tool.id}
              tool={tool}
              usageCount={0}
              userTier="free"
            />
          ))}
        </div>
      </section>

      {/* CTA Cards Section - show for non-admin users */}
      {!isAdmin && (
        <section className="grid gap-4 md:grid-cols-2">
          <UpgradeCTACard />
          <ConsultationCTACard />
        </section>
      )}
    </div>
  );
}
