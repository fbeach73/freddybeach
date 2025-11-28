interface BusinessSubmissionAdminEmailData {
  businessName: string;
  categoryName: string;
  submitterName: string;
  submitterEmail: string;
  adminUrl: string;
}

export function getBusinessSubmissionAdminEmailHtml({
  businessName,
  categoryName,
  submitterName,
  submitterEmail,
  adminUrl,
}: BusinessSubmissionAdminEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Business Submission</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Business Submission</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin-top: 0;">A new business has been submitted for review on FreddyBeach Directory.</p>

    <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #374151;">Business Details</h3>
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
          <td style="padding: 8px 0; color: #6b7280;">Submitted By:</td>
          <td style="padding: 8px 0;">${submitterName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Email:</td>
          <td style="padding: 8px 0;">${submitterEmail}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${adminUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">
        Review in Admin Panel
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">
      This is an automated notification from FreddyBeach Directory.<br>
      A user has submitted a new business for review.
    </p>
  </div>
</body>
</html>
  `.trim();
}

export function getBusinessSubmissionAdminEmailSubject(
  businessName: string
): string {
  return `[Review Required] New business submission: ${businessName}`;
}
