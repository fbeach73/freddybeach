import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface StatusUpdateBody {
  status: "draft" | "pending_review" | "published" | "archived";
}

/**
 * PATCH /api/admin/businesses/[id]/status
 * Update a business's publication status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check admin authentication
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as StatusUpdateBody;

    const validStatuses = ["draft", "pending_review", "published", "archived"];
    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'draft', 'pending_review', 'published', or 'archived'" },
        { status: 400 }
      );
    }

    // Look up the current row so we can promote the submitter to owner on
    // approval. Only stamp ownerId when transitioning to published and the
    // listing has a submitter but no owner yet.
    const [current] = await db
      .select({
        ownerId: business.ownerId,
        submittedById: business.submittedById,
      })
      .from(business)
      .where(eq(business.id, id));

    if (!current) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const shouldStampOwner =
      body.status === "published" &&
      !current.ownerId &&
      !!current.submittedById;

    const updateData: {
      status: typeof body.status;
      ownerId?: string;
      claimedAt?: Date;
    } = { status: body.status };

    if (shouldStampOwner) {
      updateData.ownerId = current.submittedById!;
      updateData.claimedAt = new Date();
    }

    const [updated] = await db
      .update(business)
      .set(updateData)
      .where(eq(business.id, id))
      .returning({
        id: business.id,
        status: business.status,
        ownerId: business.ownerId,
      });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { error: "Failed to update business status" },
      { status: 500 }
    );
  }
}
