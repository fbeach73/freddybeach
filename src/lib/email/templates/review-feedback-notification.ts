interface FeedbackNotificationData {
  businessName: string;
  customerName: string;
  rating: number;
  message: string;
  dashboardUrl: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getReviewFeedbackEmailHtml({
  businessName,
  customerName,
  rating,
  message,
  dashboardUrl,
}: FeedbackNotificationData): string {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New private feedback</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 28px;">
    <h1 style="margin-top: 0; font-size: 20px; color: #111827;">New private feedback for ${escapeHtml(businessName)}</h1>

    <p style="font-size: 16px; margin-bottom: 24px;">A customer just submitted private feedback through your Review Collector. You're getting this email instead of seeing it on Google, which is the whole point — handle it before it becomes public.</p>

    <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
      <p style="margin: 0 0 6px 0; font-size: 14px; color: #6b7280;">Customer</p>
      <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">${escapeHtml(customerName)}</p>

      <p style="margin: 0 0 6px 0; font-size: 14px; color: #6b7280;">Rating</p>
      <p style="margin: 0 0 16px 0; font-size: 20px; color: #f59e0b; letter-spacing: 2px;">${stars} <span style="font-size: 14px; color: #6b7280;">(${rating} of 5)</span></p>

      <p style="margin: 0 0 6px 0; font-size: 14px; color: #6b7280;">What they said</p>
      <p style="margin: 0; font-size: 15px; white-space: pre-line;">${escapeHtml(message)}</p>
    </div>

    <div style="text-align: center; margin: 24px 0 8px 0;">
      <a href="${dashboardUrl}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">Open feedback inbox</a>
    </div>

    <p style="font-size: 13px; color: #6b7280; margin-top: 32px;">
      Tip: a quick personal reply within 24 hours turns an upset customer into a loyal one more often than not.
    </p>
  </div>
</body>
</html>
  `.trim();
}

export function getReviewFeedbackEmailSubject({
  customerName,
  rating,
}: {
  customerName: string;
  rating: number;
}): string {
  return `New private feedback from ${customerName} — ${rating} star${rating === 1 ? "" : "s"}`;
}
