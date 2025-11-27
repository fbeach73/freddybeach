import { Text, Section, Hr } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";
import { EmailButton } from "./components/email-button";

interface ClaimSubmittedEmailProps {
  userName: string;
  businessName: string;
}

export function ClaimSubmittedEmail({
  userName,
  businessName,
}: ClaimSubmittedEmailProps) {
  const firstName = userName.split(" ")[0];

  return (
    <EmailLayout preview={`Your claim for ${businessName} has been received`}>
      <EmailHeading as="h1">Claim Received</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        Thank you for submitting your claim for <strong>{businessName}</strong>{" "}
        on FreddyBeach. We&apos;ve received your request and it&apos;s now in
        our review queue.
      </Text>

      <Section style={styles.infoBox}>
        <Text style={styles.infoLabel}>Business Name</Text>
        <Text style={styles.infoValue}>{businessName}</Text>
      </Section>

      <EmailHeading as="h2">What Happens Next?</EmailHeading>

      <Text style={styles.paragraph}>
        Our team will review your claim within <strong>2-3 business days</strong>.
        We&apos;ll verify the information you provided and may reach out if we need
        any additional documentation.
      </Text>

      <Section style={styles.timelineSection}>
        <Text style={styles.timelineItem}>
          <span style={styles.checkmark}>✓</span> Claim submitted
        </Text>
        <Text style={styles.timelineItem}>
          <span style={styles.pending}>○</span> Under review (2-3 business days)
        </Text>
        <Text style={styles.timelineItem}>
          <span style={styles.pending}>○</span> Decision notification
        </Text>
      </Section>

      <Hr style={styles.divider} />

      <Text style={styles.paragraph}>
        Once approved, you&apos;ll have access to your business dashboard where
        you can:
      </Text>

      <Text style={styles.bulletPoint}>• Update your business information</Text>
      <Text style={styles.bulletPoint}>• Add photos and menus</Text>
      <Text style={styles.bulletPoint}>• Respond to customer reviews</Text>
      <Text style={styles.bulletPoint}>• View analytics and insights</Text>

      <Section style={styles.ctaSection}>
        <EmailButton href="https://freddybeach.com/explore">
          Explore FreddyBeach
        </EmailButton>
      </Section>

      <Text style={styles.closing}>
        If you have any questions about your claim, feel free to reply to this
        email or contact us at{" "}
        <a href="mailto:support@freddybeach.com" style={styles.link}>
          support@freddybeach.com
        </a>
        .
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
  infoBox: {
    backgroundColor: BRAND.secondary,
    padding: "16px 20px",
    borderRadius: "8px",
    margin: "24px 0",
  },
  infoLabel: {
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color: "#666666",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 4px 0",
  },
  infoValue: {
    fontSize: "18px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  timelineSection: {
    margin: "16px 0 24px 0",
    paddingLeft: "8px",
  },
  timelineItem: {
    fontSize: "15px",
    lineHeight: "28px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  checkmark: {
    color: "#22C55E",
    marginRight: "8px",
    fontWeight: "700" as const,
  },
  pending: {
    color: "#9CA3AF",
    marginRight: "8px",
  },
  divider: {
    borderColor: "#E5E7EB",
    margin: "24px 0",
  },
  bulletPoint: {
    fontSize: "15px",
    lineHeight: "28px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
    paddingLeft: "8px",
  },
  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  closing: {
    fontSize: "16px",
    lineHeight: "24px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "24px 0 8px 0",
  },
  link: {
    color: BRAND.primary,
    textDecoration: "underline",
  },
  signature: {
    fontSize: "16px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
} as const;

export default ClaimSubmittedEmail;
