/**
 * Email Preview API Route
 *
 * Development-only route for previewing email templates.
 * Usage: GET /api/email-preview/[template]
 *
 * Available templates:
 * - welcome
 * - verify-email
 * - password-reset
 * - claim-submitted
 * - claim-approved
 * - claim-rejected
 * - purchase-confirmation
 * - subscription-started
 * - subscription-renewed
 * - subscription-cancelled
 * - payment-failed
 * - consultation-booked
 * - new-review
 * - weekly-stats
 */

import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";

// Import all email templates
import { WelcomeEmail } from "@/emails/welcome";
import { VerifyEmail } from "@/emails/verify-email";
import { PasswordReset } from "@/emails/password-reset";
import { ClaimSubmittedEmail } from "@/emails/claim-submitted";
import { ClaimApprovedEmail } from "@/emails/claim-approved";
import { ClaimRejectedEmail } from "@/emails/claim-rejected";
import { PurchaseConfirmationEmail } from "@/emails/purchase-confirmation";
import { SubscriptionStartedEmail } from "@/emails/subscription-started";
import { SubscriptionRenewedEmail } from "@/emails/subscription-renewed";
import { SubscriptionCancelledEmail } from "@/emails/subscription-cancelled";
import { PaymentFailedEmail } from "@/emails/payment-failed";
import { ConsultationBookedEmail } from "@/emails/consultation-booked";
import { NewReviewEmail } from "@/emails/new-review";
import { WeeklyStatsEmail } from "@/emails/weekly-stats";

// Sample data for each email template
const sampleData = {
  welcome: {
    name: "John Smith",
  },
  "verify-email": {
    name: "John Smith",
    verificationUrl: "https://freddybeach.com/verify?token=sample-token-12345",
  },
  "password-reset": {
    name: "John Smith",
    resetUrl: "https://freddybeach.com/reset-password?token=sample-token-12345",
  },
  "claim-submitted": {
    userName: "John Smith",
    businessName: "The Tipsy Moose",
  },
  "claim-approved": {
    userName: "John Smith",
    businessName: "The Tipsy Moose",
    businessSlug: "the-tipsy-moose",
  },
  "claim-rejected": {
    userName: "John Smith",
    businessName: "The Tipsy Moose",
    reason:
      "We were unable to verify your ownership of this business. Please provide additional documentation such as a business license or utility bill.",
  },
  "purchase-confirmation": {
    userName: "John Smith",
    orderNumber: "FB-2024-001234",
    items: [
      {
        name: "Business Spotlight Ad - 30 Days",
        description: "Premium placement in search results",
        quantity: 1,
        unitPrice: 49.99,
      },
      {
        name: "Featured Listing Badge",
        description: "Gold badge displayed on your listing",
        quantity: 1,
        unitPrice: 19.99,
      },
    ],
    subtotal: 69.98,
    tax: 10.5,
    total: 80.48,
    paymentMethodLast4: "4242",
    paymentMethodBrand: "Visa",
    receiptUrl: "https://freddybeach.com/receipts/FB-2024-001234",
  },
  "subscription-started": {
    userName: "John Smith",
    tierName: "Business Pro",
    features: [
      { name: "Priority Listing", description: "Appear at the top of search results" },
      { name: "Analytics Dashboard", description: "Detailed visitor insights" },
      { name: "Review Management", description: "Respond to and manage reviews" },
      { name: "Photo Gallery", description: "Upload unlimited photos" },
      { name: "Special Offers", description: "Create and promote deals" },
    ],
    billingAmount: 29.99,
    billingFrequency: "monthly" as const,
    nextBillingDate: "January 15, 2025",
    manageSubscriptionUrl: "https://freddybeach.com/dashboard/billing",
  },
  "subscription-renewed": {
    userName: "John Smith",
    tierName: "Business Pro",
    billingAmount: 29.99,
    billingFrequency: "monthly" as const,
    nextBillingDate: "February 15, 2025",
    receiptUrl: "https://freddybeach.com/receipts/SUB-2024-001234",
    billingSettingsUrl: "https://freddybeach.com/dashboard/billing",
  },
  "subscription-cancelled": {
    userName: "John Smith",
    tierName: "Business Pro",
    accessEndDate: "February 14, 2025",
    resubscribeUrl: "https://freddybeach.com/pricing",
    feedbackUrl: "https://freddybeach.com/feedback",
  },
  "payment-failed": {
    userName: "John Smith",
    tierName: "Business Pro",
    billingAmount: 29.99,
    paymentMethodLast4: "4242",
    paymentMethodBrand: "Visa",
    serviceInterruptionDate: "January 20, 2025",
    updatePaymentUrl: "https://freddybeach.com/dashboard/billing",
  },
  "consultation-booked": {
    userName: "John Smith",
    consultationTitle: "Business Listing Strategy Session",
    dateTime: "Monday, January 15, 2025 at 2:00 PM EST",
    duration: "30 minutes",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    timezone: "America/Toronto",
    preparationNotes: [
      "Review your current business listing",
      "Prepare questions about optimization",
      "Have your business goals ready to discuss",
    ],
    rescheduleUrl: "https://freddybeach.com/dashboard/consultations",
    cancelUrl: "https://freddybeach.com/dashboard/consultations",
    googleCalendarUrl: "https://calendar.google.com/calendar/render?action=TEMPLATE",
    outlookCalendarUrl: "https://outlook.office.com/calendar/deeplink/compose",
  },
  "new-review": {
    ownerName: "John Smith",
    businessName: "The Tipsy Moose",
    businessSlug: "the-tipsy-moose",
    reviewerName: "Jane Doe",
    rating: 5,
    reviewText:
      "Amazing food and great atmosphere! The staff was incredibly friendly and the burgers were some of the best I've ever had. Highly recommend!",
    reviewDate: "2025-01-10",
  },
  "weekly-stats": {
    ownerName: "John Smith",
    businessName: "The Tipsy Moose",
    businessSlug: "the-tipsy-moose",
    weekStartDate: "2025-01-06",
    weekEndDate: "2025-01-12",
    stats: {
      totalViews: 342,
      viewsChange: 15,
      totalClicks: 140,
      clicksChange: 8,
      phoneClicks: 28,
      websiteClicks: 45,
      directionsClicks: 67,
      newReviews: 3,
      averageRating: 4.6,
      totalReviews: 47,
    },
    topSearchTerms: ["restaurants fredericton", "burgers near me", "tipsy moose menu"],
  },
};

// Template rendering map
const templates: Record<string, (props: unknown) => React.ReactElement> = {
  welcome: (props) => WelcomeEmail(props as { name: string }),
  "verify-email": (props) =>
    VerifyEmail(props as { name: string; verificationUrl: string }),
  "password-reset": (props) =>
    PasswordReset(props as { name: string; resetUrl: string }),
  "claim-submitted": (props) =>
    ClaimSubmittedEmail(props as { userName: string; businessName: string }),
  "claim-approved": (props) =>
    ClaimApprovedEmail(
      props as { userName: string; businessName: string; businessSlug: string }
    ),
  "claim-rejected": (props) =>
    ClaimRejectedEmail(
      props as { userName: string; businessName: string; reason?: string }
    ),
  "purchase-confirmation": (props) =>
    PurchaseConfirmationEmail(
      props as Parameters<typeof PurchaseConfirmationEmail>[0]
    ),
  "subscription-started": (props) =>
    SubscriptionStartedEmail(
      props as Parameters<typeof SubscriptionStartedEmail>[0]
    ),
  "subscription-renewed": (props) =>
    SubscriptionRenewedEmail(
      props as Parameters<typeof SubscriptionRenewedEmail>[0]
    ),
  "subscription-cancelled": (props) =>
    SubscriptionCancelledEmail(
      props as Parameters<typeof SubscriptionCancelledEmail>[0]
    ),
  "payment-failed": (props) =>
    PaymentFailedEmail(props as Parameters<typeof PaymentFailedEmail>[0]),
  "consultation-booked": (props) =>
    ConsultationBookedEmail(
      props as Parameters<typeof ConsultationBookedEmail>[0]
    ),
  "new-review": (props) =>
    NewReviewEmail(props as Parameters<typeof NewReviewEmail>[0]),
  "weekly-stats": (props) =>
    WeeklyStatsEmail(props as Parameters<typeof WeeklyStatsEmail>[0]),
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ template: string }> }
) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Email preview is only available in development mode" },
      { status: 403 }
    );
  }

  const { template } = await params;
  const templateName = template.toLowerCase();

  // Check if template exists
  if (!templates[templateName]) {
    const availableTemplates = Object.keys(templates).join(", ");
    return NextResponse.json(
      {
        error: `Template "${templateName}" not found`,
        availableTemplates,
      },
      { status: 404 }
    );
  }

  // Get sample data for template
  const data = sampleData[templateName as keyof typeof sampleData];
  if (!data) {
    return NextResponse.json(
      { error: `No sample data for template "${templateName}"` },
      { status: 500 }
    );
  }

  try {
    // Render the email template
    const templateFn = templates[templateName];
    const html = await render(templateFn(data));

    // Return the rendered HTML
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error(`Error rendering template "${templateName}":`, error);
    return NextResponse.json(
      { error: `Failed to render template: ${error}` },
      { status: 500 }
    );
  }
}

/**
 * List all available email templates
 */
export async function HEAD() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Email preview is only available in development mode" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    templates: Object.keys(templates),
    usage: "GET /api/email-preview/[template]",
  });
}
