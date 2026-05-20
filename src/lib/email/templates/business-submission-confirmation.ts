interface BusinessSubmissionConfirmationEmailData {
  submitterName: string;
  businessName: string;
  categoryName: string;
  address: string;
  city: string;
  province: string;
  manageUrl: string;
}

export function getBusinessSubmissionConfirmationEmailHtml({
  submitterName,
  businessName,
  categoryName,
  address,
  city,
  province,
  manageUrl,
}: BusinessSubmissionConfirmationEmailData): string {
  const fullAddress = `${address}, ${city}, ${province}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We received your business submission</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Thanks for your submission!</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin-top: 0;">Hi ${submitterName},</p>

    <p>We've received your business submission for <strong>FreddyBeach Directory</strong>. Our team will review the details and you'll get another email once it's approved and live.</p>

    <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #374151;">What you submitted</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; width: 120px;">Business Name:</td>
          <td style="padding: 8px 0; font-weight: 500;">${businessName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Category:</td>
          <td style="padding: 8px 0;">${categoryName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Address:</td>
          <td style="padding: 8px 0;">${fullAddress}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; color: #92400e;"><strong>What happens next?</strong></p>
      <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #92400e;">
        <li>Our team will review your listing within 1-2 business days</li>
        <li>You'll be notified once your listing is approved</li>
        <li>Once approved, your business will appear in the directory</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${manageUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">
        Manage My Businesses
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">
      This is an automated confirmation from FreddyBeach Directory.<br>
      If you didn't submit this business, please ignore this email.
    </p>
  </div>
</body>
</html>
  `.trim();
}

export function getBusinessSubmissionConfirmationEmailSubject(
  businessName: string
): string {
  return `We received your submission: ${businessName}`;
}
