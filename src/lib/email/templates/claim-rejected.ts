interface ClaimRejectedEmailData {
  userName: string;
  businessName: string;
  rejectionReason: string;
  supportEmail?: string;
}

export function getClaimRejectedEmailHtml({
  userName,
  businessName,
  rejectionReason,
  supportEmail = "support@freddybeach.com",
}: ClaimRejectedEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Update on Your Business Claim</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #6b7280; padding: 30px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Claim Update</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin-top: 0;">Hi ${userName},</p>

    <p>Thank you for your interest in claiming <strong>${businessName}</strong> on FreddyBeach Directory.</p>

    <p>After reviewing your submission, we were unable to verify your claim at this time. Here's the reason provided:</p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
      <p style="margin: 0; color: #92400e;">${rejectionReason}</p>
    </div>

    <p>If you believe this was an error or have additional documentation to support your claim, please don't hesitate to reach out to us at <a href="mailto:${supportEmail}" style="color: #667eea;">${supportEmail}</a>.</p>

    <p>You're welcome to submit a new claim with additional verification information.</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">
      This email was sent by FreddyBeach Directory.<br>
      You received this because you submitted a business claim.
    </p>
  </div>
</body>
</html>
  `.trim();
}

export function getClaimRejectedEmailSubject(businessName: string): string {
  return `Update on your claim for ${businessName}`;
}
