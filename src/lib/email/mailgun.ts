import Mailgun from "mailgun.js";
import FormData from "form-data";

// Lazily initialize Mailgun client to avoid errors during build
let mg: ReturnType<InstanceType<typeof Mailgun>["client"]> | null = null;

function getMailgunClient() {
  if (!mg) {
    const mailgun = new Mailgun(FormData);
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

function getFromEmail() {
  const domain = getMailgunDomain();
  return process.env.MAILGUN_FROM_EMAIL || `noreply@${domain}`;
}

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
  const domain = getMailgunDomain();

  if (!process.env.MAILGUN_API_KEY || !domain) {
    console.warn("Mailgun not configured - skipping email send");
    console.log(`Would send email to ${to}: ${subject}`);
    return null;
  }

  try {
    const client = getMailgunClient();
    const fromEmail = getFromEmail();
    const result = await client.messages.create(domain, {
      from: `${FROM_NAME} <${fromEmail}>`,
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
