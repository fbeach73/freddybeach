import { Text, Section, Hr } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";
import { EmailButton } from "./components/email-button";

interface ClaimRejectedEmailProps {
  userName: string;
  businessName: string;
  reason?: string;
}

export function ClaimRejectedEmail({
  userName,
  businessName,
  reason,
}: ClaimRejectedEmailProps) {
  const firstName = userName.split(" ")[0];

  return (
    <EmailLayout preview={`Update on your claim for ${businessName}`}>
      <EmailHeading as="h1">Claim Update</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        Thank you for your interest in claiming <strong>{businessName}</strong>{" "}
        on FreddyBeach. After reviewing your submission, we were unable to
        approve your claim at this time.
      </Text>

      {reason && (
        <Section style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>Reason</Text>
          <Text style={styles.reasonText}>{reason}</Text>
        </Section>
      )}

      <Hr style={styles.divider} />

      <EmailHeading as="h2">What You Can Do</EmailHeading>

      <Text style={styles.paragraph}>
        If you believe this decision was made in error or if you have additional
        documentation to support your claim, you have a few options:
      </Text>

      <Section style={styles.optionsSection}>
        <Text style={styles.optionItem}>
          <strong>Submit a New Claim</strong>
          <br />
          <span style={styles.optionDescription}>
            Gather additional documentation (business license, utility bill,
            official correspondence) and submit a new claim with more supporting
            evidence.
          </span>
        </Text>

        <Text style={styles.optionItem}>
          <strong>Appeal This Decision</strong>
          <br />
          <span style={styles.optionDescription}>
            If you have questions about why your claim was rejected or would
            like to appeal, contact our support team with your claim details.
          </span>
        </Text>

        <Text style={styles.optionItem}>
          <strong>Contact Support</strong>
          <br />
          <span style={styles.optionDescription}>
            Our team is happy to help clarify what documentation is needed or
            answer any questions you have.
          </span>
        </Text>
      </Section>

      <Section style={styles.ctaSection}>
        <EmailButton href="mailto:support@freddybeach.com">
          Contact Support
        </EmailButton>
      </Section>

      <Hr style={styles.divider} />

      <Text style={styles.helpText}>
        Common documentation that helps verify business ownership:
      </Text>

      <Text style={styles.bulletPoint}>• Business license or registration</Text>
      <Text style={styles.bulletPoint}>• Utility bill with business name and address</Text>
      <Text style={styles.bulletPoint}>• Tax registration documents</Text>
      <Text style={styles.bulletPoint}>• Official business correspondence</Text>

      <Text style={styles.closing}>
        We understand this may be disappointing, and we appreciate your patience
        throughout this process. Our goal is to ensure all business claims are
        legitimate to protect both business owners and our community.
      </Text>

      <Text style={styles.signature}>— The FreddyBeach Team</Text>
    </EmailLayout>
  );
}

const styles = {
  greeting: {
    fontSize: "16px",
    lineHeight: "24px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 16px 0",
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "26px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 24px 0",
  },
  reasonBox: {
    backgroundColor: "#FEF2F2",
    padding: "16px 20px",
    borderRadius: "8px",
    borderLeft: "4px solid #EF4444",
    margin: "24px 0",
  },
  reasonLabel: {
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color: "#991B1B",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  reasonText: {
    fontSize: "15px",
    lineHeight: "24px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  divider: {
    borderColor: "#E5E7EB",
    margin: "24px 0",
  },
  optionsSection: {
    margin: "16px 0 24px 0",
  },
  optionItem: {
    fontSize: "15px",
    lineHeight: "24px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 16px 0",
    paddingLeft: "8px",
  },
  optionDescription: {
    color: "#666666",
    fontSize: "14px",
  },
  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  helpText: {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#666666",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 12px 0",
  },
  bulletPoint: {
    fontSize: "14px",
    lineHeight: "26px",
    color: "#666666",
    fontFamily: BRAND.fontFamily,
    margin: "0",
    paddingLeft: "8px",
  },
  closing: {
    fontSize: "16px",
    lineHeight: "24px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "24px 0 8px 0",
  },
  signature: {
    fontSize: "16px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
} as const;

export default ClaimRejectedEmail;
