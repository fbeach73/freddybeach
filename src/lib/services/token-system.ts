import { db } from "@/lib/db";
import { userTokenUsage, user } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
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
 */
export function getTokenLimit(tier: UserTier): number {
  return TOKEN_LIMITS[tier] || TOKEN_LIMITS.free;
}

/**
 * Get the user's tier based on their role
 * This maps user roles to feature tiers
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
    const { userApiKey } = await import("@/lib/schema");

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
