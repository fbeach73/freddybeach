import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { business, type BusinessHours } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { categories, getCategoryById } from "@/lib/data/categories";
import {
  sendEmail,
  getBusinessSubmissionAdminEmailHtml,
  getBusinessSubmissionAdminEmailSubject,
} from "@/lib/email";

/**
 * Generate a URL-friendly slug from a business name
 */
function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  // Add a short random suffix to ensure uniqueness
  return `${baseSlug}-${nanoid(6)}`;
}

/**
 * Validate business hours format
 */
function validateBusinessHours(hours: unknown): hours is BusinessHours[] {
  if (!Array.isArray(hours)) return false;
  if (hours.length !== 7) return false;

  return hours.every((h) => {
    if (typeof h !== "object" || h === null) return false;
    const hour = h as Record<string, unknown>;
    if (typeof hour.day !== "number" || hour.day < 0 || hour.day > 6) return false;
    if (hour.closed !== undefined && typeof hour.closed !== "boolean") return false;
    return typeof hour.open === "string" && typeof hour.close === "string";
  });
}

/**
 * Validate category ID exists
 */
function isValidCategoryId(categoryId: string): boolean {
  return categories.some((cat) => cat.id === categoryId);
}

interface CreateBusinessBody {
  name: string;
  categoryId: string;
  description: string;
  phone: string;
  address: string;
  city?: string;
  province?: string;
  postalCode?: string;
  email?: string;
  website?: string;
  hours: BusinessHours[];
}

/**
 * POST /api/businesses
 * Create a new business submission (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateBusinessBody;
    const {
      name,
      categoryId,
      description,
      phone,
      address,
      city = "Fredericton",
      province = "NB",
      postalCode,
      email,
      website,
      hours,
    } = body;

    // Validate required fields
    const missingFields: string[] = [];
    if (!name?.trim()) missingFields.push("name");
    if (!categoryId?.trim()) missingFields.push("categoryId");
    if (!description?.trim()) missingFields.push("description");
    if (!phone?.trim()) missingFields.push("phone");
    if (!address?.trim()) missingFields.push("address");
    if (!hours) missingFields.push("hours");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate category exists
    if (!isValidCategoryId(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Validate business hours
    if (!validateBusinessHours(hours)) {
      return NextResponse.json(
        {
          error:
            "Invalid hours format. Must be an array of 7 objects with day (0-6), open, and close fields",
        },
        { status: 400 }
      );
    }

    // Generate ID and slug
    const id = nanoid();
    const slug = generateSlug(name.trim());

    // Create the business with pending_review status
    const [newBusiness] = await db
      .insert(business)
      .values({
        id,
        name: name.trim(),
        slug,
        description: description.trim(),
        categoryId,
        phone: phone.trim(),
        email: email?.trim() || null,
        website: website?.trim() || null,
        address: address.trim(),
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode?.trim() || null,
        status: "pending_review",
        submittedById: session.user.id,
        hours,
      })
      .returning({
        id: business.id,
        name: business.name,
        slug: business.slug,
      });

    // Get category name for email
    const category = getCategoryById(categoryId);
    const categoryName = category?.name || categoryId;

    // Send email notification to admin
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const adminEmail = process.env.ADMIN_EMAIL;

    if (adminEmail) {
      try {
        await sendEmail({
          to: adminEmail,
          subject: getBusinessSubmissionAdminEmailSubject(newBusiness.name),
          html: getBusinessSubmissionAdminEmailHtml({
            businessName: newBusiness.name,
            categoryName,
            submitterName: session.user.name || "Unknown",
            submitterEmail: session.user.email,
            adminUrl: `${appUrl}/admin/businesses?status=pending_review`,
          }),
        });
      } catch (emailError) {
        // Log but don't fail the request if email fails
        console.error("Failed to send admin notification email:", emailError);
      }
    } else {
      console.warn(
        "ADMIN_EMAIL not configured - skipping admin notification for new business submission"
      );
    }

    return NextResponse.json({
      success: true,
      businessId: newBusiness.id,
      message:
        "Your business has been submitted for review. You will be notified once it is approved.",
    });
  } catch (error) {
    console.error("Create business error:", error);
    return NextResponse.json(
      { error: "Failed to create business" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/businesses
 * Get businesses submitted by the current user
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userBusinesses = await db
      .select({
        id: business.id,
        name: business.name,
        slug: business.slug,
        categoryId: business.categoryId,
        status: business.status,
        createdAt: business.createdAt,
      })
      .from(business)
      .where(eq(business.submittedById, session.user.id));

    return NextResponse.json({ businesses: userBusinesses });
  } catch (error) {
    console.error("Get user businesses error:", error);
    return NextResponse.json(
      { error: "Failed to get businesses" },
      { status: 500 }
    );
  }
}
