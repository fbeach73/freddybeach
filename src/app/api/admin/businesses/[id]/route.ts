import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { business, type BusinessHours } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { deleteBusinessPhotos } from "@/lib/services/blob-storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Check if user can access/edit this business
 * Returns true if user is admin OR is the business owner
 */
async function canAccessBusiness(userId: string, userRole: string | undefined | null, businessId: string): Promise<boolean> {
  // Admins can access any business
  if (userRole === "admin") {
    return true;
  }

  // Check if user is the business owner
  const [biz] = await db
    .select({ ownerId: business.ownerId })
    .from(business)
    .where(eq(business.id, businessId));

  return biz?.ownerId === userId;
}

/**
 * GET /api/admin/businesses/[id]
 * Get a single business by ID for editing (admin or owner)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check access permissions
    const hasAccess = await canAccessBusiness(session.user.id, session.user.role, id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [existingBusiness] = await db
      .select()
      .from(business)
      .where(eq(business.id, id));

    if (!existingBusiness) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json(existingBusiness);
  } catch (error) {
    console.error("Get business error:", error);
    return NextResponse.json(
      { error: "Failed to get business" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/businesses/[id]
 * Update a business's editable fields (admin or owner)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check access permissions
    const hasAccess = await canAccessBusiness(session.user.id, session.user.role, id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate the business exists
    const [existingBusiness] = await db
      .select({ id: business.id })
      .from(business)
      .where(eq(business.id, id));

    if (!existingBusiness) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Extract updatable fields from body
    const updateData: Partial<{
      name: string;
      description: string;
      phone: string;
      email: string;
      website: string;
      address: string;
      city: string;
      province: string;
      postalCode: string;
      hours: BusinessHours[];
      categoryId: string;
    }> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.province !== undefined) updateData.province = body.province;
    if (body.postalCode !== undefined) updateData.postalCode = body.postalCode;
    if (body.hours !== undefined) updateData.hours = body.hours;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;

    // Update the business
    const [updatedBusiness] = await db
      .update(business)
      .set(updateData)
      .where(eq(business.id, id))
      .returning();

    return NextResponse.json(updatedBusiness);
  } catch (error) {
    console.error("Update business error:", error);
    return NextResponse.json(
      { error: "Failed to update business" },
      { status: 500 }
    );
  }
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
