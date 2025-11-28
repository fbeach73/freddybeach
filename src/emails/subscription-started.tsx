import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";
import { EmailButton } from "./components/email-button";
import { formatCurrency } from "@/lib/utils/format";

interface SubscriptionFeature {
  name: string;
  description?: string;
}

interface SubscriptionStartedEmailProps {
  userName: string;
  tierName: string;
  features: SubscriptionFeature[];
  billingAmount: number;
  billingFrequency: "monthly" | "yearly";
  nextBillingDate: string;
  manageSubscriptionUrl?: string;
}

export function SubscriptionStartedEmail({
  userName,
  tierName,
  features,
  billingAmount,
  billingFrequency,
  nextBillingDate,
  manageSubscriptionUrl = "https://freddybeach.com/dashboard/billing",
}: SubscriptionStartedEmailProps) {
  const firstName = userName.split(" ")[0];

  const frequencyLabel = billingFrequency === "monthly" ? "/month" : "/year";

  return (
    <EmailLayout
      preview={`Welcome to ${tierName}! Your subscription is now active`}
      showUnsubscribe
    >
      <Section style={styles.welcomeBanner}>
        <Text style={styles.welcomeEmoji}>🎉</Text>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.tierName}>{tierName}</Text>
      </Section>

      <EmailHeading as="h1">Your Subscription is Active!</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        Thank you for subscribing to <strong>{tierName}</strong>! Your
        subscription is now active and you have full access to all the features
        included in your plan.
      </Text>

      {/* Subscription Details */}
      <Section style={styles.detailsBox}>
        <Text style={styles.detailsTitle}>Subscription Details</Text>

        <Row style={styles.detailRow}>
          <Column style={styles.detailLabelColumn}>
            <Text style={styles.detailLabel}>Plan</Text>
          </Column>
          <Column style={styles.detailValueColumn}>
            <Text style={styles.detailValue}>{tierName}</Text>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.detailLabelColumn}>
            <Text style={styles.detailLabel}>Amount</Text>
          </Column>
          <Column style={styles.detailValueColumn}>
            <Text style={styles.detailValue}>
              {formatCurrency(billingAmount, { showCents: true })}
              {frequencyLabel}
            </Text>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.detailLabelColumn}>
            <Text style={styles.detailLabel}>Next billing date</Text>
          </Column>
          <Column style={styles.detailValueColumn}>
            <Text style={styles.detailValue}>{nextBillingDate}</Text>
          </Column>
        </Row>
      </Section>

      {/* Features */}
      <EmailHeading as="h2">What&apos;s Included</EmailHeading>

      <Section style={styles.featuresSection}>
        {features.map((feature, index) => (
          <Row key={index} style={styles.featureRow}>
            <Column style={styles.featureCheckColumn}>
              <Text style={styles.featureCheck}>✓</Text>
            </Column>
            <Column style={styles.featureTextColumn}>
              <Text style={styles.featureName}>{feature.name}</Text>
              {feature.description && (
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              )}
            </Column>
          </Row>
        ))}
      </Section>

      <Section style={styles.ctaSection}>
        <EmailButton href={manageSubscriptionUrl}>
          Manage Subscription
        </EmailButton>
      </Section>

      <Section style={styles.helpSection}>
        <Text style={styles.helpText}>
          Have questions about your subscription? Contact us at{" "}
          <a href="mailto:support@freddybeach.com" style={styles.link}>
            support@freddybeach.com
          </a>{" "}
          and we&apos;ll be happy to help.
        </Text>
      </Section>

      <Text style={styles.signature}>— The FreddyBeach Team</Text>
    </EmailLayout>
  );
}

const styles = {
  welcomeBanner: {
    textAlign: "center" as const,
    padding: "24px",
    backgroundColor: BRAND.secondary,
    borderRadius: "8px",
    marginBottom: "24px",
  },
  welcomeEmoji: {
    fontSize: "48px",
    margin: "0 0 8px 0",
  },
  welcomeText: {
    fontSize: "14px",
    color: "#666666",
    fontFamily: BRAND.fontFamily,
    margin: "0",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
  },
  tierName: {
    fontSize: "28px",
    fontWeight: "700" as const,
    color: BRAND.primary,
    fontFamily: BRAND.fontFamily,
    margin: "4px 0 0 0",
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
  detailsBox: {
    backgroundColor: "#F9FAFB",
    padding: "20px",
    borderRadius: "8px",
    borderLeft: `4px solid ${BRAND.primary}`,
    margin: "24px 0",
  },
  detailsTitle: {
    fontSize: "14px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color: BRAND.primary,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 16px 0",
  },
  detailRow: {
    marginBottom: "12px",
  },
  detailLabelColumn: {
    width: "40%",
    verticalAlign: "top" as const,
  },
  detailValueColumn: {
    width: "60%",
    verticalAlign: "top" as const,
  },
  detailLabel: {
    fontSize: "14px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  detailValue: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  featuresSection: {
    margin: "16px 0 24px 0",
  },
  featureRow: {
    marginBottom: "12px",
  },
  featureCheckColumn: {
    width: "30px",
    verticalAlign: "top" as const,
  },
  featureCheck: {
    fontSize: "16px",
    fontWeight: "700" as const,
    color: "#22C55E",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  featureTextColumn: {
    verticalAlign: "top" as const,
  },
  featureName: {
    fontSize: "16px",
    fontWeight: "500" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  featureDescription: {
    fontSize: "14px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "2px 0 0 0",
  },
  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  helpSection: {
    marginTop: "24px",
    padding: "16px",
    backgroundColor: "#F9FAFB",
    borderRadius: "8px",
  },
  helpText: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
    textAlign: "center" as const,
  },
  link: {
    color: BRAND.primary,
    textDecoration: "underline",
  },
  signature: {
    fontSize: "16px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "24px 0 0 0",
  },
} as const;

export default SubscriptionStartedEmail;
