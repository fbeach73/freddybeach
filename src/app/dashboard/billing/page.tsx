import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import {
  Lock,
  Calendar,
  Check,
  ArrowRight,
  Coins,
  Sparkles,
  AlertCircle,
  Infinity,
  Clock,
  HelpCircle,
  Key,
  Zap,
  ImageIcon,
} from "lucide-react";
import { PurchaseCreditsButton, ApiKeySection, SubscribeByokButton } from "@/components/billing";
import { UserProfile } from "@/components/auth/user-profile";
import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { creditPackages, subscriptionPlans, byokProPlan } from "@/lib/data/packages";
import {
  getUserCredits,
  getSubscriptionInfo,
  checkSoftCap,
  hasOwnApiKey,
  getCreditsForResolution,
} from "@/lib/services/token-system";

// Check if soft cap enforcement is enabled
const isSoftCapEnforced = (): boolean => {
  const envValue = process.env.ENFORCE_SOFT_CAP;
  return envValue === "true" || envValue === "1";
};

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
                  ? `You have ${creditBalance} credit${creditBalance === 1 ? "" : "s"} remaining.`
                  : subscriptionInfo.isActive
                    ? "You have unlimited access with your subscription."
                    : hasByok
                      ? "Using your own API key for unlimited access."
                      : "Purchase credits to use AI tools."}
              </p>

              {/* Credit Cost Per Resolution Info */}
              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <ImageIcon className="h-4 w-4" />
                  Credit Cost Per Image
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-semibold">{getCreditsForResolution("1K")}</div>
                    <div className="text-muted-foreground">1K</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{getCreditsForResolution("2K")}</div>
                    <div className="text-muted-foreground">2K</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{getCreditsForResolution("4K")}</div>
                    <div className="text-muted-foreground">4K</div>
                  </div>
                </div>
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
                        ? subscriptionInfo.tier === "byok"
                          ? "BYOK Pro"
                          : `Unlimited ${subscriptionInfo.tier === "yearly" ? "Yearly" : "Monthly"}`
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

                  {/* Soft Cap Usage (only for non-BYOK subscriptions) */}
                  {subscriptionInfo.tier !== "byok" && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          Monthly Usage
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-sm">
                                  <strong>Fair Use Policy:</strong> Subscribers have a soft cap of 500 generations per month.
                                  {isSoftCapEnforced()
                                    ? " This limit is enforced - generation will be blocked once reached."
                                    : " This is a guideline, not a hard limit. You'll see warnings at 80% usage."}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Usage resets on the 1st of each month.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                        <span className="font-medium">
                          {softCapStatus.usage} / 500 generations
                        </span>
                      </div>
                      <Progress
                        value={softCapPercentage}
                        className={`h-2 ${softCapPercentage >= 100 ? "[&>div]:bg-red-500" : softCapPercentage >= 80 ? "[&>div]:bg-amber-500" : ""}`}
                      />
                      {softCapPercentage >= 100 ? (
                        <p className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          {isSoftCapEnforced()
                            ? "Fair use limit reached - generation blocked until next month"
                            : "Fair use limit reached - please use responsibly"}
                        </p>
                      ) : softCapPercentage >= 80 && (
                        <p className="flex items-center gap-1 text-xs text-amber-600">
                          <AlertCircle className="h-3 w-3" />
                          Approaching fair use limit
                        </p>
                      )}
                    </div>
                  )}

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

      {/* Credit Packs */}
      <section className="space-y-4">
        <SectionHeader
          title="Buy Credits"
          description="Purchase credit packs for pay-as-you-go AI generation"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creditPackages.map((pack) => (
            <Card
              key={pack.id}
              className={pack.isPopular ? "border-primary ring-1 ring-primary" : ""}
            >
              {pack.isPopular && (
                <div className="bg-primary px-3 py-1 text-center text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{pack.name}</CardTitle>
                  <Badge variant="secondary">{pack.pricePerCredit}/credit</Badge>
                </div>
                <CardDescription>{pack.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{pack.priceLabel}</span>
                  <span className="text-muted-foreground">for {pack.credits} credits</span>
                </div>
                <ul className="space-y-2 text-sm">
                  {pack.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <PurchaseCreditsButton
                  packId={pack.id}
                  credits={pack.credits}
                  priceLabel={pack.priceLabel}
                  className="w-full"
                  variant={pack.isPopular ? "default" : "outline"}
                >
                  <Coins className="mr-2 h-4 w-4" />
                  Buy {pack.credits} Credits
                </PurchaseCreditsButton>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* BYOK Pro Subscription */}
      <section className="space-y-4">
        <SectionHeader
          title="BYOK Pro"
          description="Unlimited generations with your own API key"
        />
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white dark:border-purple-900 dark:from-purple-950/30 dark:to-background">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4 lg:max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
                    <Key className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{byokProPlan.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {byokProPlan.priceLabel}
                      </span>
                      <span className="text-muted-foreground">/{byokProPlan.period}</span>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground">{byokProPlan.description}</p>

                <ul className="grid gap-2 sm:grid-cols-2">
                  {byokProPlan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-start gap-2 rounded-lg bg-purple-100/50 p-3 text-sm dark:bg-purple-900/20">
                  <Zap className="mt-0.5 h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <strong>Requirements:</strong>
                    <ul className="mt-1 list-inside list-disc text-muted-foreground">
                      {byokProPlan.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:min-w-[200px]">
                {subscriptionInfo.tier === "byok" ? (
                  <Badge className="w-fit bg-purple-600">
                    <Check className="mr-1 h-3 w-3" />
                    Active Subscription
                  </Badge>
                ) : hasByok ? (
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-fit text-purple-600">
                      <Key className="mr-1 h-3 w-3" />
                      API Key Configured
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Subscribe to BYOK Pro for priority processing and premium support.
                    </p>
                    <SubscribeByokButton className="w-full">
                      <Key className="mr-2 h-4 w-4" />
                      Upgrade to BYOK Pro
                    </SubscribeByokButton>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Add your API key first, then subscribe for premium features.
                    </p>
                    <SubscribeByokButton className="w-full">
                      <Key className="mr-2 h-4 w-4" />
                      Subscribe for {byokProPlan.priceLabel}/mo
                    </SubscribeByokButton>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* API Key Management */}
      <section className="space-y-4">
        <SectionHeader
          title="API Key"
          description="Use your own Google API key for unlimited AI generations"
        />
        <ApiKeySection hasByokPro={subscriptionInfo.tier === "byok"} />
      </section>

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
