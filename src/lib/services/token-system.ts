import { db } from "@/lib/db";
import { userTokenUsage, user, creditTransaction, userApiKey } from "@/lib/schema";
import { eq, and, count, isNull, ne, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// User tier types based on subscription level
export type UserTier = "free" | "enhanced" | "featured";

// Token limits per tier (configurable via environment variables)
const TOKEN_LIMITS: Record<UserTier, number> = {
  free: parseInt(process.env.FREE_TIER_IMAGE_TOKENS || "10", 10),
  enhanced: parseInt(process.env.ENHANCED_TIER_IMAGE_TOKENS || "50", 10),
  featured: parseInt(process.env.FEATURED_TIER_IMAGE_TOKENS || "200", 10),
};

export interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
  tier: UserTier;
  month: string;
  percentUsed: number;
}

/**
 * Get the current month string in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Get the token limit for a user tier
 * @deprecated Legacy role-based tier path. Use canGenerateWithDetails() (payment-based) instead.
 */
export function getTokenLimit(tier: UserTier): number {
  return TOKEN_LIMITS[tier] || TOKEN_LIMITS.free;
}

/**
 * Get the user's tier based on their role
 * This maps user roles to feature tiers
 * @deprecated Legacy role-based tier path. Use getUserTierData() (payment-based) instead.
 */
export async function getUserTier(userId: string): Promise<UserTier> {
  try {
    const result = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (result.length === 0) {
      return "free";
    }

    // Map roles to tiers
    // Admin and client roles get enhanced access
    const role = result[0].role;
    switch (role) {
      case "admin":
        return "featured";
      case "client":
        return "enhanced";
      default:
        return "free";
    }
  } catch (error) {
    console.error("Failed to get user tier:", error);
    return "free";
  }
}

/**
 * Get the token usage for a user in a specific month
 */
export async function getTokenUsage(
  userId: string,
  month: string
): Promise<number> {
  try {
    const result = await db
      .select({ tokensUsed: userTokenUsage.tokensUsed })
      .from(userTokenUsage)
      .where(
        and(eq(userTokenUsage.userId, userId), eq(userTokenUsage.month, month))
      )
      .limit(1);

    if (result.length === 0) {
      return 0;
    }

    return result[0].tokensUsed;
  } catch (error) {
    console.error("Failed to get token usage:", error);
    return 0;
  }
}

/**
 * Check if a user can generate images (has tokens remaining)
 * @deprecated Legacy role-based tier path. Use canGenerateWithDetails() (payment-based) instead.
 */
export async function canGenerate(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  const limit = getTokenLimit(tier);
  const month = getCurrentMonth();
  const used = await getTokenUsage(userId, month);

  return used < limit;
}

/**
 * Check if a user can generate a specific number of images
 * @deprecated Legacy role-based tier path. Use canGenerateWithDetails() (payment-based) instead.
 */
export async function canGenerateCount(
  userId: string,
  count: number
): Promise<boolean> {
  const tier = await getUserTier(userId);
  const limit = getTokenLimit(tier);
  const month = getCurrentMonth();
  const used = await getTokenUsage(userId, month);

  return used + count <= limit;
}

/**
 * Increment the token usage for a user
 * Creates a new record if none exists for the current month
 */
export async function incrementTokenUsage(
  userId: string,
  count: number = 1
): Promise<void> {
  const month = getCurrentMonth();

  try {
    // Check if a record exists for this month
    const existing = await db
      .select()
      .from(userTokenUsage)
      .where(
        and(eq(userTokenUsage.userId, userId), eq(userTokenUsage.month, month))
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(userTokenUsage)
        .set({
          tokensUsed: existing[0].tokensUsed + count,
          updatedAt: new Date(),
        })
        .where(eq(userTokenUsage.id, existing[0].id));
    } else {
      // Create new record
      await db.insert(userTokenUsage).values({
        id: nanoid(),
        userId,
        month,
        tokensUsed: count,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error("Failed to increment token usage:", error);
    throw error;
  }
}

/**
 * Get comprehensive usage statistics for a user
 * @deprecated Legacy role-based tier path. Use getUserTierData() (payment-based) instead.
 */
export async function getUsageStats(userId: string): Promise<UsageStats> {
  const tier = await getUserTier(userId);
  const limit = getTokenLimit(tier);
  const month = getCurrentMonth();
  const used = await getTokenUsage(userId, month);
  const remaining = Math.max(0, limit - used);
  const percentUsed = limit > 0 ? Math.round((used / limit) * 100) : 0;

  return {
    used,
    limit,
    remaining,
    tier,
    month,
    percentUsed,
  };
}

/**
 * Reset a user's token usage for a specific month (admin function)
 */
export async function resetTokenUsage(
  userId: string,
  month?: string
): Promise<void> {
  const targetMonth = month || getCurrentMonth();

  try {
    await db
      .delete(userTokenUsage)
      .where(
        and(
          eq(userTokenUsage.userId, userId),
          eq(userTokenUsage.month, targetMonth)
        )
      );
  } catch (error) {
    console.error("Failed to reset token usage:", error);
    throw error;
  }
}

/**
 * Check if a user has their own API key stored
 * Users with their own API key bypass token limits
 */
export async function hasOwnApiKey(userId: string): Promise<boolean> {
  try {
    const result = await db
      .select({ id: userApiKey.id })
      .from(userApiKey)
      .where(
        and(eq(userApiKey.userId, userId), eq(userApiKey.provider, "google"))
      )
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error("Failed to check for user API key:", error);
    return false;
  }
}

// =============================================
// Credit System Functions (Phase 4)
// =============================================

// Resolution type (matches validation constants)
export type Resolution = "1K" | "2K" | "4K";

// Credit cost per resolution tier
const RESOLUTION_CREDIT_COSTS: Record<Resolution, number> = {
  "1K": 1,  // ≤1024px
  "2K": 2,  // ≤2048px
  "4K": 4,  // ≤4096px
};

/**
 * Get the credit cost for a given resolution
 * @param resolution - The resolution tier ("1K", "2K", or "4K")
 * @returns Number of credits required for this resolution
 */
export function getCreditsForResolution(resolution: Resolution): number {
  return RESOLUTION_CREDIT_COSTS[resolution] ?? RESOLUTION_CREDIT_COSTS["1K"];
}

/**
 * Get the credit cost for a resolution by pixel dimensions
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns Number of credits required based on the larger dimension
 */
export function getCreditsForDimensions(width: number, height: number): number {
  const maxDimension = Math.max(width, height);

  if (maxDimension <= 1024) {
    return RESOLUTION_CREDIT_COSTS["1K"]; // 1 credit
  } else if (maxDimension <= 2048) {
    return RESOLUTION_CREDIT_COSTS["2K"]; // 2 credits
  } else {
    return RESOLUTION_CREDIT_COSTS["4K"]; // 4 credits
  }
}

// Subscription tier types
// - "starter" grants 100 credits/month (metered through the credit ledger)
// - "pro" is the unlimited (soft-capped) AI generation subscription
// - "byok" is BYOK Pro - allows users to use their own API key with priority processing
export type SubscriptionTier = "starter" | "pro" | "byok";

// Legacy DB values from the pre-Stripe era; kept as a defensive
// normalizer in case any old rows remain. Normalized on read via LEGACY_TIER_MAP.
export type LegacySubscriptionTier = "monthly" | "yearly";

const LEGACY_TIER_MAP: Record<LegacySubscriptionTier, SubscriptionTier> = {
  monthly: "pro",
  yearly: "pro",
};

/**
 * Normalize a raw subscription_tier DB value to the current tier model
 */
function normalizeTier(raw: string | null): SubscriptionTier | null {
  if (!raw) return null;
  if (raw in LEGACY_TIER_MAP) {
    return LEGACY_TIER_MAP[raw as LegacySubscriptionTier];
  }
  return raw as SubscriptionTier;
}

// Credit transaction types
// Note: "subscription_usage" logs generations made by subscribers (amount=0) for audit trail
export type CreditTransactionType = "purchase" | "usage" | "refund" | "admin_grant" | "subscription_usage";

// Subscription soft cap (500 generations per month)
const SUBSCRIPTION_SOFT_CAP = 500;

// Subscription info interface
export interface SubscriptionInfo {
  tier: SubscriptionTier | null;
  isActive: boolean;
  expiresAt: Date | null;
  startedAt: Date | null;
  daysRemaining: number | null;
}

// Generation eligibility result
export interface GenerationEligibility {
  allowed: boolean;
  reason: "byok" | "subscription" | "credits" | "no_credits" | "not_authenticated" | "soft_cap_exceeded" | "insufficient_credits";
  /**
   * The user's effective tier for display purposes.
   * Tier Priority (highest to lowest):
   * 1. byok - User has their own API key (unlimited usage)
   * 2. subscription - User has active monthly/yearly subscription
   * 3. credits - User has purchased credits
   * 4. free - No payment method (cannot generate)
   */
  effectiveTier: "free" | "credits" | "subscription" | "byok";
  creditsRemaining?: number;
  /** Number of credits needed for the requested generation */
  creditsNeeded?: number;
  subscriptionUsage?: number;
  softCapWarning?: boolean;
  /** Whether soft cap is being enforced (blocks generation when exceeded) */
  softCapEnforced?: boolean;
}

/**
 * Get the user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const result = await db
      .select({ creditBalance: user.creditBalance })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (result.length === 0) {
      return 0;
    }

    return result[0].creditBalance;
  } catch (error) {
    console.error("Failed to get user credits:", error);
    return 0;
  }
}

/**
 * Check if a user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const result = await db
      .select({
        subscriptionTier: user.subscriptionTier,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (result.length === 0) {
      return false;
    }

    const { subscriptionTier, subscriptionExpiresAt } = result[0];

    // Must have a tier and expiration date
    if (!subscriptionTier || !subscriptionExpiresAt) {
      return false;
    }

    // Check if subscription is not expired
    return new Date() < subscriptionExpiresAt;
  } catch (error) {
    console.error("Failed to check subscription status:", error);
    return false;
  }
}

/**
 * Get detailed subscription information for a user
 */
export async function getSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
  try {
    const result = await db
      .select({
        subscriptionTier: user.subscriptionTier,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        subscriptionStartedAt: user.subscriptionStartedAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (result.length === 0) {
      return {
        tier: null,
        isActive: false,
        expiresAt: null,
        startedAt: null,
        daysRemaining: null,
      };
    }

    const { subscriptionTier, subscriptionExpiresAt, subscriptionStartedAt } = result[0];

    const isActive = !!(
      subscriptionTier &&
      subscriptionExpiresAt &&
      new Date() < subscriptionExpiresAt
    );

    let daysRemaining: number | null = null;
    if (isActive && subscriptionExpiresAt) {
      const now = new Date();
      const msRemaining = subscriptionExpiresAt.getTime() - now.getTime();
      daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
    }

    return {
      tier: normalizeTier(subscriptionTier),
      isActive,
      expiresAt: subscriptionExpiresAt,
      startedAt: subscriptionStartedAt,
      daysRemaining,
    };
  } catch (error) {
    console.error("Failed to get subscription info:", error);
    return {
      tier: null,
      isActive: false,
      expiresAt: null,
      startedAt: null,
      daysRemaining: null,
    };
  }
}

/**
 * Check subscription usage against soft cap (500/month)
 * Returns usage count and whether the soft cap has been exceeded
 */
export async function checkSoftCap(userId: string): Promise<{
  usage: number;
  exceeded: boolean;
  remaining: number;
}> {
  const month = getCurrentMonth();
  const usage = await getTokenUsage(userId, month);

  return {
    usage,
    exceeded: usage >= SUBSCRIPTION_SOFT_CAP,
    remaining: Math.max(0, SUBSCRIPTION_SOFT_CAP - usage),
  };
}

// Free tier: monthly credit top-up target (lazy grant, no cron)
const FREE_MONTHLY_CREDITS = 10;

/**
 * Lazily top a free user's balance up to FREE_MONTHLY_CREDITS once per calendar month.
 * No-op when the month is already stamped, or the user has an active subscription or BYOK key.
 * Called from canGenerateWithDetails() before the credits check — no scheduler needed.
 */
export async function ensureMonthlyFreeCredits(userId: string): Promise<void> {
  try {
    const currentMonth = getCurrentMonth();

    const result = await db
      .select({ freeCreditsGrantedMonth: user.freeCreditsGrantedMonth })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (result.length === 0) return;
    if (result[0].freeCreditsGrantedMonth === currentMonth) return;

    // Only free users get the monthly top-up
    const [hasApiKey, isSubscribed] = await Promise.all([
      hasOwnApiKey(userId),
      hasActiveSubscription(userId),
    ]);
    if (hasApiKey || isSubscribed) return;

    // Atomically claim this month's grant: the conditional UPDATE only matches
    // while the stamp is stale, so concurrent requests can't double-grant.
    const claimed = await db
      .update(user)
      .set({ freeCreditsGrantedMonth: currentMonth, updatedAt: new Date() })
      .where(
        and(
          eq(user.id, userId),
          or(
            isNull(user.freeCreditsGrantedMonth),
            ne(user.freeCreditsGrantedMonth, currentMonth)
          )
        )
      )
      .returning({ creditBalance: user.creditBalance });

    if (claimed.length === 0) return; // another request already granted this month

    const { creditBalance } = claimed[0];
    if (creditBalance < FREE_MONTHLY_CREDITS) {
      await addCredits(
        userId,
        FREE_MONTHLY_CREDITS - creditBalance,
        "admin_grant",
        "Monthly free credits"
      );
    }
  } catch (error) {
    // Never block an eligibility check on the top-up
    console.error("Failed to ensure monthly free credits:", error);
  }
}

// =============================================
// Founding Member Primitives
// =============================================

const FOUNDING_MEMBER_CAP = 100;

/**
 * Count users flagged as founding members
 */
export async function getFoundingMemberCount(): Promise<number> {
  try {
    const result = await db
      .select({ value: count() })
      .from(user)
      .where(eq(user.foundingMember, true));

    return result[0]?.value ?? 0;
  } catch (error) {
    console.error("Failed to get founding member count:", error);
    return 0;
  }
}

/**
 * Flag a user as a founding member. Idempotent; no-op once the cap
 * (first 100 paying customers) is reached.
 * @returns true if the user is a founding member after this call
 */
export async function markFoundingMember(userId: string): Promise<boolean> {
  try {
    return await db.transaction(async (tx) => {
      // Serialize cap checks so concurrent checkouts can't overshoot 100
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtext('founding_member_cap'))`
      );

      const result = await tx
        .select({ foundingMember: user.foundingMember })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (result.length === 0) return false;
      if (result[0].foundingMember) return true;

      const countResult = await tx
        .select({ value: count() })
        .from(user)
        .where(eq(user.foundingMember, true));
      if ((countResult[0]?.value ?? 0) >= FOUNDING_MEMBER_CAP) return false;

      await tx
        .update(user)
        .set({ foundingMember: true, updatedAt: new Date() })
        .where(eq(user.id, userId));

      return true;
    });
  } catch (error) {
    console.error("Failed to mark founding member:", error);
    return false;
  }
}

// Check if soft cap enforcement is enabled via environment variable
const isSoftCapEnforced = (): boolean => {
  const envValue = process.env.ENFORCE_SOFT_CAP;
  return envValue === "true" || envValue === "1";
};

/**
 * Enhanced canGenerate check with new priority logic:
 *
 * Tier Priority (highest to lowest):
 * 1. BYOK → allow unlimited (user has their own API key)
 * 2. Active subscription → allow (track for soft cap, 500/month warning at 80%)
 *    - If ENFORCE_SOFT_CAP=true and soft cap exceeded, deny with reason "soft_cap_exceeded"
 * 3. Credits >= creditsNeeded → allow (pay-per-use credits)
 * 4. Free tier → deny (no valid payment method)
 *
 * @param userId - The user's ID
 * @param creditsNeeded - Number of credits needed for this generation (default: 1)
 * @returns GenerationEligibility with allowed status, reason, and effectiveTier
 */
export async function canGenerateWithDetails(
  userId: string,
  creditsNeeded: number = 1
): Promise<GenerationEligibility> {
  try {
    const softCapEnforced = isSoftCapEnforced();

    // Priority 1: Check for BYOK (Bring Your Own Key)
    const hasApiKey = await hasOwnApiKey(userId);
    if (hasApiKey) {
      return {
        allowed: true,
        reason: "byok",
        effectiveTier: "byok",
        creditsNeeded,
        softCapEnforced,
      };
    }

    // Priority 2: Check for active Pro subscription (soft-capped unlimited).
    // Starter subscribers land in the credits path below — their allowance is
    // granted as monthly credits, not unlimited access (spec R4).
    const subscriptionInfo = await getSubscriptionInfo(userId);
    if (subscriptionInfo.isActive && subscriptionInfo.tier === "pro") {
      const softCapStatus = await checkSoftCap(userId);
      const softCapWarning = softCapStatus.usage >= SUBSCRIPTION_SOFT_CAP * 0.8; // Warn at 80%

      // If enforcement is enabled and soft cap exceeded, deny
      if (softCapEnforced && softCapStatus.exceeded) {
        return {
          allowed: false,
          reason: "soft_cap_exceeded",
          effectiveTier: "subscription",
          creditsNeeded,
          subscriptionUsage: softCapStatus.usage,
          softCapWarning: true,
          softCapEnforced,
        };
      }

      return {
        allowed: true,
        reason: "subscription",
        effectiveTier: "subscription",
        creditsNeeded,
        subscriptionUsage: softCapStatus.usage,
        softCapWarning,
        softCapEnforced,
      };
    }

    // Priority 3: Check for credits
    // Free users get a lazy monthly top-up to 10 credits before the balance check
    await ensureMonthlyFreeCredits(userId);
    const credits = await getUserCredits(userId);
    if (credits >= creditsNeeded) {
      return {
        allowed: true,
        reason: "credits",
        effectiveTier: "credits",
        creditsRemaining: credits,
        creditsNeeded,
        softCapEnforced,
      };
    }

    // User has some credits but not enough for this resolution
    if (credits > 0) {
      return {
        allowed: false,
        reason: "insufficient_credits",
        effectiveTier: "credits",
        creditsRemaining: credits,
        creditsNeeded,
        softCapEnforced,
      };
    }

    // Priority 4: Deny - no valid payment method (free tier)
    return {
      allowed: false,
      reason: "no_credits",
      effectiveTier: "free",
      creditsRemaining: 0,
      creditsNeeded,
      softCapEnforced,
    };
  } catch (error) {
    console.error("Failed to check generation eligibility:", error);
    return {
      allowed: false,
      reason: "no_credits",
      effectiveTier: "free",
    };
  }
}

/**
 * Consume credits from user's balance and log the transaction
 * @param userId - The user's ID
 * @param amount - Number of credits to consume (positive number)
 * @param description - Optional description for the transaction
 * @returns The new balance, or null if insufficient credits
 */
export async function consumeCredit(
  userId: string,
  amount: number = 1,
  description?: string
): Promise<number | null> {
  try {
    // Get current balance
    const currentBalance = await getUserCredits(userId);

    if (currentBalance < amount) {
      console.warn(`Insufficient credits for user ${userId}: has ${currentBalance}, needs ${amount}`);
      return null;
    }

    const newBalance = currentBalance - amount;

    // Update user balance and create transaction in a transaction
    await db.transaction(async (tx) => {
      // Update user balance
      await tx
        .update(user)
        .set({
          creditBalance: newBalance,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      // Create transaction record
      await tx.insert(creditTransaction).values({
        id: nanoid(),
        userId,
        amount: -amount, // Negative for consumption
        type: "usage",
        description: description || "Image generation",
        balanceAfter: newBalance,
        createdAt: new Date(),
      });
    });

    return newBalance;
  } catch (error) {
    console.error("Failed to consume credits:", error);
    throw error;
  }
}

/**
 * Add credits to user's balance and log the transaction
 * @param userId - The user's ID
 * @param amount - Number of credits to add
 * @param type - Type of transaction (purchase, refund, admin_grant)
 * @param description - Optional description
 * @returns The new balance
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: Exclude<CreditTransactionType, "usage">,
  description?: string
): Promise<number> {
  try {
    // Get current balance
    const currentBalance = await getUserCredits(userId);
    const newBalance = currentBalance + amount;

    // Update user balance and create transaction
    await db.transaction(async (tx) => {
      // Update user balance
      await tx
        .update(user)
        .set({
          creditBalance: newBalance,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      // Create transaction record
      await tx.insert(creditTransaction).values({
        id: nanoid(),
        userId,
        amount: amount, // Positive for additions
        type,
        description: description || `Credit ${type}`,
        balanceAfter: newBalance,
        createdAt: new Date(),
      });
    });

    return newBalance;
  } catch (error) {
    console.error("Failed to add credits:", error);
    throw error;
  }
}

/**
 * Activate a subscription for a user
 * @param userId - The user's ID
 * @param tier - Subscription tier (legacy monthly/yearly still accepted defensively)
 * @param expiresAt - Exact expiration (e.g. Stripe's current_period_end); computed from tier when omitted
 * @returns Success status
 */
export async function activateSubscription(
  userId: string,
  tier: SubscriptionTier | LegacySubscriptionTier,
  expiresAt?: Date
): Promise<boolean> {
  try {
    const now = new Date();

    if (!expiresAt) {
      // Calculate expiration based on tier (fallback when caller passes no date)
      expiresAt = new Date(now);
      if (tier === "yearly") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }
    }

    await db
      .update(user)
      .set({
        subscriptionTier: tier,
        subscriptionStartedAt: now,
        subscriptionExpiresAt: expiresAt,
        updatedAt: now,
      })
      .where(eq(user.id, userId));

    console.log(`Activated ${tier} subscription for user ${userId}, expires ${expiresAt.toISOString()}`);
    return true;
  } catch (error) {
    console.error("Failed to activate subscription:", error);
    return false;
  }
}

/**
 * Cancel a user's subscription
 * Note: This doesn't immediately remove access - subscription remains active until expiration
 * @param userId - The user's ID
 * @returns Success status
 */
export async function cancelSubscription(userId: string): Promise<boolean> {
  try {
    // We don't clear the subscription immediately - it remains until expiration
    // This function is called when the subscription won't renew
    // The user keeps access until subscriptionExpiresAt

    // For now, we just log this. In a real system, you might:
    // - Set a "cancellation_requested_at" timestamp
    // - Send a confirmation email
    // - Update a "will_renew" flag to false

    console.log(`Subscription cancellation requested for user ${userId}`);

    // If you want to immediately cancel, uncomment below:
    // await db
    //   .update(user)
    //   .set({
    //     subscriptionTier: null,
    //     subscriptionExpiresAt: null,
    //     updatedAt: new Date(),
    //   })
    //   .where(eq(user.id, userId));

    return true;
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return false;
  }
}

/**
 * Immediately end a user's subscription (for admin use or immediate cancellations)
 * @param userId - The user's ID
 * @returns Success status
 */
export async function endSubscriptionImmediately(userId: string): Promise<boolean> {
  try {
    await db
      .update(user)
      .set({
        subscriptionTier: null,
        subscriptionExpiresAt: null,
        // Keep subscriptionStartedAt for historical records
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    console.log(`Immediately ended subscription for user ${userId}`);
    return true;
  } catch (error) {
    console.error("Failed to end subscription immediately:", error);
    return false;
  }
}

/**
 * Extend a subscription (for renewals or manual extensions)
 * @param userId - The user's ID
 * @param tier - The tier to extend (defaults to current tier; legacy monthly/yearly still accepted)
 * @param expiresAt - Exact new expiration (e.g. Stripe's current_period_end); computed when omitted
 * @returns Success status
 */
export async function extendSubscription(
  userId: string,
  tier?: SubscriptionTier | LegacySubscriptionTier,
  expiresAt?: Date
): Promise<boolean> {
  try {
    // Get current subscription info
    const info = await getSubscriptionInfo(userId);

    const subscriptionTier = tier || info.tier;
    if (!subscriptionTier) {
      console.error("Cannot extend subscription without a tier");
      return false;
    }

    let newExpiresAt: Date;
    if (expiresAt) {
      newExpiresAt = expiresAt;
    } else {
      // Calculate new expiration from current expiration (or now if expired)
      const baseDate = info.expiresAt && info.expiresAt > new Date()
        ? info.expiresAt
        : new Date();

      newExpiresAt = new Date(baseDate);
      if (subscriptionTier === "yearly") {
        newExpiresAt.setFullYear(newExpiresAt.getFullYear() + 1);
      } else {
        newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);
      }
    }

    await db
      .update(user)
      .set({
        subscriptionTier: subscriptionTier,
        subscriptionExpiresAt: newExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    console.log(`Extended ${subscriptionTier} subscription for user ${userId}, new expiration: ${newExpiresAt.toISOString()}`);
    return true;
  } catch (error) {
    console.error("Failed to extend subscription:", error);
    return false;
  }
}

/**
 * Log subscription usage to the credit transaction table for audit trail
 * This logs generations made by subscribers with amount=0 (no credits consumed)
 * Ensures billing history shows all generations regardless of payment method
 *
 * @param userId - The user's ID
 * @param imageCount - Number of images generated
 * @param description - Optional description for the transaction
 */
export async function logSubscriptionUsage(
  userId: string,
  imageCount: number = 1,
  description?: string
): Promise<void> {
  try {
    // Get current credit balance for the balanceAfter field
    const currentBalance = await getUserCredits(userId);

    // Create transaction record with amount=0 (no credits consumed)
    await db.insert(creditTransaction).values({
      id: nanoid(),
      userId,
      amount: 0, // No credits consumed for subscription usage
      type: "subscription_usage",
      description: description || `Subscription: Generated ${imageCount} image(s)`,
      balanceAfter: currentBalance,
      createdAt: new Date(),
    });
  } catch (error) {
    // Log error but don't throw - audit trail failure shouldn't block generation
    console.error("Failed to log subscription usage:", error);
  }
}

// =============================================
// User Tier Data for UI (Phase 3)
// =============================================

/**
 * Effective tier type for UI display
 *
 * Tier Priority (highest to lowest):
 * 1. byok - User has their own API key (unlimited usage)
 * 2. subscription - User has active monthly/yearly subscription
 * 3. credits - User has purchased credits
 * 4. free - No payment method (cannot generate)
 */
export type EffectiveTier = "free" | "credits" | "subscription" | "byok";

/**
 * Complete user tier data for UI components
 * This consolidates all tier-related information into a single object
 */
export interface UserTierData {
  /** The user's effective tier based on priority: byok > subscription > credits > free */
  effectiveTier: EffectiveTier;
  /** Whether user has their own API key (unlimited usage) */
  hasByok: boolean;
  /** Whether user has an active subscription */
  hasSubscription: boolean;
  /** Subscription tier if active */
  subscriptionTier: SubscriptionTier | null;
  /** Days remaining in subscription */
  subscriptionDaysRemaining: number | null;
  /** Available credits balance */
  creditsRemaining: number;
  /** Monthly usage count (for subscription users) */
  monthlyUsage: number;
  /** Soft cap limit for subscribers */
  softCapLimit: number;
  /** Whether approaching soft cap (80%+) */
  softCapWarning: boolean;
}

/**
 * Fetch complete user tier data for UI display
 * This is the primary function for getting all tier information at once
 *
 * @param userId - The user's ID
 * @returns Complete tier data for UI components
 */
export async function getUserTierData(userId: string): Promise<UserTierData> {
  try {
    // Fetch all data in parallel for performance
    const [hasByok, subscriptionInfo, credits, softCapStatus] = await Promise.all([
      hasOwnApiKey(userId),
      getSubscriptionInfo(userId),
      getUserCredits(userId),
      checkSoftCap(userId),
    ]);

    // Determine effective tier based on priority
    let effectiveTier: EffectiveTier;
    if (hasByok) {
      effectiveTier = "byok";
    } else if (subscriptionInfo.isActive) {
      effectiveTier = "subscription";
    } else if (credits > 0) {
      effectiveTier = "credits";
    } else {
      effectiveTier = "free";
    }

    return {
      effectiveTier,
      hasByok,
      hasSubscription: subscriptionInfo.isActive,
      subscriptionTier: subscriptionInfo.tier,
      subscriptionDaysRemaining: subscriptionInfo.daysRemaining,
      creditsRemaining: credits,
      monthlyUsage: softCapStatus.usage,
      softCapLimit: SUBSCRIPTION_SOFT_CAP,
      softCapWarning: softCapStatus.usage >= SUBSCRIPTION_SOFT_CAP * 0.8,
    };
  } catch (error) {
    console.error("Failed to get user tier data:", error);
    // Return safe defaults on error
    return {
      effectiveTier: "free",
      hasByok: false,
      hasSubscription: false,
      subscriptionTier: null,
      subscriptionDaysRemaining: null,
      creditsRemaining: 0,
      monthlyUsage: 0,
      softCapLimit: SUBSCRIPTION_SOFT_CAP,
      softCapWarning: false,
    };
  }
}
