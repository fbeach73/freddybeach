import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import {
  Lock,
  CreditCard,
  Calendar,
  Check,
  ArrowRight,
  Receipt,
  Wallet,
} from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { TierBadge } from "@/components/shared/tier-badge";
import { UpgradeCTACard } from "@/components/dashboard/upgrade-cta-card";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getMockUser } from "@/lib/data/user-dashboard";
import { getTierById, pricingTiers } from "@/lib/data/packages";

export const metadata = {
  title: "Billing | Dashboard",
  description: "Manage your subscription and billing information",
};

export default async function BillingPage() {
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
          You need to sign in to access Billing
        </p>
        <div className="mt-6">
          <UserProfile />
        </div>
      </div>
    );
  }

  // Get mock user and their tier details
  const user = getMockUser();
  const currentTier = getTierById(user.tier);
  const isFreeTier = user.tier === "free";

  // Mock billing info
  const billingInfo = {
    nextBillingDate: isFreeTier ? null : new Date("2025-06-15"),
    memberSince: user.joinedAt,
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section>
        <PageHeader
          title="Billing & Subscription"
          description="Manage your plan, billing information, and invoices"
        />
      </section>

      {/* Current Plan Card */}
      <section className="space-y-4">
        <SectionHeader title="Current Plan" />
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              {/* Plan Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <TierBadge tier={user.tier} size="lg" />
                  <span className="text-2xl font-bold">
                    {currentTier?.priceLabel || "Free"}
                    {!isFreeTier && (
                      <span className="ml-1 text-base font-normal text-muted-foreground">
                        /{currentTier?.period}
                      </span>
                    )}
                  </span>
                </div>
                <p className="max-w-md text-sm text-muted-foreground">
                  {currentTier?.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2">
                  {currentTier?.features.slice(0, 4).map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                  {(currentTier?.features.length || 0) > 4 && (
                    <li className="text-sm text-muted-foreground">
                      + {(currentTier?.features.length || 0) - 4} more features
                    </li>
                  )}
                </ul>
              </div>

              {/* Billing Info */}
              <div className="space-y-3 rounded-lg bg-muted/50 p-4 sm:min-w-[200px]">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Member since:</span>
                </div>
                <p className="font-medium">
                  {billingInfo.memberSince.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                {billingInfo.nextBillingDate && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Next billing:
                      </span>
                    </div>
                    <p className="font-medium">
                      {billingInfo.nextBillingDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </>
                )}

                {!isFreeTier && (
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    Manage Subscription
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Upgrade CTA for Free Users */}
      {isFreeTier && (
        <section className="space-y-4">
          <SectionHeader
            title="Upgrade Your Plan"
            description="Unlock more features and higher limits"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <UpgradeCTACard />

            {/* View All Plans Card */}
            <Card className="flex flex-col justify-between">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Compare All Plans</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  See the full feature comparison and choose the plan that works
                  best for your business needs.
                </p>

                <div className="mt-4 space-y-2">
                  {pricingTiers
                    .filter((tier) => tier.id !== "free")
                    .map((tier) => (
                      <div
                        key={tier.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium">{tier.name}</span>
                        <span className="text-muted-foreground">
                          {tier.priceLabel}/{tier.period}
                        </span>
                      </div>
                    ))}
                </div>

                <Button className="mt-6 w-full" variant="outline" asChild>
                  <Link href="/ai-tools#pricing">
                    View All Plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Invoice History - Coming Soon */}
      <section className="space-y-4">
        <SectionHeader
          title="Invoice History"
          description="View and download your past invoices"
        />
        <Card>
          <CardContent className="py-8">
            <ComingSoon
              title="Invoice History"
              description="Access your complete billing history, download invoices, and track payment records."
              features={[
                "Downloadable PDF invoices",
                "Complete payment history",
                "Automatic receipt emails",
              ]}
              showNotify={false}
            />
          </CardContent>
        </Card>
      </section>

      {/* Payment Methods - Coming Soon */}
      <section className="space-y-4">
        <SectionHeader
          title="Payment Methods"
          description="Manage your payment information"
        />
        <Card>
          <CardContent className="py-8">
            <ComingSoon
              title="Payment Methods"
              description="Securely manage your credit cards and payment methods for seamless billing."
              features={[
                "Multiple payment methods",
                "Secure card storage",
                "Automatic payment updates",
              ]}
              showNotify={false}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
