import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { claim, business, user } from "@/lib/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/claims/[id]
 * Approve or reject a claim (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, rejectionReason } = body;

    // Validate action
    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Get the claim with business and user info
    const [existingClaim] = await db
      .select({
        id: claim.id,
        businessId: claim.businessId,
        userId: claim.userId,
        status: claim.status,
        businessName: business.name,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
      })
      .from(claim)
      .innerJoin(business, eq(claim.businessId, business.id))
      .innerJoin(user, eq(claim.userId, user.id))
      .where(eq(claim.id, id));

    if (!existingClaim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Ensure claim is still pending
    if (existingClaim.status !== "pending") {
      return NextResponse.json(
        { error: "Claim has already been reviewed" },
        { status: 400 }
      );
    }

    const now = new Date();

    if (action === "approve") {
      // Approve the claim - use transaction for atomicity
      await db.transaction(async (tx) => {
        // Update claim status
        await tx
          .update(claim)
          .set({
            status: "approved",
            reviewedAt: now,
            reviewedBy: session.user.id,
          })
          .where(eq(claim.id, id));

        // Set business ownership
        await tx
          .update(business)
          .set({
            ownerId: existingClaim.userId,
            claimedAt: now,
          })
          .where(eq(business.id, existingClaim.businessId));

        // Upgrade user role from "user" to "client" if applicable
        if (existingClaim.userRole === "user") {
          await tx
            .update(user)
            .set({ role: "client" })
            .where(eq(user.id, existingClaim.userId));
        }
      });

      // TODO: Send approval email notification to user
      // Will be implemented via Mailgun in separate branch

      return NextResponse.json({
        success: true,
        message: `Claim approved. ${existingClaim.userName} is now the owner of ${existingClaim.businessName}.`,
        claim: {
          id,
          status: "approved",
          reviewedAt: now,
        },
      });
    } else {
      // Reject the claim
      if (!rejectionReason || rejectionReason.trim() === "") {
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        );
      }

      await db
        .update(claim)
        .set({
          status: "rejected",
          rejectionReason: rejectionReason.trim(),
          reviewedAt: now,
          reviewedBy: session.user.id,
        })
        .where(eq(claim.id, id));

      // TODO: Send rejection email notification to user with reason
      // Will be implemented via Mailgun in separate branch

      return NextResponse.json({
        success: true,
        message: `Claim rejected.`,
        claim: {
          id,
          status: "rejected",
          rejectionReason: rejectionReason.trim(),
          reviewedAt: now,
        },
      });
    }
  } catch (error) {
    console.error("Update claim error:", error);
    return NextResponse.json(
      { error: "Failed to update claim" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/claims/[id]
 * Get a single claim with full details (admin only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const [existingClaim] = await db
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
      .where(eq(claim.id, id));

    if (!existingClaim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    return NextResponse.json({ claim: existingClaim });
  } catch (error) {
    console.error("Get claim error:", error);
    return NextResponse.json(
      { error: "Failed to get claim" },
      { status: 500 }
    );
  }
}
