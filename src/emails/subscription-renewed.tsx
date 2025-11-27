import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";
import { EmailButton } from "./components/email-button";

interface SubscriptionRenewedEmailProps {
  userName: string;
  tierName: string;
  billingAmount: number;
  billingFrequency: "monthly" | "yearly";
  nextBillingDate: string;
  receiptUrl?: string;
  billingSettingsUrl?: string;
}

export function SubscriptionRenewedEmail({
  userName,
  tierName,
  billingAmount,
  billingFrequency,
  nextBillingDate,
  receiptUrl,
  billingSettingsUrl = "https://freddybeach.com/dashboard/billing",
}: SubscriptionRenewedEmailProps) {
  const firstName = userName.split(" ")[0];
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);

  const frequencyLabel = billingFrequency === "monthly" ? "/month" : "/year";

  return (
    <EmailLayout
      preview={`Your ${tierName} subscription has been renewed`}
      showUnsubscribe
    >
      <Section style={styles.successBanner}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successText}>Payment Successful</Text>
      </Section>

      <EmailHeading as="h1">Subscription Renewed</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        Thank you for being a valued <strong>{tierName}</strong> member! Your
        subscription has been successfully renewed and your access continues
        uninterrupted.
      </Text>

      {/* Receipt Details */}
      <Section style={styles.receiptBox}>
        <Text style={styles.receiptTitle}>Receipt</Text>
        <Text style={styles.receiptDate}>{formattedDate}</Text>

        <Row style={styles.receiptRow}>
          <Column style={styles.receiptLabelColumn}>
            <Text style={styles.receiptLabel}>{tierName} Subscription</Text>
            <Text style={styles.receiptPeriod}>
              {billingFrequency === "monthly" ? "Monthly" : "Annual"} renewal
            </Text>
          </Column>
          <Column style={styles.receiptAmountColumn}>
            <Text style={styles.receiptAmount}>
              {formatCurrency(billingAmount)}
            </Text>
          </Column>
        </Row>

        <Row style={styles.totalRow}>
          <Column style={styles.receiptLabelColumn}>
            <Text style={styles.totalLabel}>Total Charged</Text>
          </Column>
          <Column style={styles.receiptAmountColumn}>
            <Text style={styles.totalAmount}>
              {formatCurrency(billingAmount)}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Next Billing */}
      <Section style={styles.nextBillingBox}>
        <Row>
          <Column style={styles.nextBillingLabelColumn}>
            <Text style={styles.nextBillingLabel}>Next billing date</Text>
            <Text style={styles.nextBillingDate}>{nextBillingDate}</Text>
          </Column>
          <Column style={styles.nextBillingAmountColumn}>
            <Text style={styles.nextBillingAmountLabel}>Amount</Text>
            <Text style={styles.nextBillingAmount}>
              {formatCurrency(billingAmount)}
              {frequencyLabel}
            </Text>
          </Column>
        </Row>
      </Section>

      <Section style={styles.ctaSection}>
        {receiptUrl && (
          <EmailButton href={receiptUrl}>View Full Receipt</EmailButton>
        )}
        <Text style={styles.billingLink}>
          <a href={billingSettingsUrl} style={styles.link}>
            Manage billing settings →
          </a>
        </Text>
      </Section>

      <Text style={styles.thankYou}>
        Thank you for your continued support. We&apos;re thrilled to have you as
        part of the FreddyBeach community!
      </Text>

      <Text style={styles.signature}>— The FreddyBeach Team</Text>
    </EmailLayout>
  );
}

const styles = {
  successBanner: {
    textAlign: "center" as const,
    padding: "16px",
    backgroundColor: "#ECFDF5",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  successIcon: {
    fontSize: "24px",
    fontWeight: "700" as const,
    color: "#22C55E",
    fontFamily: BRAND.fontFamily,
    margin: "0",
    display: "inline-block",
    width: "36px",
    height: "36px",
    lineHeight: "36px",
    backgroundColor: "#DCFCE7",
    borderRadius: "50%",
  },
  successText: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#166534",
    fontFamily: BRAND.fontFamily,
    margin: "8px 0 0 0",
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
  receiptBox: {
    backgroundColor: "#F9FAFB",
    padding: "20px",
    borderRadius: "8px",
    margin: "24px 0",
  },
  receiptTitle: {
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  receiptDate: {
    fontSize: "14px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "4px 0 16px 0",
  },
  receiptRow: {
    borderTop: "1px solid #E5E7EB",
    paddingTop: "12px",
    paddingBottom: "12px",
  },
  receiptLabelColumn: {
    width: "70%",
    verticalAlign: "top" as const,
  },
  receiptAmountColumn: {
    width: "30%",
    textAlign: "right" as const,
    verticalAlign: "top" as const,
  },
  receiptLabel: {
    fontSize: "16px",
    fontWeight: "500" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  receiptPeriod: {
    fontSize: "14px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "2px 0 0 0",
  },
  receiptAmount: {
    fontSize: "16px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  totalRow: {
    borderTop: "1px solid #E5E7EB",
    paddingTop: "12px",
  },
  totalLabel: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  totalAmount: {
    fontSize: "18px",
    fontWeight: "700" as const,
    color: BRAND.primary,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  nextBillingBox: {
    backgroundColor: BRAND.secondary,
    padding: "16px 20px",
    borderRadius: "8px",
    margin: "24px 0",
  },
  nextBillingLabelColumn: {
    width: "50%",
    verticalAlign: "top" as const,
  },
  nextBillingAmountColumn: {
    width: "50%",
    textAlign: "right" as const,
    verticalAlign: "top" as const,
  },
  nextBillingLabel: {
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  nextBillingDate: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "4px 0 0 0",
  },
  nextBillingAmountLabel: {
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
    textAlign: "right" as const,
  },
  nextBillingAmount: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "4px 0 0 0",
    textAlign: "right" as const,
  },
  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  billingLink: {
    fontSize: "14px",
    fontFamily: BRAND.fontFamily,
    margin: "16px 0 0 0",
    textAlign: "center" as const,
  },
  link: {
    color: BRAND.primary,
    textDecoration: "underline",
  },
  thankYou: {
    fontSize: "16px",
    lineHeight: "26px",
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

export default SubscriptionRenewedEmail;
