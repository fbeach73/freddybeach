import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { claim, business, user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import {
  sendEmail,
  getClaimApprovedEmailHtml,
  getClaimApprovedEmailSubject,
  getClaimRejectedEmailHtml,
  getClaimRejectedEmailSubject,
} from "@/lib/email";

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

    const now = new Date();

    if (action === "approve") {
      // Approve the claim - use transaction for atomicity
      // Status check is inside transaction to prevent race conditions
      const result = await db.transaction(async (tx) => {
        // Re-fetch claim inside transaction to ensure it's still pending
        const [currentClaim] = await tx
          .select({ status: claim.status })
          .from(claim)
          .where(eq(claim.id, id));

        if (!currentClaim || currentClaim.status !== "pending") {
          return { error: "Claim has already been reviewed", alreadyProcessed: true };
        }

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

        return { success: true };
      });

      if ("alreadyProcessed" in result) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      // Send approval email notification to user
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      try {
        await sendEmail({
          to: existingClaim.userEmail,
          subject: getClaimApprovedEmailSubject(existingClaim.businessName),
          html: getClaimApprovedEmailHtml({
            userName: existingClaim.userName || "there",
            businessName: existingClaim.businessName,
            dashboardUrl: `${appUrl}/dashboard/my-businesses`,
          }),
        });
      } catch (emailError) {
        // Log but don't fail the request if email fails
        console.error("Failed to send approval email:", emailError);
      }

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

      // Use transaction with status check to prevent race conditions
      const result = await db.transaction(async (tx) => {
        // Re-fetch claim inside transaction to ensure it's still pending
        const [currentClaim] = await tx
          .select({ status: claim.status })
          .from(claim)
          .where(eq(claim.id, id));

        if (!currentClaim || currentClaim.status !== "pending") {
          return { error: "Claim has already been reviewed", alreadyProcessed: true };
        }

        await tx
          .update(claim)
          .set({
            status: "rejected",
            rejectionReason: rejectionReason.trim(),
            reviewedAt: now,
            reviewedBy: session.user.id,
          })
          .where(eq(claim.id, id));

        return { success: true };
      });

      if ("alreadyProcessed" in result) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      // Send rejection email notification to user with reason
      try {
        await sendEmail({
          to: existingClaim.userEmail,
          subject: getClaimRejectedEmailSubject(existingClaim.businessName),
          html: getClaimRejectedEmailHtml({
            userName: existingClaim.userName || "there",
            businessName: existingClaim.businessName,
            rejectionReason: rejectionReason.trim(),
          }),
        });
      } catch (emailError) {
        // Log but don't fail the request if email fails
        console.error("Failed to send rejection email:", emailError);
      }

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
