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
  status: "draft" | "published";
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

    if (!body.status || !["draft", "published"].includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'draft' or 'published'" },
        { status: 400 }
      );
    }

    // Update the business status
    const [updated] = await db
      .update(business)
      .set({ status: body.status })
      .where(eq(business.id, id))
      .returning({ id: business.id, status: business.status });

    if (!updated) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { error: "Failed to update business status" },
      { status: 500 }
    );
  }
}
