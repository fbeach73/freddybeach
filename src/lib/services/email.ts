/**
 * Email Service for FreddyBeach
 *
 * This service handles all transactional email sending using Mailgun and React Email.
 *
 * ## Environment Variables Required
 * - MAILGUN_API_KEY: Your Mailgun API key (from https://app.mailgun.com/app/sending/domains)
 * - MAILGUN_DOMAIN: Your verified sending domain (e.g., "mg.freddybeach.com")
 * - EMAIL_FROM: Default sender address (e.g., "FreddyBeach <noreply@freddybeach.com>")
 * - FORCE_SEND_EMAILS: Set to "true" to send real emails even in development mode
 *
 * ## Development Mode
 * When NODE_ENV === 'development', emails are logged to the console instead of being sent.
 * Set FORCE_SEND_EMAILS=true to override this and send real emails in development.
 * Use the email preview route at /api/email-preview/[template] to visually preview emails.
 *
 * ## Available Email Templates
 * - welcome: Sent when a new user signs up
 * - verify-email: Email verification link
 * - password-reset: Password reset link
 * - claim-submitted: Business claim submission confirmation
 * - claim-approved: Business claim approved notification
 * - claim-rejected: Business claim rejected notification
 * - purchase-confirmation: Order receipt
 * - subscription-started: New subscription welcome
 * - subscription-renewed: Subscription renewal confirmation
 * - subscription-cancelled: Subscription cancellation confirmation
 * - payment-failed: Payment failure notification
 * - consultation-booked: Consultation booking confirmation with ICS attachment
 * - new-review: New review notification (scaffold)
 * - weekly-stats: Weekly business stats report (scaffold)
 *
 * ## Adding a New Email Template
 *
 * 1. Create a new email template in `src/emails/[template-name].tsx`:
 *    ```tsx
 *    import { EmailLayout, BRAND } from "./components/email-layout";
 *    import { EmailHeading } from "./components/email-heading";
 *
 *    interface MyEmailProps {
 *      userName: string;
 *      // ... other props
 *    }
 *
 *    export function MyEmail({ userName }: MyEmailProps) {
 *      return (
 *        <EmailLayout preview="Email preview text">
 *          <EmailHeading as="h1">Email Title</EmailHeading>
 *          {/* Email content *\/}
 *        </EmailLayout>
 *      );
 *    }
 *
 *    export default MyEmail;
 *    ```
 *
 * 2. Add the type interface to this file (below existing types)
 *
 * 3. Create a helper function:
 *    ```typescript
 *    export async function sendMyEmail(data: MyEmailData): Promise<boolean> {
 *      const html = await render(MyEmail({ userName: data.userName }));
 *      const text = `Plain text version...`;
 *
 *      return sendEmail({
 *        to: data.email,
 *        subject: "Email Subject",
 *        html,
 *        text,
 *      });
 *    }
 *    ```
 *
 * 4. Add sample data and template to `/api/email-preview/[template]/route.ts` for previewing
 *
 * @module email
 */

import Mailgun from "mailgun.js";
import formData from "form-data";
import { render } from "@react-email/render";
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
import {
  ConsultationBookedEmail,
  generateConsultationICS,
} from "@/emails/consultation-booked";
import { BookingNotificationAdmin } from "@/emails/booking-notification-admin";
import {
  BookingConfirmationUser,
  generateGoogleCalendarUrl,
} from "@/emails/booking-confirmation-user";

// Lazily initialize Mailgun client to avoid errors during build
let mg: ReturnType<InstanceType<typeof Mailgun>["client"]> | null = null;

function getMailgunClient() {
  if (!mg) {
    const mailgun = new Mailgun(formData);
    mg = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY || "",
    });
  }
  return mg;
}

// Get config values lazily to support runtime configuration
function getMailgunDomain() {
  return process.env.MAILGUN_DOMAIN || "";
}

function getEmailFrom() {
  return process.env.EMAIL_FROM || "FreddyBeach <noreply@freddybeach.com>";
}

function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

function shouldSkipSending() {
  // Allow forcing email sending in development with FORCE_SEND_EMAILS=true
  if (process.env.FORCE_SEND_EMAILS === "true") {
    return false;
  }
  return isDevelopment();
}

export interface EmailAttachment {
  filename: string;
  data: Buffer | string;
  contentType?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

/**
 * Send an email using Mailgun
 * In development mode, logs the email instead of sending
 * Set FORCE_SEND_EMAILS=true to send real emails in development
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const { to, subject, html, text, attachments } = options;

  // Development mode - log instead of sending (unless FORCE_SEND_EMAILS=true)
  if (shouldSkipSending()) {
    console.log("========================================");
    console.log("[EMAIL] Development Mode - Not Sent (set FORCE_SEND_EMAILS=true to send)");
    console.log("========================================");
    console.log(`To: ${Array.isArray(to) ? to.join(", ") : to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text || "(no plain text version)"}`);
    console.log(`HTML Preview: ${html.substring(0, 500)}...`);
    if (attachments?.length) {
      console.log(`Attachments: ${attachments.map((a) => a.filename).join(", ")}`);
    }
    console.log("========================================");
    return true;
  }

  // Validate configuration
  const domain = getMailgunDomain();
  if (!process.env.MAILGUN_API_KEY) {
    console.error("[EMAIL ERROR] MAILGUN_API_KEY is not configured");
    return false;
  }
  if (!domain) {
    console.error("[EMAIL ERROR] MAILGUN_DOMAIN is not configured");
    return false;
  }

  try {
    // Build message data for Mailgun
    const messageData: {
      from: string;
      to: string[];
      subject: string;
      html: string;
      text?: string;
      attachment?: Array<{ filename: string; data: Buffer | string; contentType?: string }>;
    } = {
      from: getEmailFrom(),
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || undefined,
    };

    // Add attachments if provided
    if (attachments?.length) {
      messageData.attachment = attachments.map((att) => ({
        filename: att.filename,
        data: att.data,
        contentType: att.contentType,
      }));
    }

    const client = getMailgunClient();
    const result = await client.messages.create(domain, messageData);
    console.log(`[EMAIL] Sent successfully: ${result.id}`);
    return true;
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send:", error);
    return false;
  }
}

// =============================================================================
// Email Type Helpers
// Note: Individual email helper functions (sendWelcomeEmail, sendVerificationEmail, etc.)
// will be added in Phase 2 and Phase 3 when the corresponding email templates are created.
// =============================================================================

// Export types for use in later phases
export interface WelcomeEmailData {
  email: string;
  name: string;
}

export interface VerificationEmailData {
  email: string;
  name: string;
  verificationUrl: string;
}

export interface PasswordResetEmailData {
  email: string;
  name: string;
  resetUrl: string;
}

export interface ClaimSubmittedEmailData {
  email: string;
  userName: string;
  businessName: string;
}

export interface ClaimApprovedEmailData {
  email: string;
  userName: string;
  businessName: string;
  businessSlug: string;
}

export interface ClaimRejectedEmailData {
  email: string;
  userName: string;
  businessName: string;
  reason?: string;
}

// =============================================================================
// Phase 4: Purchase & Subscription Email Types
// =============================================================================

export interface PurchaseItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseConfirmationEmailData {
  email: string;
  userName: string;
  orderNumber: string;
  items: PurchaseItem[];
  subtotal: number;
  tax?: number;
  total: number;
  paymentMethodLast4: string;
  paymentMethodBrand?: string;
  receiptUrl?: string;
}

export interface SubscriptionStartedEmailData {
  email: string;
  userName: string;
  tierName: string;
  features: Array<{ name: string; description?: string }>;
  billingAmount: number;
  billingFrequency: "monthly" | "yearly";
  nextBillingDate: string;
  manageSubscriptionUrl?: string;
}

export interface SubscriptionRenewedEmailData {
  email: string;
  userName: string;
  tierName: string;
  billingAmount: number;
  billingFrequency: "monthly" | "yearly";
  nextBillingDate: string;
  receiptUrl?: string;
  billingSettingsUrl?: string;
}

export interface SubscriptionCancelledEmailData {
  email: string;
  userName: string;
  tierName: string;
  accessEndDate: string;
  resubscribeUrl?: string;
  feedbackUrl?: string;
}

export interface PaymentFailedEmailData {
  email: string;
  userName: string;
  tierName: string;
  billingAmount: number;
  paymentMethodLast4?: string;
  paymentMethodBrand?: string;
  serviceInterruptionDate: string;
  updatePaymentUrl?: string;
}

export interface ConsultationBookedEmailData {
  email: string;
  userName: string;
  consultationTitle: string;
  startDateTime: Date;
  endDateTime: Date;
  duration: string;
  meetingLink?: string;
  timezone: string;
  preparationNotes?: string[];
  rescheduleUrl?: string;
  cancelUrl?: string;
  googleCalendarUrl?: string;
  outlookCalendarUrl?: string;
}

// =============================================================================
// Authentication Email Helpers
// =============================================================================

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const html = await render(WelcomeEmail({ name: data.name }));
  const text = `Welcome to FreddyBeach, ${data.name.split(" ")[0]}!\n\nThanks for joining FreddyBeach.com! We're excited to have you as part of our community.\n\nGet started by exploring local businesses at https://freddybeach.com/explore\n\n— The FreddyBeach Team`;

  return sendEmail({
    to: data.email,
    subject: "Welcome to FreddyBeach!",
    html,
    text,
  });
}

/**
 * Send a combined welcome + email verification link
 * This is sent on signup and combines the welcome message with verification
 */
export async function sendVerificationEmail(
  data: VerificationEmailData
): Promise<boolean> {
  const firstName = data.name.split(" ")[0];
  const html = await render(
    VerifyEmail({ name: data.name, verificationUrl: data.verificationUrl })
  );
  const text = `Hi ${firstName},

Thanks for joining FreddyBeach.com! We're excited to have you as part of our community. FreddyBeach is your go-to guide for discovering the best local businesses, restaurants, and services in the Fredericton area.

To get started, please verify your email address by clicking the link below:

${data.verificationUrl}

This link will expire in 24 hours.

What You Can Do:
1. Explore Local Businesses - Browse our directory to discover restaurants, shops, services, and more in Fredericton.
2. Save Your Favorites - Create a list of your favorite spots so you can easily find them later.
3. Share Your Experience - Leave reviews to help others discover great local businesses.

If you didn't create an account on FreddyBeach, you can safely ignore this email.

— The FreddyBeach Team`;

  return sendEmail({
    to: data.email,
    subject: `Welcome to FreddyBeach, ${firstName}! Please verify your email`,
    html,
    text,
  });
}

/**
 * Send a password reset link
 */
export async function sendPasswordResetEmail(
  data: PasswordResetEmailData
): Promise<boolean> {
  const html = await render(
    PasswordReset({ name: data.name, resetUrl: data.resetUrl })
  );
  const text = `Hi ${data.name.split(" ")[0]},\n\nWe received a request to reset the password for your FreddyBeach account.\n\nClick the link below to create a new password:\n\n${data.resetUrl}\n\nThis link will expire in 1 hour for security reasons.\n\nIf you didn't request a password reset, you can safely ignore this email.\n\n— The FreddyBeach Team`;

  return sendEmail({
    to: data.email,
    subject: "Reset your FreddyBeach password",
    html,
    text,
  });
}

// =============================================================================
// Claims Email Helpers
// =============================================================================

/**
 * Send a confirmation email when a business claim is submitted
 */
export async function sendClaimSubmittedEmail(
  data: ClaimSubmittedEmailData
): Promise<boolean> {
  const html = await render(
    ClaimSubmittedEmail({
      userName: data.userName,
      businessName: data.businessName,
    })
  );
  const text = `Hi ${data.userName.split(" ")[0]},\n\nThank you for submitting your claim for ${data.businessName} on FreddyBeach. We've received your request and it's now in our review queue.\n\nOur team will review your claim within 2-3 business days. We'll verify the information you provided and may reach out if we need any additional documentation.\n\nOnce approved, you'll have access to your business dashboard where you can:\n• Update your business information\n• Add photos and menus\n• Respond to customer reviews\n• View analytics and insights\n\nIf you have any questions about your claim, contact us at support@freddybeach.com.\n\n— The FreddyBeach Team`;

  return sendEmail({
    to: data.email,
    subject: `Claim received for ${data.businessName}`,
    html,
    text,
  });
}

/**
 * Send a notification when a business claim is approved
 */
export async function sendClaimApprovedEmail(
  data: ClaimApprovedEmailData
): Promise<boolean> {
  const html = await render(
    ClaimApprovedEmail({
      userName: data.userName,
      businessName: data.businessName,
      businessSlug: data.businessSlug,
    })
  );
  const dashboardUrl = `https://freddybeach.com/dashboard/business/${data.businessSlug}`;
  const text = `Hi ${data.userName.split(" ")[0]},\n\nGreat news! Your claim for ${data.businessName} has been approved. You now have full access to manage your business listing on FreddyBeach.\n\nGo to your business dashboard: ${dashboardUrl}\n\nHere are a few things you can do to get the most out of your listing:\n\n1. Update Your Information - Make sure your hours, contact details, and description are accurate and up-to-date.\n\n2. Add Photos - Showcase your business with high-quality photos. Listings with photos get more views!\n\n3. Respond to Reviews - Engage with your customers by responding to their reviews and feedback.\n\n4. Track Your Performance - View analytics to see how customers are finding and interacting with your listing.\n\nIf you have any questions about managing your listing, contact us at support@freddybeach.com.\n\n— The FreddyBeach Team`;

  return sendEmail({
    to: data.email,
    subject: `Congratulations! Your claim for ${data.businessName} is approved`,
    html,
    text,
  });
}

/**
 * Send a notification when a business claim is rejected
 */
export async function sendClaimRejectedEmail(
  data: ClaimRejectedEmailData
): Promise<boolean> {
  const html = await render(
    ClaimRejectedEmail({
      userName: data.userName,
      businessName: data.businessName,
      reason: data.reason,
    })
  );
  const reasonText = data.reason ? `\n\nReason: ${data.reason}` : "";
  const text = `Hi ${data.userName.split(" ")[0]},\n\nThank you for your interest in claiming ${data.businessName} on FreddyBeach. After reviewing your submission, we were unable to approve your claim at this time.${reasonText}\n\nWhat You Can Do:\n\n• Submit a New Claim - Gather additional documentation (business license, utility bill, official correspondence) and submit a new claim with more supporting evidence.\n\n• Appeal This Decision - If you have questions about why your claim was rejected or would like to appeal, contact our support team with your claim details.\n\n• Contact Support - Our team is happy to help clarify what documentation is needed or answer any questions you have.\n\nCommon documentation that helps verify business ownership:\n• Business license or registration\n• Utility bill with business name and address\n• Tax registration documents\n• Official business correspondence\n\nWe understand this may be disappointing, and we appreciate your patience throughout this process.\n\nContact us at support@freddybeach.com if you have questions.\n\n— The FreddyBeach Team`;

  return sendEmail({
    to: data.email,
    subject: `Update on your claim for ${data.businessName}`,
    html,
    text,
  });
}

// =============================================================================
// Purchase & Subscription Email Helpers
// =============================================================================

/**
 * Send a purchase confirmation email with receipt details
 */
export async function sendPurchaseConfirmationEmail(
  data: PurchaseConfirmationEmailData
): Promise<boolean> {
  const html = await render(
    PurchaseConfirmationEmail({
      userName: data.userName,
      orderNumber: data.orderNumber,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      paymentMethodLast4: data.paymentMethodLast4,
      paymentMethodBrand: data.paymentMethodBrand,
      receiptUrl: data.receiptUrl,
    })
  );

  const itemsList = data.items
    .map((item) => `- ${item.name} x${item.quantity}: $${(item.unitPrice * item.quantity).toFixed(2)}`)
    .join("\n");

  const text = `Hi ${data.userName.split(" ")[0]},\n\nThank you for your purchase!\n\nOrder #${data.orderNumber}\n\nItems:\n${itemsList}\n\nSubtotal: $${data.subtotal.toFixed(2)}${data.tax ? `\nTax: $${data.tax.toFixed(2)}` : ""}\nTotal: $${data.total.toFixed(2)}\n\nPayment Method: ${data.paymentMethodBrand || "Card"} ending in ${data.paymentMethodLast4}\n\nIf you have any questions about your purchase, contact us at support@freddybeach.com.\n\n— The FreddyBeach Team`;

  return sendEmail({
    to: data.email,
    subject: `Your FreddyBeach order #${data.orderNumber} is confirmed`,
    html,
    text,
  });
}

/**
 * Send a welcome email when a subscription starts
 */
export async function sendSubscriptionStartedEmail(
  data: SubscriptionStartedEmailData
): Promise<boolean> {
  const html = await render(
    SubscriptionStartedEmail({
      userName: data.userName,
      tierName: data.tierName,
      features: data.features,
      billingAmount: data.billingAmount,
      billingFrequency: data.billingFrequency,
      nextBillingDate: data.nextBillingDate,
      manageSubscriptionUrl: data.manageSubscriptionUrl,
    })
  );

  const frequencyLabel = data.billingFrequency === "monthly" ? "/month" : "/year";
  const featuresList = data.features.map((f) => `- ${f.name}`).join("\n");

  const text = `Hi ${data.userName.split(" ")[0]},\n\nWelcome to ${data.tierName}! Your subscription is now active.\n\nSubscription Details:\n- Plan: ${data.tierName}\n- Amount: $${data.billingAmount.toFixed(2)}${frequencyLabel}\n- Next billing date: ${data.nextBillingDate}\n\nWhat's Included:\n${featuresList}\n\nManage your subscription at: ${data.manageSubscriptionUrl || "https://freddybeach.com/dashboard/billing"}\n\nIf you have questions, contact us at support@freddybeach.com.\n\n— The FreddyBeach Team`;

  return sendEmail({
    to: data.email,
    subject: `Welcome to ${data.tierName}! Your subscription is now active`,
    html,
    text,
  });
}

/**
 * Send a confirmation when a subscription renews
 */
export async function sendSubscriptionRenewedEmail(
  data: SubscriptionRenewedEmailData
): Promise<boolean> {
  const html = await render(
    SubscriptionRenewedEmail({
      userName: data.userName,
      tierName: data.tierName,
      billingAmount: data.billingAmount,
      billingFrequency: data.billingFrequency,
      nextBillingDate: data.nextBillingDate,
      receiptUrl: data.receiptUrl,
      billingSettingsUrl: data.billingSettingsUrl,
    })
  );

  const frequencyLabel = data.billingFrequency === "monthly" ? "/month" : "/year";

  const text = `Hi ${data.userName.split(" ")[0]},\n\nYour ${data.tierName} subscription has been renewed.\n\nAmount charged: $${data.billingAmount.toFixed(2)}\nNext billing date: ${data.nextBillingDate}\nBilling frequency: $${data.billingAmount.toFixed(2)}${frequencyLabel}\n\nManage your billing at: ${data.billingSettingsUrl || "https://freddybeach.com/dashboard/billing"}\n\nThank you for your continued support!\n\n— The FreddyBeach Team`;

  return sendEmail({
    to: data.email,
    subject: `Your ${data.tierName} subscription has been renewed`,
    html,
    text,
  });
}

/**
 * Send a confirmation when a subscription is cancelled
 */
export async function sendSubscriptionCancelledEmail(
  data: SubscriptionCancelledEmailData
): Promise<boolean> {
  const html = await render(
    SubscriptionCancelledEmail({
      userName: data.userName,
      tierName: data.tierName,
      accessEndDate: data.accessEndDate,
      resubscribeUrl: data.resubscribeUrl,
      feedbackUrl: data.feedbackUrl,
    })
  );

  const text = `Hi ${data.userName.split(" ")[0]},\n\nYour ${data.tierName} subscription has been cancelled.\n\nYour access continues until: ${data.accessEndDate}\n\nAfter this date, your account will revert to our free tier. You'll keep your account and data, but premium features will be unavailable.\n\nChanged your mind? Resubscribe at: ${data.resubscribeUrl || "https://freddybeach.com/pricing"}\n\nWe'd love your feedback: ${data.feedbackUrl || "https://freddybeach.com/feedback"}\n\nThank you for being a ${data.tierName} member. We hope to see you again soon!\n\n— The FreddyBeach Team`;

  return sendEmail({
    to: data.email,
    subject: `Your ${data.tierName} subscription has been cancelled`,
    html,
    text,
  });
}

/**
 * Send an urgent notification when a payment fails
 */
export async function sendPaymentFailedEmail(
  data: PaymentFailedEmailData
): Promise<boolean> {
  const html = await render(
    PaymentFailedEmail({
      userName: data.userName,
      tierName: data.tierName,
      billingAmount: data.billingAmount,
      paymentMethodLast4: data.paymentMethodLast4,
      paymentMethodBrand: data.paymentMethodBrand,
      serviceInterruptionDate: data.serviceInterruptionDate,
      updatePaymentUrl: data.updatePaymentUrl,
    })
  );

  const paymentMethod = data.paymentMethodLast4
    ? `${data.paymentMethodBrand || "Card"} ending in ${data.paymentMethodLast4}`
    : "your payment method";

  const text = `Hi ${data.userName.split(" ")[0]},\n\nACTION REQUIRED: Your payment failed.\n\nWe were unable to process your payment for your ${data.tierName} subscription.\n\nAmount due: $${data.billingAmount.toFixed(2)}\nPayment method: ${paymentMethod} (failed)\n\nIMPORTANT: If your payment is not updated by ${data.serviceInterruptionDate}, your subscription will be paused.\n\nUpdate your payment method: ${data.updatePaymentUrl || "https://freddybeach.com/dashboard/billing"}\n\nIf you're having trouble, contact us at support@freddybeach.com.\n\n— The FreddyBeach Team`;

  return sendEmail({
    to: data.email,
    subject: "Action required: Your payment failed",
    html,
    text,
  });
}

/**
 * Send a consultation booking confirmation with ICS attachment
 */
export async function sendConsultationBookedEmail(
  data: ConsultationBookedEmailData
): Promise<boolean> {
  // Format date for display
  const dateTimeFormatted = data.startDateTime.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const html = await render(
    ConsultationBookedEmail({
      userName: data.userName,
      consultationTitle: data.consultationTitle,
      dateTime: dateTimeFormatted,
      duration: data.duration,
      meetingLink: data.meetingLink,
      timezone: data.timezone,
      preparationNotes: data.preparationNotes,
      rescheduleUrl: data.rescheduleUrl,
      cancelUrl: data.cancelUrl,
      googleCalendarUrl: data.googleCalendarUrl,
      outlookCalendarUrl: data.outlookCalendarUrl,
    })
  );

  // Generate ICS calendar attachment
  const icsContent = generateConsultationICS({
    title: data.consultationTitle,
    startDate: data.startDateTime,
    endDate: data.endDateTime,
    description: `FreddyBeach Consultation: ${data.consultationTitle}`,
    meetingLink: data.meetingLink,
    attendeeEmail: data.email,
  });

  const text = `Hi ${data.userName.split(" ")[0]},\n\nYour consultation has been successfully booked!\n\n${data.consultationTitle}\n\nDate & Time: ${dateTimeFormatted}\nTimezone: ${data.timezone}\nDuration: ${data.duration}${data.meetingLink ? `\nMeeting Link: ${data.meetingLink}` : ""}\n\nHow to Prepare:\n- Review any questions or topics you'd like to discuss\n- Have your business information readily available\n- Test your microphone and camera before the call\n- Join from a quiet location with stable internet\n\nNeed to make changes?\nReschedule: ${data.rescheduleUrl || "https://freddybeach.com/dashboard/consultations"}\nCancel: ${data.cancelUrl || "https://freddybeach.com/dashboard/consultations"}\n\nPlease provide at least 24 hours notice if you need to reschedule or cancel.\n\nIf you have questions, contact us at support@freddybeach.com.\n\n— The FreddyBeach Team`;

  return sendEmail({
    to: data.email,
    subject: `Your consultation is confirmed for ${dateTimeFormatted}`,
    html,
    text,
    attachments: [
      {
        filename: "consultation.ics",
        data: icsContent,
        contentType: "text/calendar",
      },
    ],
  });
}

// =============================================================================
// Booking Notification Email Helpers
// =============================================================================

export interface BookingNotificationAdminData {
  adminEmail: string;
  customerName: string;
  customerEmail: string;
  businessName: string;
  primaryNeed: string;
  challenge: string;
  selectedDateTime?: string;
}

/**
 * Send a notification email to admin when a new booking request is submitted
 */
export async function sendBookingNotificationToAdmin(
  data: BookingNotificationAdminData
): Promise<boolean> {
  const submittedAt = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const html = await render(
    BookingNotificationAdmin({
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      businessName: data.businessName,
      primaryNeed: data.primaryNeed,
      challenge: data.challenge,
      submittedAt,
      selectedDateTime: data.selectedDateTime,
    })
  );

  const dateTimeText = data.selectedDateTime
    ? `\nRequested Time: ${data.selectedDateTime}`
    : "";

  const text = `New Consultation Request

A new consultation request has been submitted through the website.

CUSTOMER INFORMATION
--------------------
Name: ${data.customerName}
Email: ${data.customerEmail}
Business: ${data.businessName}
Primary Need: ${data.primaryNeed}${dateTimeText}

CHALLENGE DESCRIPTION
--------------------
${data.challenge}

--------------------
Submitted on ${submittedAt}

Reply to this email or contact ${data.customerEmail} to follow up.

— FreddyBeach Booking System`;

  return sendEmail({
    to: data.adminEmail,
    subject: `New Booking Request: ${data.customerName} from ${data.businessName}`,
    html,
    text,
  });
}

export interface BookingConfirmationUserData {
  email: string;
  userName: string;
  businessName: string;
  selectedDateTime: string;
  primaryNeed: string;
  consultationDate: Date;
  consultationEndDate: Date;
}

/**
 * Send a confirmation email to the user when they submit a booking request
 */
export async function sendBookingConfirmationToUser(
  data: BookingConfirmationUserData
): Promise<boolean> {
  // Generate Google Calendar URL
  const googleCalendarUrl = generateGoogleCalendarUrl({
    title: "FreddyBeach Consultation",
    startDate: data.consultationDate,
    endDate: data.consultationEndDate,
    description: `Consultation with FreddyBeach for ${data.businessName}.\n\nPrimary Need: ${data.primaryNeed}\n\nWe'll send you a calendar invite with the video meeting link once your booking is confirmed.`,
  });

  const html = await render(
    BookingConfirmationUser({
      userName: data.userName,
      businessName: data.businessName,
      selectedDateTime: data.selectedDateTime,
      primaryNeed: data.primaryNeed,
      googleCalendarUrl,
    })
  );

  const text = `Hi ${data.userName.split(" ")[0]},

Thank you for your consultation request! We've received your booking and will be in touch within 24 hours to confirm.

YOUR REQUEST DETAILS
--------------------
Requested Time: ${data.selectedDateTime} (Atlantic Time)
Primary Need: ${data.primaryNeed}
Business: ${data.businessName}

ADD TO YOUR CALENDAR
--------------------
Google Calendar: ${googleCalendarUrl}

WHAT HAPPENS NEXT
-----------------
1. We'll review your request and confirm your consultation time
2. You'll receive a calendar invite with the video meeting link
3. We'll come prepared with insights tailored to your business

If you have any questions, feel free to reach out to kyle@freddybeach.com.

— Kyle & The FreddyBeach Team`;

  return sendEmail({
    to: data.email,
    subject: `Your consultation request for ${data.selectedDateTime}`,
    html,
    text,
  });
}
