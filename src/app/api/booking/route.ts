import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendBookingNotificationToAdmin } from "@/lib/services/email";
import { consultationPackages } from "@/lib/data/packages";
import { formatDate, formatTime } from "@/lib/data/booking-slots";

// Admin email for booking notifications
const ADMIN_EMAIL = "kyle@freddybeach.com";

// Validation schema matching the contact form
const bookingSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(200, "Business name must be less than 200 characters"),
  challenge: z
    .string()
    .min(20, "Please describe your challenge in at least 20 characters")
    .max(1000, "Description must be less than 1000 characters"),
  preferredPackage: z.string().min(1, "Please select a package"),
  selectedDate: z.string().min(1, "Please select a date"),
  selectedTime: z.string().min(1, "Please select a time"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const result = bookingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Map package ID to human-readable name
    let packageName = data.preferredPackage;
    if (data.preferredPackage === "not-sure") {
      packageName = "Not sure yet - help me decide";
    } else {
      const pkg = consultationPackages.find((p) => p.id === data.preferredPackage);
      if (pkg) {
        packageName = `${pkg.name} - ${pkg.priceLabel}`;
      }
    }

    // Format the selected date/time
    const selectedDateTime = `${formatDate(data.selectedDate)} at ${formatTime(data.selectedTime)}`;

    // Send notification email to admin
    const emailSent = await sendBookingNotificationToAdmin({
      adminEmail: ADMIN_EMAIL,
      customerName: data.name,
      customerEmail: data.email,
      businessName: data.businessName,
      preferredPackage: packageName,
      challenge: data.challenge,
      selectedDateTime,
    });

    if (!emailSent) {
      console.error("[BOOKING] Failed to send admin notification email");
      // Still return success to the user - we don't want to fail the form
      // submission just because email failed. Log it for monitoring.
    }

    return NextResponse.json({
      success: true,
      message: "Booking request submitted successfully",
    });
  } catch (error) {
    console.error("[BOOKING] Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process booking request" },
      { status: 500 }
    );
  }
}
