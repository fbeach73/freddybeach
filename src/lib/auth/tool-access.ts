import { db } from "@/lib/db";
import { business, businessTool } from "@/lib/schema";
import { and, eq, or } from "drizzle-orm";

export type ToolAccessType = "free" | "gifted" | "trial" | "paid";

export interface ToolAccessResult {
  allowed: boolean;
  accessType: ToolAccessType | null;
  expiresAt: Date | null;
  expired: boolean;
}

/**
 * Check whether a business has been granted access to a specific tool.
 * A trial grant whose `expires_at` has passed counts as denied.
 */
export async function hasToolAccess(
  businessId: string,
  toolSlug: string
): Promise<ToolAccessResult> {
  const [grant] = await db
    .select({
      accessType: businessTool.accessType,
      expiresAt: businessTool.expiresAt,
    })
    .from(businessTool)
    .where(
      and(
        eq(businessTool.businessId, businessId),
        eq(businessTool.toolSlug, toolSlug)
      )
    )
    .limit(1);

  if (!grant) {
    return { allowed: false, accessType: null, expiresAt: null, expired: false };
  }

  const expired =
    grant.expiresAt instanceof Date && grant.expiresAt.getTime() < Date.now();

  return {
    allowed: !expired,
    accessType: grant.accessType,
    expiresAt: grant.expiresAt ?? null,
    expired,
  };
}

/**
 * Fetch all businesses owned by (or submitted by) a user.
 * Used by per-business tool pages to power the business picker.
 */
export async function getOwnedBusinessesForUser(userId: string) {
  return db
    .select({
      id: business.id,
      name: business.name,
      slug: business.slug,
      imageUrl: business.imageUrl,
    })
    .from(business)
    .where(
      or(eq(business.ownerId, userId), eq(business.submittedById, userId))
    );
}

/**
 * Fetch every tool grant for a single business, keyed by tool slug.
 * Used to render the tool grid with state badges.
 */
export async function getToolGrantsForBusiness(businessId: string) {
  const rows = await db
    .select({
      toolSlug: businessTool.toolSlug,
      accessType: businessTool.accessType,
      expiresAt: businessTool.expiresAt,
    })
    .from(businessTool)
    .where(eq(businessTool.businessId, businessId));

  const now = Date.now();
  const map = new Map<
    string,
    { accessType: ToolAccessType; expiresAt: Date | null; expired: boolean }
  >();

  for (const row of rows) {
    const expired =
      row.expiresAt instanceof Date && row.expiresAt.getTime() < now;
    map.set(row.toolSlug, {
      accessType: row.accessType,
      expiresAt: row.expiresAt ?? null,
      expired,
    });
  }

  return map;
}
