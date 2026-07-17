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
  ImageIcon,
} from "lucide-react";
import {
  PurchaseCreditsButton,
  ApiKeySection,
  ManageSubscriptionButton,
  SubscribeButton,
} from "@/components/billing";
import { UserProfile } from "@/components/auth/user-profile";
import { PageHeader, SectionHeader } from "@/components/shared/page-header";
import { FoundingMemberBanner } from "@/components/marketing/founding-member-banner";
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

import { PLANS, creditPacks, byokOption } from "@/lib/data/plans";
import {
  getUserCredits,
  getSubscriptionInfo,
  checkSoftCap,
  hasOwnApiKey,
  getCreditsForResolution,
  type SubscriptionTier,
} from "@/lib/services/token-system";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Display names sourced from the canonical plans module
const TIER_DISPLAY_NAMES: Record<SubscriptionTier, string> = {
  starter: PLANS.starter.name,
  pro: `${PLANS.pro.name} (Unlimited)`,
  byok: PLANS.byokPro.name,
};

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
        <div className="flex h-16 w-16 items-center justify-center bg-nb-pink/20 border-2 border-nb-border">
          <Lock className="h-8 w-8 text-nb-pink" />
        </div>
        <h1 className="mt-4 text-2xl font-bold uppercase tracking-tight">Protected Page</h1>
        <p className="mt-2 text-muted-foreground">
          You need to sign in to access Billing
        </p>
        <div className="mt-6">
          <UserProfile />
        </div>
      </div>
    );
  }

  // Fetch credit balance, subscription info, and billing flags
  const [creditBalance, subscriptionInfo, softCapStatus, hasByok, billingUser] =
    await Promise.all([
      getUserCredits(session.user.id),
      getSubscriptionInfo(session.user.id),
      checkSoftCap(session.user.id),
      hasOwnApiKey(session.user.id),
      db
        .select({
          foundingMember: user.foundingMember,
          stripeCustomerId: user.stripeCustomerId,
        })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    ]);

  const isFoundingMember = billingUser?.foundingMember ?? false;
  // Active subscribers with no Stripe customer are legacy Polar subscribers
  const isLegacyPolarSub =
    subscriptionInfo.isActive && !billingUser?.stripeCustomerId;

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

      {/* Founding member strip (hidden once claimed or spots are gone) */}
      {!isFoundingMember && <FoundingMemberBanner variant="compact" />}

      {/* Credit Balance & Subscription Status */}
      <section className="space-y-4">
        <SectionHeader title="AI Tools Access" />
        <div className="grid gap-4 md:grid-cols-2">
          {/* Credit Balance Card */}
          <Card className="nb-card bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-nb-yellow/20 border-2 border-nb-border">
                    <Coins className="h-5 w-5 text-nb-yellow" />
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
              <div className="mt-4 border-2 border-nb-border/20 bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-sm font-bold mb-2">
                  <ImageIcon className="h-4 w-4" />
                  Credit Cost Per Image
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-bold">{getCreditsForResolution("1K")}</div>
                    <div className="text-muted-foreground">1K</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{getCreditsForResolution("2K")}</div>
                    <div className="text-muted-foreground">2K</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{getCreditsForResolution("4K")}</div>
                    <div className="text-muted-foreground">4K</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status Card */}
          <Card className="nb-card bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center border-2 border-nb-border ${
                      subscriptionInfo.isActive
                        ? "bg-nb-green/20"
                        : "bg-muted"
                    }`}
                  >
                    {subscriptionInfo.isActive ? (
                      <Infinity className="h-5 w-5 text-nb-green" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xl font-bold">
                        {subscriptionInfo.isActive && subscriptionInfo.tier
                          ? TIER_DISPLAY_NAMES[subscriptionInfo.tier]
                          : PLANS.free.name}
                      </p>
                      {isFoundingMember && (
                        <Badge className="bg-nb-yellow text-black border-nb-border">
                          <Sparkles className="mr-1 h-3 w-3" />
                          Founding Member
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {subscriptionInfo.isActive && (
                  <Badge
                    variant={subscriptionStatusText ? "outline" : "secondary"}
                    className={
                      subscriptionStatusText
                        ? "text-nb-orange border-nb-orange"
                        : "bg-nb-green/20 text-nb-green border-nb-green"
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

                  {/* Soft Cap Usage (Pro's unlimited-with-fair-use meter) */}
                  {subscriptionInfo.tier === "pro" && (
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
                    {isLegacyPolarSub ? (
                      <p className="border-2 border-nb-border/20 bg-muted/50 p-3 text-sm text-muted-foreground">
                        Billed via Polar (legacy). Your subscription keeps
                        renewing as usual — nothing to do on your end.
                      </p>
                    ) : (
                      <ManageSubscriptionButton className="w-full" />
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {PLANS.free.description}
                  </p>

                  <div className="mt-4 space-y-2">
                    <SubscribeButton plan="starter" className="w-full">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get {PLANS.starter.name} — {PLANS.starter.priceLabel}
                    </SubscribeButton>
                    <SubscribeButton plan="pro" variant="outline" className="w-full">
                      Get {PLANS.pro.name} — {PLANS.pro.priceLabel}
                    </SubscribeButton>
                    <Button variant="ghost" className="w-full" asChild>
                      <Link href="/pricing">
                        Compare all plans
                        <ArrowRight className="ml-2 h-4 w-4" />
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
          {creditPacks.map((pack) => (
            <Card
              key={pack.id}
              className={`nb-card bg-card ${pack.isPopular ? "border-nb-yellow ring-2 ring-nb-yellow" : ""}`}
            >
              {pack.isPopular && (
                <div className="bg-nb-yellow px-3 py-1 text-center text-xs font-bold text-black border-b-2 border-nb-border uppercase tracking-wide">
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
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-nb-green" />
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

      {/* FREE BYOK - Limited Time Offer */}
      <section className="space-y-4" id="api-key">
        <SectionHeader
          title="Bring Your Own Key"
          description="Unlimited generations with your own API key"
        />
        <div className="nb-card bg-card">
          <div className="h-2 bg-nb-green border-b-2 border-nb-border" />
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4 lg:max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center bg-nb-green/20 border-2 border-nb-border">
                    <Key className="h-6 w-6 text-nb-green" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{byokOption.name}</h3>
                      <Badge variant="secondary" className="bg-nb-green/20 text-nb-green border-nb-green">
                        <Clock className="mr-1 h-3 w-3" />
                        Limited Time
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-nb-green">
                        {byokOption.priceLabel}
                      </span>
                      <span className="text-muted-foreground">forever</span>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground">{byokOption.description}</p>

                <ul className="grid gap-2 sm:grid-cols-2">
                  {byokOption.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-nb-green" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-start gap-2 border-2 border-nb-orange bg-nb-orange/10 p-3 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-nb-orange" />
                  <div>
                    <strong className="font-bold">Requirements:</strong>
                    <ul className="mt-1 list-inside list-disc text-muted-foreground">
                      {byokOption.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:min-w-[200px]">
                {hasByok ? (
                  <div className="space-y-2">
                    <Badge className="w-fit bg-nb-green text-black border-nb-border">
                      <Check className="mr-1 h-3 w-3" />
                      API Key Connected
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      You have unlimited free access to AI tools with your own API key.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Add your Google Gemini API key below to unlock unlimited free generations.
                    </p>
                    <Button asChild className="w-full bg-nb-green text-black hover:bg-nb-green/90">
                      <a href="#api-key-section">
                        <Key className="mr-2 h-4 w-4" />
                        Add Your API Key
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </section>

      {/* API Key Management */}
      <section className="space-y-4" id="api-key-section">
        <SectionHeader
          title="API Key"
          description="Use your own Google API key for unlimited AI generations"
        />
        <ApiKeySection hasByokPro={subscriptionInfo.tier === "byok"} />
      </section>

      {/* Account Info */}
      <section className="space-y-4">
        <SectionHeader title="Account Info" />
        <Card className="nb-card bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-nb-blue/20 border-2 border-nb-border">
                <Clock className="h-5 w-5 text-nb-blue" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="font-bold">
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
