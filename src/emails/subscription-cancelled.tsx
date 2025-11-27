import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";
import { EmailButton } from "./components/email-button";

interface SubscriptionCancelledEmailProps {
  userName: string;
  tierName: string;
  accessEndDate: string;
  resubscribeUrl?: string;
  feedbackUrl?: string;
}

export function SubscriptionCancelledEmail({
  userName,
  tierName,
  accessEndDate,
  resubscribeUrl = "https://freddybeach.com/pricing",
  feedbackUrl = "https://freddybeach.com/feedback",
}: SubscriptionCancelledEmailProps) {
  const firstName = userName.split(" ")[0];

  return (
    <EmailLayout
      preview={`Your ${tierName} subscription has been cancelled`}
    >
      <EmailHeading as="h1">Subscription Cancelled</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        We&apos;ve received your request to cancel your{" "}
        <strong>{tierName}</strong> subscription. Your cancellation has been
        confirmed.
      </Text>

      {/* Access End Date */}
      <Section style={styles.importantBox}>
        <Row>
          <Column style={styles.iconColumn}>
            <Text style={styles.calendarIcon}>📅</Text>
          </Column>
          <Column style={styles.contentColumn}>
            <Text style={styles.importantLabel}>Your access continues until</Text>
            <Text style={styles.importantDate}>{accessEndDate}</Text>
            <Text style={styles.importantNote}>
              You&apos;ll have full access to all {tierName} features until this
              date.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* What Happens Next */}
      <EmailHeading as="h2">What Happens Next</EmailHeading>

      <Section style={styles.timeline}>
        <Row style={styles.timelineItem}>
          <Column style={styles.timelineDotColumn}>
            <Text style={styles.timelineDot}>●</Text>
          </Column>
          <Column style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Now</Text>
            <Text style={styles.timelineDescription}>
              Your subscription has been cancelled. No further charges will be
              made.
            </Text>
          </Column>
        </Row>

        <Row style={styles.timelineItem}>
          <Column style={styles.timelineDotColumn}>
            <Text style={styles.timelineDotFaded}>●</Text>
          </Column>
          <Column style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Until {accessEndDate}</Text>
            <Text style={styles.timelineDescription}>
              Continue enjoying all your {tierName} benefits as usual.
            </Text>
          </Column>
        </Row>

        <Row style={styles.timelineItem}>
          <Column style={styles.timelineDotColumn}>
            <Text style={styles.timelineDotFaded}>●</Text>
          </Column>
          <Column style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>After {accessEndDate}</Text>
            <Text style={styles.timelineDescription}>
              Your account will revert to our free tier. You&apos;ll keep your
              account and data, but premium features will be unavailable.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* CTA to Resubscribe */}
      <Section style={styles.resubscribeBox}>
        <Text style={styles.resubscribeTitle}>Changed your mind?</Text>
        <Text style={styles.resubscribeText}>
          You can resubscribe at any time to regain access to all {tierName}{" "}
          features.
        </Text>
        <Section style={styles.ctaSection}>
          <EmailButton href={resubscribeUrl}>Resubscribe</EmailButton>
        </Section>
      </Section>

      {/* Feedback Request */}
      <Section style={styles.feedbackSection}>
        <Text style={styles.feedbackTitle}>We&apos;d love your feedback</Text>
        <Text style={styles.feedbackText}>
          Understanding why you cancelled helps us improve FreddyBeach for
          everyone. Would you mind sharing your thoughts?
        </Text>
        <Text style={styles.feedbackLink}>
          <a href={feedbackUrl} style={styles.link}>
            Share feedback →
          </a>
        </Text>
      </Section>

      <Text style={styles.closing}>
        Thank you for being a {tierName} member. We hope to see you again soon!
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
  importantBox: {
    backgroundColor: "#FEF3C7",
    padding: "20px",
    borderRadius: "8px",
    borderLeft: "4px solid #F59E0B",
    margin: "24px 0",
  },
  iconColumn: {
    width: "50px",
    verticalAlign: "top" as const,
  },
  calendarIcon: {
    fontSize: "32px",
    margin: "0",
  },
  contentColumn: {
    verticalAlign: "top" as const,
  },
  importantLabel: {
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color: "#92400E",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  importantDate: {
    fontSize: "20px",
    fontWeight: "700" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "4px 0 8px 0",
  },
  importantNote: {
    fontSize: "14px",
    color: "#92400E",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  timeline: {
    margin: "24px 0",
    paddingLeft: "8px",
  },
  timelineItem: {
    marginBottom: "16px",
  },
  timelineDotColumn: {
    width: "24px",
    verticalAlign: "top" as const,
  },
  timelineDot: {
    fontSize: "12px",
    color: BRAND.primary,
    fontFamily: BRAND.fontFamily,
    margin: "4px 0 0 0",
  },
  timelineDotFaded: {
    fontSize: "12px",
    color: "#D1D5DB",
    fontFamily: BRAND.fontFamily,
    margin: "4px 0 0 0",
  },
  timelineContent: {
    verticalAlign: "top" as const,
    paddingLeft: "8px",
  },
  timelineTitle: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 4px 0",
  },
  timelineDescription: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  resubscribeBox: {
    backgroundColor: BRAND.secondary,
    padding: "24px",
    borderRadius: "8px",
    margin: "32px 0",
    textAlign: "center" as const,
  },
  resubscribeTitle: {
    fontSize: "18px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  resubscribeText: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 16px 0",
  },
  ctaSection: {
    textAlign: "center" as const,
    margin: "0",
  },
  feedbackSection: {
    backgroundColor: "#F9FAFB",
    padding: "20px",
    borderRadius: "8px",
    margin: "24px 0",
  },
  feedbackTitle: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  feedbackText: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 12px 0",
  },
  feedbackLink: {
    fontSize: "14px",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  link: {
    color: BRAND.primary,
    textDecoration: "underline",
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

export default SubscriptionCancelledEmail;
