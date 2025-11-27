import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";
import { EmailButton } from "./components/email-button";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const firstName = name.split(" ")[0];

  return (
    <EmailLayout preview={`Welcome to FreddyBeach, ${firstName}!`}>
      <EmailHeading as="h1">Welcome to FreddyBeach!</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        Thanks for joining FreddyBeach.com! We&apos;re excited to have you as
        part of our community. FreddyBeach is your go-to guide for discovering
        the best local businesses, restaurants, and services in the Fredericton
        area.
      </Text>

      <EmailHeading as="h2">Getting Started</EmailHeading>

      <Section style={styles.stepsSection}>
        <Row style={styles.stepRow}>
          <Column style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </Column>
          <Column style={styles.stepContent}>
            <Text style={styles.stepTitle}>Explore Local Businesses</Text>
            <Text style={styles.stepDescription}>
              Browse our directory to discover restaurants, shops, services, and
              more in Fredericton.
            </Text>
          </Column>
        </Row>

        <Row style={styles.stepRow}>
          <Column style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </Column>
          <Column style={styles.stepContent}>
            <Text style={styles.stepTitle}>Save Your Favorites</Text>
            <Text style={styles.stepDescription}>
              Create a list of your favorite spots so you can easily find them
              later.
            </Text>
          </Column>
        </Row>

        <Row style={styles.stepRow}>
          <Column style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </Column>
          <Column style={styles.stepContent}>
            <Text style={styles.stepTitle}>Share Your Experience</Text>
            <Text style={styles.stepDescription}>
              Leave reviews to help others discover great local businesses.
            </Text>
          </Column>
        </Row>
      </Section>

      <Section style={styles.ctaSection}>
        <EmailButton href="https://freddybeach.com/explore">
          Explore the Directory
        </EmailButton>
      </Section>

      <Text style={styles.closing}>
        If you have any questions, feel free to reach out. We&apos;re here to
        help!
      </Text>

      <Text style={styles.signature}>
        — The FreddyBeach Team
      </Text>
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
  signature: {
    fontSize: "16px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
} as const;

export default WelcomeEmail;
