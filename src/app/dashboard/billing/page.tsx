import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import {
  Lock,
  CreditCard,
  Calendar,
  Check,
  ArrowRight,
  Coins,
  Sparkles,
  AlertCircle,
  Infinity,
  Clock,
} from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { creditPackages, subscriptionPlans } from "@/lib/data/packages";
import {
  getUserCredits,
  getSubscriptionInfo,
  checkSoftCap,
  hasOwnApiKey,
} from "@/lib/services/token-system";

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

  // Fetch credit balance and subscription info
  const [creditBalance, subscriptionInfo, softCapStatus, hasByok] =
    await Promise.all([
      getUserCredits(session.user.id),
      getSubscriptionInfo(session.user.id),
      checkSoftCap(session.user.id),
      hasOwnApiKey(session.user.id),
    ]);

  // Get member since date from session
  const memberSince = session.user.createdAt
    ? new Date(session.user.createdAt)
    : new Date();

  // Calculate soft cap percentage for progress bar
  const softCapPercentage = Math.min(
    100,
    Math.round((softCapStatus.usage / 500) * 100)
  );

  // Determine subscription status text
  const getSubscriptionStatusText = () => {
    if (!subscriptionInfo.isActive) return null;
    if (subscriptionInfo.daysRemaining && subscriptionInfo.daysRemaining <= 7) {
      return `Expires in ${subscriptionInfo.daysRemaining} day${subscriptionInfo.daysRemaining === 1 ? "" : "s"}`;
    }
    return null;
  };

  const subscriptionStatusText = getSubscriptionStatusText();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section>
        <PageHeader
          title="Billing & Subscription"
          description="Manage your AI credits, subscription, and billing information"
        />
      </section>

      {/* Credit Balance & Subscription Status */}
      <section className="space-y-4">
        <SectionHeader title="AI Tools Access" />
        <div className="grid gap-4 md:grid-cols-2">
          {/* Credit Balance Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Credit Balance
                    </p>
                    <p className="text-3xl font-bold">{creditBalance}</p>
                  </div>
                </div>
                {creditBalance <= 10 && creditBalance > 0 && (
                  <Badge variant="outline" className="text-amber-600">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Low
                  </Badge>
                )}
                {creditBalance === 0 && !subscriptionInfo.isActive && !hasByok && (
                  <Badge variant="destructive">Empty</Badge>
                )}
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                {creditBalance > 0
                  ? `You have ${creditBalance} credit${creditBalance === 1 ? "" : "s"} remaining. Each AI generation uses 1 credit.`
                  : subscriptionInfo.isActive
                    ? "You have unlimited access with your subscription."
                    : hasByok
                      ? "Using your own API key for unlimited access."
                      : "Purchase credits to use AI tools."}
              </p>

              <div className="mt-4">
                <Button className="w-full" asChild>
                  <Link href="/api/checkout/credits">
                    <Coins className="mr-2 h-4 w-4" />
                    Buy {creditPackages[0].credits} Credits for{" "}
                    {creditPackages[0].priceLabel}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      subscriptionInfo.isActive
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-muted"
                    }`}
                  >
                    {subscriptionInfo.isActive ? (
                      <Infinity className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription</p>
                    <p className="text-xl font-bold">
                      {subscriptionInfo.isActive
                        ? `Unlimited ${subscriptionInfo.tier === "yearly" ? "Yearly" : "Monthly"}`
                        : "No Active Plan"}
                    </p>
                  </div>
                </div>
                {subscriptionInfo.isActive && (
                  <Badge
                    variant={subscriptionStatusText ? "outline" : "secondary"}
                    className={
                      subscriptionStatusText
                        ? "text-amber-600"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }
                  >
                    {subscriptionStatusText || "Active"}
                  </Badge>
                )}
              </div>

              {subscriptionInfo.isActive ? (
                <>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Renews{" "}
                        {subscriptionInfo.expiresAt?.toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Soft Cap Usage */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Monthly Usage
                      </span>
                      <span className="font-medium">
                        {softCapStatus.usage} / 500 generations
                      </span>
                    </div>
                    <Progress
                      value={softCapPercentage}
                      className={`h-2 ${softCapPercentage >= 80 ? "[&>div]:bg-amber-500" : ""}`}
                    />
                    {softCapPercentage >= 80 && (
                      <p className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertCircle className="h-3 w-3" />
                        Approaching fair use limit
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/ai-tools#pricing">
                        Manage Subscription
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Get unlimited AI generations with a subscription. Cancel
                    anytime.
                  </p>

                  <div className="mt-4 space-y-2">
                    {subscriptionPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium">{plan.name}</span>
                        <span className="text-muted-foreground">
                          {plan.priceLabel}/{plan.period}
                          {plan.yearlyEquivalent && (
                            <span className="ml-1 text-green-600">
                              ({plan.yearlyEquivalent})
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <Button className="w-full" asChild>
                      <Link href="/ai-tools#pricing">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Subscribe Now
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* BYOK Status */}
      {hasByok && (
        <section className="space-y-4">
          <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold">Bring Your Own Key Active</p>
                  <p className="text-sm text-muted-foreground">
                    You&apos;re using your own API key for unlimited free access
                    to AI tools.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Account Info */}
      <section className="space-y-4">
        <SectionHeader title="Account Info" />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="font-medium">
                  {memberSince.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

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
