import { Text, Section, Link } from "@react-email/components";
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
    <EmailLayout preview="Verify your email for FreddyBeach">
      <EmailHeading as="h1">Verify Your Email</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        Thanks for signing up for FreddyBeach! Please verify your email address
        by clicking the button below:
      </Text>

      <Section style={styles.ctaSection}>
        <EmailButton href={verificationUrl}>Verify Email Address</EmailButton>
      </Section>

      <Text style={styles.expiration}>
        This link will expire in 24 hours.
      </Text>

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
    margin: "0 0 24px 0",
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
  alternativeSection: {
    backgroundColor: "#F5F5F5",
    padding: "16px",
    borderRadius: "6px",
    margin: "0 0 24px 0",
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
