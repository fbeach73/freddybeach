interface ReviewRequestEmailData {
  customerName: string;
  businessName: string;
  reviewUrl: string;
  brandColor?: string | null;
  logoUrl?: string | null;
  senderName?: string | null;
  senderSignature?: string | null;
  businessSlug: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getReviewRequestEmailHtml({
  customerName,
  businessName,
  reviewUrl,
  brandColor,
  logoUrl,
  senderName,
  senderSignature,
  businessSlug,
}: ReviewRequestEmailData): string {
  const color = brandColor && /^#[0-9a-fA-F]{6}$/.test(brandColor) ? brandColor : "#0F766E";
  const safeBusiness = escapeHtml(businessName);
  const safeCustomer = escapeHtml(customerName);
  const safeSender = escapeHtml(senderName || businessName);
  const safeSignature = senderSignature ? escapeHtml(senderSignature) : "";
  const poweredByUrl = `https://freddybeach.com/?ref=review-collector&business=${encodeURIComponent(businessSlug)}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>How did we do?</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
    ${
      logoUrl
        ? `<div style="background: #ffffff; padding: 24px; text-align: center; border-bottom: 1px solid #e5e7eb;"><img src="${escapeHtml(
            logoUrl
          )}" alt="${safeBusiness}" style="max-height: 60px; max-width: 240px;" /></div>`
        : `<div style="background: ${color}; padding: 24px; text-align: center;"><h1 style="color: #ffffff; margin: 0; font-size: 22px;">${safeBusiness}</h1></div>`
    }

    <div style="padding: 32px 28px;">
      <p style="margin-top: 0; font-size: 16px;">Hi ${safeCustomer},</p>

      <p style="font-size: 16px;">Thanks for choosing <strong>${safeBusiness}</strong>. Could you take 10 seconds to let us know how we did? Your feedback genuinely helps us &mdash; and helps other locals find a business they can trust.</p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${reviewUrl}" style="display: inline-block; background: ${color}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">Leave a quick rating</a>
      </div>

      <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0;">It only takes a moment.</p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

      <p style="font-size: 15px; margin-bottom: 4px;">Thanks again,</p>
      <p style="font-size: 15px; margin-top: 0; font-weight: 600;">${safeSender}</p>
      ${safeSignature ? `<p style="font-size: 14px; color: #6b7280; white-space: pre-line; margin-top: 8px;">${safeSignature}</p>` : ""}
    </div>

    <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        Powered by <a href="${poweredByUrl}" style="color: #6b7280; text-decoration: none; font-weight: 500;">FreddyBeach</a> &middot;
        <a href="${poweredByUrl}" style="color: #9ca3af; text-decoration: underline;">freddybeach.com</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getReviewRequestEmailSubject(businessName: string): string {
  return `Quick favor — how did we do at ${businessName}?`;
}
