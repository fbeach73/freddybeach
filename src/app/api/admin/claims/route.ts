import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { claim, business, user } from "@/lib/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/admin/claims
 * Get all claims with business and user info (admin only)
 * Supports optional status filter via query param
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get optional status filter from query params
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    // Build query with joins
    let query = db
      .select({
        id: claim.id,
        businessId: claim.businessId,
        businessName: business.name,
        businessSlug: business.slug,
        userId: claim.userId,
        userName: user.name,
        userEmail: user.email,
        role: claim.role,
        phone: claim.phone,
        description: claim.description,
        status: claim.status,
        rejectionReason: claim.rejectionReason,
        createdAt: claim.createdAt,
        reviewedAt: claim.reviewedAt,
        reviewedBy: claim.reviewedBy,
      })
      .from(claim)
      .innerJoin(business, eq(claim.businessId, business.id))
      .innerJoin(user, eq(claim.userId, user.id))
      .$dynamic();

    // Apply status filter if provided
    if (statusFilter && ["pending", "approved", "rejected"].includes(statusFilter)) {
      query = query.where(eq(claim.status, statusFilter as "pending" | "approved" | "rejected"));
    }

    const claims = await query.orderBy(claim.createdAt);

    return NextResponse.json({ claims });
  } catch (error) {
    console.error("Get admin claims error:", error);
    return NextResponse.json(
      { error: "Failed to get claims" },
      { status: 500 }
    );
  }
}
