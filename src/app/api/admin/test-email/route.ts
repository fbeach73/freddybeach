import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  sendEmail,
  getClaimSubmittedEmailHtml,
  getClaimSubmittedEmailSubject,
  getClaimApprovedEmailHtml,
  getClaimApprovedEmailSubject,
  getClaimRejectedEmailHtml,
  getClaimRejectedEmailSubject,
} from "@/lib/email";
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/lib/services/email";

/**
 * POST /api/admin/test-email
 * Test email delivery - Admin only
 *
 * Body:
 * {
 *   "template": "claim-submitted" | "claim-approved" | "claim-rejected" | "welcome" | "verify" | "password-reset" | "raw",
 *   "to": "email@example.com" (optional, defaults to admin's email)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { template, to } = body;
    const recipientEmail = to || session.user.email;
    const testUserName = session.user.name || "Test User";

    // Check Mailgun configuration
    const mailgunConfigured = !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN);

    if (!mailgunConfigured) {
      return NextResponse.json({
        error: "Mailgun not configured",
        details: {
          MAILGUN_API_KEY: process.env.MAILGUN_API_KEY ? "SET" : "MISSING",
          MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || "MISSING",
          EMAIL_FROM: process.env.EMAIL_FROM || "MISSING",
        },
      }, { status: 500 });
    }

    let result;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    switch (template) {
      case "claim-submitted":
        result = await sendEmail({
          to: recipientEmail,
          subject: getClaimSubmittedEmailSubject("Test Business"),
          html: getClaimSubmittedEmailHtml({
            userName: testUserName,
            businessName: "Test Business",
          }),
        });
        break;

      case "claim-approved":
        result = await sendEmail({
          to: recipientEmail,
          subject: getClaimApprovedEmailSubject("Test Business"),
          html: getClaimApprovedEmailHtml({
            userName: testUserName,
            businessName: "Test Business",
            dashboardUrl: `${appUrl}/dashboard/my-businesses`,
          }),
        });
        break;

      case "claim-rejected":
        result = await sendEmail({
          to: recipientEmail,
          subject: getClaimRejectedEmailSubject("Test Business"),
          html: getClaimRejectedEmailHtml({
            userName: testUserName,
            businessName: "Test Business",
            rejectionReason: "This is a test rejection. No action needed.",
          }),
        });
        break;

      case "welcome":
        const welcomeResult = await sendWelcomeEmail({
          email: recipientEmail,
          name: testUserName,
        });
        result = welcomeResult ? { id: "welcome-sent" } : null;
        break;

      case "verify":
        const verifyResult = await sendVerificationEmail({
          email: recipientEmail,
          name: testUserName,
          verificationUrl: `${appUrl}/auth/verify?token=test-token-123`,
        });
        result = verifyResult ? { id: "verify-sent" } : null;
        break;

      case "password-reset":
        const resetResult = await sendPasswordResetEmail({
          email: recipientEmail,
          name: testUserName,
          resetUrl: `${appUrl}/auth/reset-password?token=test-token-123`,
        });
        result = resetResult ? { id: "reset-sent" } : null;
        break;

      case "raw":
        // Simple raw test email to verify Mailgun connectivity
        result = await sendEmail({
          to: recipientEmail,
          subject: "FreddyBeach Test Email",
          html: `
            <html>
              <body style="font-family: sans-serif; padding: 20px;">
                <h1>Test Email</h1>
                <p>This is a test email from FreddyBeach Directory.</p>
                <p>If you received this, your email configuration is working!</p>
                <hr>
                <p style="color: #666; font-size: 12px;">
                  Sent at: ${new Date().toISOString()}<br>
                  To: ${recipientEmail}<br>
                  Domain: ${process.env.MAILGUN_DOMAIN}<br>
                  From: ${process.env.EMAIL_FROM}
                </p>
              </body>
            </html>
          `,
        });
        break;

      default:
        return NextResponse.json({
          error: "Invalid template",
          availableTemplates: [
            "raw",
            "claim-submitted",
            "claim-approved",
            "claim-rejected",
            "welcome",
            "verify",
            "password-reset",
          ],
        }, { status: 400 });
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${recipientEmail}`,
        template,
        mailgunResponse: result,
        config: {
          MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
          EMAIL_FROM: process.env.EMAIL_FROM,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Email send returned null - check server logs",
        template,
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json({
      error: "Failed to send test email",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

/**
 * GET /api/admin/test-email
 * Check email configuration status
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const config = {
      MAILGUN_API_KEY: process.env.MAILGUN_API_KEY ? `${process.env.MAILGUN_API_KEY.substring(0, 8)}...` : "NOT SET",
      MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || "NOT SET",
      EMAIL_FROM: process.env.EMAIL_FROM || "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
      configured: !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN),
    };

    // Note about domain matching
    const fromEmail = process.env.EMAIL_FROM || "";
    const mailgunDomain = process.env.MAILGUN_DOMAIN || "";
    const domainMismatch = fromEmail && mailgunDomain && !fromEmail.endsWith(`@${mailgunDomain}`);

    return NextResponse.json({
      config,
      warnings: domainMismatch ? [
        `Warning: EMAIL_FROM domain (${fromEmail}) doesn't match MAILGUN_DOMAIN (${mailgunDomain}). This may cause email delivery issues.`,
        `Consider changing EMAIL_FROM to something@${mailgunDomain}`,
      ] : [],
      availableTemplates: [
        "raw",
        "claim-submitted",
        "claim-approved",
        "claim-rejected",
        "welcome",
        "verify",
        "password-reset",
      ],
      usage: {
        checkConfig: "GET /api/admin/test-email",
        sendTest: "POST /api/admin/test-email with body: { template: 'raw', to: 'email@example.com' }",
      },
    });
  } catch (error) {
    console.error("Check email config error:", error);
    return NextResponse.json({
      error: "Failed to check email config",
    }, { status: 500 });
  }
}
