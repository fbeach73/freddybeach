interface ClaimSubmittedEmailData {
  userName: string;
  businessName: string;
}

export function getClaimSubmittedEmailHtml({
  userName,
  businessName,
}: ClaimSubmittedEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Business Claim Received</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Claim Received</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin-top: 0;">Hi ${userName},</p>

    <p>Thank you for submitting your claim for <strong>${businessName}</strong> on FreddyBeach Directory.</p>

    <p>Our team will review your claim within <strong>2-3 business days</strong>. We may contact you if we need any additional information to verify your ownership.</p>

    <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #374151;">What happens next?</h3>
      <ol style="padding-left: 20px; margin-bottom: 0;">
        <li>Our team reviews your submission</li>
        <li>We verify the information provided</li>
        <li>You'll receive an email with our decision</li>
        <li>If approved, you'll get full access to manage your listing</li>
      </ol>
    </div>

    <p style="color: #6b7280; font-size: 14px;">
      If you have any questions about your claim, feel free to reply to this email.
    </p>

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

export function getClaimSubmittedEmailSubject(businessName: string): string {
  return `We received your claim for ${businessName}`;
}
