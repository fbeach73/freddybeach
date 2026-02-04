import { Text, Section, Link, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";
import { EmailButton } from "./components/email-button";

interface VerifyEmailProps {
  name: string;
  verificationUrl: string;
}

export function VerifyEmail({ name, verificationUrl }: VerifyEmailProps) {
  const firstName = name.split(" ")[0];

  return (
    <EmailLayout preview={`Welcome to FreddyBeach, ${firstName}! Please verify your email.`}>
      <EmailHeading as="h1">Welcome to FreddyBeach!</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        Thanks for joining FreddyBeach.com! We&apos;re excited to have you as
        part of our community. FreddyBeach is your go-to guide for discovering
        the best local businesses, restaurants, and services in the Fredericton
        area.
      </Text>

      <Text style={styles.paragraph}>
        To get started, please verify your email address by clicking the button
        below:
      </Text>

      <Section style={styles.ctaSection}>
        <EmailButton href={verificationUrl}>Verify Email Address</EmailButton>
      </Section>

      <Text style={styles.expiration}>
        This link will expire in 24 hours.
      </Text>

      <EmailHeading as="h2">What You Can Do</EmailHeading>

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

      <Section style={styles.alternativeSection}>
        <Text style={styles.alternativeText}>
          If the button doesn&apos;t work, copy and paste this link into your
          browser:
        </Text>
        <Text style={styles.linkText}>
          <Link href={verificationUrl} style={styles.link}>
            {verificationUrl}
          </Link>
        </Text>
      </Section>

      <Section style={styles.securitySection}>
        <Text style={styles.securityText}>
          If you didn&apos;t create an account on FreddyBeach, you can safely
          ignore this email.
        </Text>
      </Section>

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
    margin: "0 0 16px 0",
  },
  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  expiration: {
    fontSize: "14px",
    color: "#666666",
    fontFamily: BRAND.fontFamily,
    textAlign: "center" as const,
    margin: "0 0 32px 0",
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
  alternativeSection: {
    backgroundColor: "#F5F5F5",
    padding: "16px",
    borderRadius: "6px",
    margin: "24px 0",
  },
  alternativeText: {
    fontSize: "13px",
    color: "#666666",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  linkText: {
    fontSize: "13px",
    fontFamily: BRAND.fontFamily,
    margin: "0",
    wordBreak: "break-all" as const,
  },
  link: {
    color: BRAND.primary,
    textDecoration: "underline",
  },
  securitySection: {
    borderTop: "1px solid #E5E5E5",
    paddingTop: "20px",
    marginTop: "24px",
  },
  securityText: {
    fontSize: "13px",
    color: "#999999",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 16px 0",
  },
  signature: {
    fontSize: "16px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
} as const;

export default VerifyEmail;
