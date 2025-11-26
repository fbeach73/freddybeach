import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { deleteBusinessPhotos } from "@/lib/services/blob-storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/admin/businesses/[id]
 * Delete a business and its associated images from blob storage
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Get the business to retrieve image URLs
    const [existingBusiness] = await db
      .select({ images: business.images })
      .from(business)
      .where(eq(business.id, id));

    if (!existingBusiness) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Delete images from blob storage
    if (existingBusiness.images && existingBusiness.images.length > 0) {
      try {
        await deleteBusinessPhotos(existingBusiness.images);
      } catch (error) {
        console.warn("Failed to delete some images from blob storage:", error);
        // Continue with business deletion even if image deletion fails
      }
    }

    // Delete the business from database
    await db.delete(business).where(eq(business.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete business error:", error);
    return NextResponse.json(
      { error: "Failed to delete business" },
      { status: 500 }
    );
  }
}
