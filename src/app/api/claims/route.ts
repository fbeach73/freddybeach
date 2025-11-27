import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { claim, business } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

const VALID_ROLES = ["owner", "manager", "authorized_representative"] as const;
type ClaimRole = (typeof VALID_ROLES)[number];

/**
 * POST /api/claims
 * Submit a claim for a business
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, role, phone, description } = body;

    // Validate required fields
    if (!businessId || !role || !phone || !description) {
      return NextResponse.json(
        { error: "Missing required fields: businessId, role, phone, description" },
        { status: 400 }
      );
    }

    // Validate role
    if (!VALID_ROLES.includes(role as ClaimRole)) {
      return NextResponse.json(
        { error: "Invalid role. Must be one of: owner, manager, authorized_representative" },
        { status: 400 }
      );
    }

    // Check business exists
    const [existingBusiness] = await db
      .select({ id: business.id, ownerId: business.ownerId, name: business.name })
      .from(business)
      .where(eq(business.id, businessId));

    if (!existingBusiness) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Check if business is already claimed
    if (existingBusiness.ownerId) {
      return NextResponse.json(
        { error: "This business has already been claimed" },
        { status: 400 }
      );
    }

    // Check for existing pending claim by this user for this business
    const [existingClaim] = await db
      .select({ id: claim.id })
      .from(claim)
      .where(
        and(
          eq(claim.businessId, businessId),
          eq(claim.userId, session.user.id),
          eq(claim.status, "pending")
        )
      );

    if (existingClaim) {
      return NextResponse.json(
        { error: "You already have a pending claim for this business" },
        { status: 400 }
      );
    }

    // Create the claim
    const [newClaim] = await db
      .insert(claim)
      .values({
        id: nanoid(),
        businessId,
        userId: session.user.id,
        role: role as ClaimRole,
        phone,
        description,
        status: "pending",
      })
      .returning();

    // TODO: Send email notification to admin about new claim
    // Will be implemented via Mailgun in separate branch

    return NextResponse.json({
      success: true,
      claim: {
        id: newClaim.id,
        businessId: newClaim.businessId,
        businessName: existingBusiness.name,
        status: newClaim.status,
        createdAt: newClaim.createdAt,
      },
    });
  } catch (error) {
    console.error("Create claim error:", error);
    return NextResponse.json(
      { error: "Failed to submit claim" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/claims
 * Get current user's claims with business names and statuses
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userClaims = await db
      .select({
        id: claim.id,
        businessId: claim.businessId,
        businessName: business.name,
        role: claim.role,
        status: claim.status,
        createdAt: claim.createdAt,
        reviewedAt: claim.reviewedAt,
        rejectionReason: claim.rejectionReason,
      })
      .from(claim)
      .innerJoin(business, eq(claim.businessId, business.id))
      .where(eq(claim.userId, session.user.id))
      .orderBy(claim.createdAt);

    return NextResponse.json({ claims: userClaims });
  } catch (error) {
    console.error("Get claims error:", error);
    return NextResponse.json(
      { error: "Failed to get claims" },
      { status: 500 }
    );
  }
}
