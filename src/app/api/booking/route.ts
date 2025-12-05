import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  sendBookingNotificationToAdmin,
  sendBookingConfirmationToUser,
} from "@/lib/services/email";
import { formatDate, formatTime } from "@/lib/data/booking-slots";

// Admin email for booking notifications
const ADMIN_EMAIL = "kyle@freddybeach.com";

// Map primary need values to human-readable labels
const PRIMARY_NEED_LABELS: Record<string, string> = {
  "time-saving-automation": "Time Saving Automation",
  "mundane-task-handling": "Mundane Task Handling",
  "ai-agents-live-chat": "AI Agents / Live Chat",
  "voice-agents": "Voice Agents",
  "all-of-the-above": "All of the Above",
  "other": "Other",
};

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
  primaryNeed: z.string().min(1, "Please select what you need help with"),
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

    // Map primary need value to human-readable label
    const primaryNeedLabel = PRIMARY_NEED_LABELS[data.primaryNeed] || data.primaryNeed;

    // Format the selected date/time
    const selectedDateTime = `${formatDate(data.selectedDate)} at ${formatTime(data.selectedTime)}`;

    // Parse the selected date and time into Date objects for calendar
    // Date format is YYYY-MM-DD, time format is HH:MM
    const [year, month, day] = data.selectedDate.split("-").map(Number);
    const [hours, minutes] = data.selectedTime.split(":").map(Number);

    // Create consultation date (Atlantic Time is UTC-4 or UTC-3 depending on DST)
    // We'll use UTC and add 4 hours to approximate Atlantic Time
    const consultationDate = new Date(Date.UTC(year, month - 1, day, hours + 4, minutes));
    const consultationEndDate = new Date(consultationDate.getTime() + 60 * 60 * 1000); // 1 hour later

    // Send notification email to admin
    const adminEmailSent = await sendBookingNotificationToAdmin({
      adminEmail: ADMIN_EMAIL,
      customerName: data.name,
      customerEmail: data.email,
      businessName: data.businessName,
      primaryNeed: primaryNeedLabel,
      challenge: data.challenge,
      selectedDateTime,
    });

    if (!adminEmailSent) {
      console.error("[BOOKING] Failed to send admin notification email");
    }

    // Send confirmation email to user
    const userEmailSent = await sendBookingConfirmationToUser({
      email: data.email,
      userName: data.name,
      businessName: data.businessName,
      selectedDateTime,
      primaryNeed: primaryNeedLabel,
      consultationDate,
      consultationEndDate,
    });

    if (!userEmailSent) {
      console.error("[BOOKING] Failed to send user confirmation email");
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
