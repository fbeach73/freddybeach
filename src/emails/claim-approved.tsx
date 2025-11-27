import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";
import { EmailButton } from "./components/email-button";

interface ClaimApprovedEmailProps {
  userName: string;
  businessName: string;
  businessSlug: string;
}

export function ClaimApprovedEmail({
  userName,
  businessName,
  businessSlug,
}: ClaimApprovedEmailProps) {
  const firstName = userName.split(" ")[0];
  const dashboardUrl = `https://freddybeach.com/dashboard/business/${businessSlug}`;
  const businessUrl = `https://freddybeach.com/business/${businessSlug}`;

  return (
    <EmailLayout preview={`Congratulations! Your claim for ${businessName} has been approved`}>
      <Section style={styles.celebrationBanner}>
        <Text style={styles.celebrationEmoji}>🎉</Text>
      </Section>

      <EmailHeading as="h1">Claim Approved!</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        Great news! Your claim for <strong>{businessName}</strong> has been
        approved. You now have full access to manage your business listing on
        FreddyBeach.
      </Text>

      <Section style={styles.infoBox}>
        <Text style={styles.infoLabel}>Your Business</Text>
        <Text style={styles.infoValue}>{businessName}</Text>
        <Text style={styles.infoLink}>
          <a href={businessUrl} style={styles.link}>
            View your listing →
          </a>
        </Text>
      </Section>

      <Section style={styles.ctaSection}>
        <EmailButton href={dashboardUrl}>
          Go to Business Dashboard
        </EmailButton>
      </Section>

      <EmailHeading as="h2">Next Steps</EmailHeading>

      <Text style={styles.paragraph}>
        Here are a few things you can do to get the most out of your listing:
      </Text>

      <Section style={styles.stepsSection}>
        <Row style={styles.stepRow}>
          <Column style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </Column>
          <Column style={styles.stepContent}>
            <Text style={styles.stepTitle}>Update Your Information</Text>
            <Text style={styles.stepDescription}>
              Make sure your hours, contact details, and description are
              accurate and up-to-date.
            </Text>
          </Column>
        </Row>

        <Row style={styles.stepRow}>
          <Column style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </Column>
          <Column style={styles.stepContent}>
            <Text style={styles.stepTitle}>Add Photos</Text>
            <Text style={styles.stepDescription}>
              Showcase your business with high-quality photos. Listings with
              photos get more views!
            </Text>
          </Column>
        </Row>

        <Row style={styles.stepRow}>
          <Column style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </Column>
          <Column style={styles.stepContent}>
            <Text style={styles.stepTitle}>Respond to Reviews</Text>
            <Text style={styles.stepDescription}>
              Engage with your customers by responding to their reviews and
              feedback.
            </Text>
          </Column>
        </Row>

        <Row style={styles.stepRow}>
          <Column style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </Column>
          <Column style={styles.stepContent}>
            <Text style={styles.stepTitle}>Track Your Performance</Text>
            <Text style={styles.stepDescription}>
              View analytics to see how customers are finding and interacting
              with your listing.
            </Text>
          </Column>
        </Row>
      </Section>

      <Text style={styles.closing}>
        If you have any questions about managing your listing, check out our{" "}
        <a href="https://freddybeach.com/help/business-owners" style={styles.link}>
          Business Owner Guide
        </a>{" "}
        or contact us at{" "}
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
  celebrationBanner: {
    textAlign: "center" as const,
    margin: "0 0 16px 0",
  },
  celebrationEmoji: {
    fontSize: "48px",
    margin: "0",
  },
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
    backgroundColor: "#ECFDF5",
    padding: "16px 20px",
    borderRadius: "8px",
    borderLeft: "4px solid #22C55E",
    margin: "24px 0",
  },
  infoLabel: {
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color: "#166534",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 4px 0",
  },
  infoValue: {
    fontSize: "18px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  infoLink: {
    fontSize: "14px",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  link: {
    color: BRAND.primary,
    textDecoration: "underline",
  },
  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  stepsSection: {
    margin: "24px 0",
  },
  stepRow: {
    marginBottom: "16px",
  },
  stepNumber: {
    width: "40px",
    verticalAlign: "top" as const,
  },
  stepNumberText: {
    backgroundColor: BRAND.primary,
    color: "#FFFFFF",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    textAlign: "center" as const,
    lineHeight: "28px",
    fontSize: "14px",
    fontWeight: "600" as const,
    fontFamily: BRAND.fontFamily,
    margin: "0",
    display: "inline-block",
  },
  stepContent: {
    paddingLeft: "8px",
    verticalAlign: "top" as const,
  },
  stepTitle: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 4px 0",
  },
  stepDescription: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#666666",
    fontFamily: BRAND.fontFamily,
    margin: "0",
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

export default ClaimApprovedEmail;
