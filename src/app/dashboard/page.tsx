import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserProfile } from "@/components/auth/user-profile";
import { Lock, ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { SectionHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TierBadge } from "@/components/shared/tier-badge";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { ClaimedBusinessCard } from "@/components/dashboard/claimed-business-card";
import { DashboardToolCard } from "@/components/dashboard/dashboard-tool-card";
import { UpgradeCTACard } from "@/components/dashboard/upgrade-cta-card";
import { ConsultationCTACard } from "@/components/dashboard/consultation-cta-card";

import {
  getMockUser,
  getMockStats,
  getMockClaimedBusinesses,
  getMockToolUsage,
} from "@/lib/data/user-dashboard";
import { aiTools } from "@/lib/data/ai-tools";

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

  // Get mock data
  const user = getMockUser();
  const stats = getMockStats();
  const claimedBusinesses = getMockClaimedBusinesses();
  const toolUsage = getMockToolUsage();

  // Get current date for welcome message
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Map tool usage to get usage counts by tool id
  const toolUsageMap = new Map(
    toolUsage.map((t) => [t.toolId, t.usageCount])
  );

  // Get featured/recent tools (first 4)
  const featuredTools = aiTools.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Header Section */}
      <section className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Welcome back, {session.user.name || user.name}!
            </h1>
            <p className="text-muted-foreground">{formattedDate}</p>
          </div>
          <TierBadge tier={user.tier} size="lg" />
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
            claimedBusinesses.length > 0 ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/my-businesses">
                  View All
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            ) : null
          }
        />
        {claimedBusinesses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {claimedBusinesses.slice(0, 2).map((business) => (
              <ClaimedBusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title="No businesses claimed yet"
            description="Claim your business listing to manage your presence on FreddyBeach and unlock powerful AI tools."
            action={{
              label: "Browse Directory",
              href: "/",
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
              usageCount={toolUsageMap.get(tool.id) || 0}
              userTier={user.tier}
            />
          ))}
        </div>
      </section>

      {/* CTA Cards Section */}
      {user.tier === "free" && (
        <section className="grid gap-4 md:grid-cols-2">
          <UpgradeCTACard />
          <ConsultationCTACard />
        </section>
      )}
    </div>
  );
}
