import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { inArray } from "drizzle-orm";
import { deleteBusinessPhotos } from "@/lib/services/blob-storage";

interface BulkActionBody {
  action: "publish" | "unpublish" | "delete";
  businessIds: string[];
}

/**
 * POST /api/admin/businesses/bulk
 * Perform bulk actions on multiple businesses
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as BulkActionBody;

    // Validate request
    if (!body.action || !["publish", "unpublish", "delete"].includes(body.action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'publish', 'unpublish', or 'delete'" },
        { status: 400 }
      );
    }

    if (!body.businessIds || !Array.isArray(body.businessIds) || body.businessIds.length === 0) {
      return NextResponse.json(
        { error: "businessIds must be a non-empty array" },
        { status: 400 }
      );
    }

    let result: { success: number; failed: number };

    switch (body.action) {
      case "publish": {
        const updated = await db
          .update(business)
          .set({ status: "published" })
          .where(inArray(business.id, body.businessIds))
          .returning({ id: business.id });

        result = { success: updated.length, failed: body.businessIds.length - updated.length };
        break;
      }

      case "unpublish": {
        const updated = await db
          .update(business)
          .set({ status: "draft" })
          .where(inArray(business.id, body.businessIds))
          .returning({ id: business.id });

        result = { success: updated.length, failed: body.businessIds.length - updated.length };
        break;
      }

      case "delete": {
        // First, get all businesses to find their images
        const businessesToDelete = await db
          .select({ id: business.id, images: business.images })
          .from(business)
          .where(inArray(business.id, body.businessIds));

        // Collect all image URLs to delete
        const allImageUrls: string[] = [];
        for (const biz of businessesToDelete) {
          if (biz.images && Array.isArray(biz.images)) {
            allImageUrls.push(...biz.images);
          }
        }

        // Delete images from blob storage (don't fail if this fails)
        if (allImageUrls.length > 0) {
          try {
            await deleteBusinessPhotos(allImageUrls);
          } catch (error) {
            console.error("Failed to delete some images:", error);
          }
        }

        // Delete businesses from database
        const deleted = await db
          .delete(business)
          .where(inArray(business.id, body.businessIds))
          .returning({ id: business.id });

        result = { success: deleted.length, failed: body.businessIds.length - deleted.length };
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      action: body.action,
      ...result,
      message: `${body.action} completed: ${result.success} succeeded, ${result.failed} failed`,
    });
  } catch (error) {
    console.error("Bulk action error:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
