import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import {
  getOwnedBusinessesForUser,
  hasToolAccess,
} from "@/lib/auth/tool-access";

export type ResolvedBusiness = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

export type ResolveResult =
  | { kind: "unauthenticated" }
  | { kind: "no-businesses" }
  | { kind: "no-access"; businesses: ResolvedBusiness[]; active: ResolvedBusiness }
  | {
      kind: "ok";
      businesses: ResolvedBusiness[];
      active: ResolvedBusiness;
      accessType: "free" | "gifted" | "trial" | "paid";
      expiresAt: Date | null;
    };

/**
 * Shared resolver for every page under /ai-tools/review-collector.
 * Determines the active business from ?businessId, validates ownership,
 * and confirms the Review Collector tool is unlocked for that business.
 */
export async function resolveActiveBusiness(
  businessIdParam: string | undefined
): Promise<ResolveResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { kind: "unauthenticated" };

  const owned = await getOwnedBusinessesForUser(session.user.id);
  if (owned.length === 0) return { kind: "no-businesses" };

  const active =
    (businessIdParam && owned.find((b) => b.id === businessIdParam)) ||
    owned[0]!;

  const access = await hasToolAccess(active.id, "review-collector");
  if (!access.allowed) {
    return { kind: "no-access", businesses: owned, active };
  }

  return {
    kind: "ok",
    businesses: owned,
    active,
    accessType: access.accessType ?? "free",
    expiresAt: access.expiresAt,
  };
}
