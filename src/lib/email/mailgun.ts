import Mailgun from "mailgun.js";
import FormData from "form-data";

// Initialize Mailgun client
const mailgun = new Mailgun(FormData);

// Create Mailgun client instance
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});

// Get the domain from environment variable
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || "";

// Get the from address
const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || `noreply@${MAILGUN_DOMAIN}`;
const FROM_NAME = "FreddyBeach Directory";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Mailgun
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  if (!process.env.MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    console.warn("Mailgun not configured - skipping email send");
    console.log(`Would send email to ${to}: ${subject}`);
    return null;
  }

  try {
    const result = await mg.messages.create(MAILGUN_DOMAIN, {
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for plain text fallback
    });

    console.log(`Email sent successfully to ${to}: ${result.id}`);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
