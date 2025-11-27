interface ClaimApprovedEmailData {
  userName: string;
  businessName: string;
  dashboardUrl: string;
}

export function getClaimApprovedEmailHtml({
  userName,
  businessName,
  dashboardUrl,
}: ClaimApprovedEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Business Claim Has Been Approved</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Claim Approved!</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin-top: 0;">Hi ${userName},</p>

    <p>Great news! Your claim for <strong>${businessName}</strong> has been approved.</p>

    <p>You are now the verified owner of this business listing on FreddyBeach Directory. Here's what you can do next:</p>

    <ul style="padding-left: 20px;">
      <li>Update your business information and hours</li>
      <li>Add photos and special offers</li>
      <li>Respond to customer reviews</li>
      <li>Access business analytics</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
        Manage Your Business
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px;">
      If you have any questions, feel free to reply to this email.
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

export function getClaimApprovedEmailSubject(businessName: string): string {
  return `Your claim for ${businessName} has been approved!`;
}
