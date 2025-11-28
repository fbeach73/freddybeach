import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";
import { EmailButton } from "./components/email-button";
import { formatCurrency } from "@/lib/utils/format";

interface PaymentFailedEmailProps {
  userName: string;
  tierName: string;
  billingAmount: number;
  paymentMethodLast4?: string;
  paymentMethodBrand?: string;
  serviceInterruptionDate: string;
  updatePaymentUrl?: string;
}

export function PaymentFailedEmail({
  userName,
  tierName,
  billingAmount,
  paymentMethodLast4,
  paymentMethodBrand = "Card",
  serviceInterruptionDate,
  updatePaymentUrl = "https://freddybeach.com/dashboard/billing",
}: PaymentFailedEmailProps) {
  const firstName = userName.split(" ")[0];

  return (
    <EmailLayout preview="Action required: Your payment failed">
      {/* Alert Banner */}
      <Section style={styles.alertBanner}>
        <Text style={styles.alertIcon}>⚠️</Text>
        <Text style={styles.alertText}>Action Required</Text>
      </Section>

      <EmailHeading as="h1">Payment Failed</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        We were unable to process your payment for your{" "}
        <strong>{tierName}</strong> subscription. Don&apos;t worry &ndash; your
        subscription is still active, but we need you to update your payment
        method to avoid any interruption in service.
      </Text>

      {/* Payment Details */}
      <Section style={styles.detailsBox}>
        <Text style={styles.detailsTitle}>Payment Details</Text>

        <Row style={styles.detailRow}>
          <Column style={styles.detailLabelColumn}>
            <Text style={styles.detailLabel}>Amount due</Text>
          </Column>
          <Column style={styles.detailValueColumn}>
            <Text style={styles.detailValue}>
              {formatCurrency(billingAmount, { showCents: true })}
            </Text>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.detailLabelColumn}>
            <Text style={styles.detailLabel}>Subscription</Text>
          </Column>
          <Column style={styles.detailValueColumn}>
            <Text style={styles.detailValue}>{tierName}</Text>
          </Column>
        </Row>

        {paymentMethodLast4 && (
          <Row style={styles.detailRow}>
            <Column style={styles.detailLabelColumn}>
              <Text style={styles.detailLabel}>Payment method</Text>
            </Column>
            <Column style={styles.detailValueColumn}>
              <Text style={styles.detailValueFailed}>
                {paymentMethodBrand} ending in {paymentMethodLast4} (failed)
              </Text>
            </Column>
          </Row>
        )}
      </Section>

      {/* Deadline Warning */}
      <Section style={styles.deadlineBox}>
        <Row>
          <Column style={styles.deadlineIconColumn}>
            <Text style={styles.deadlineIcon}>🕐</Text>
          </Column>
          <Column style={styles.deadlineContentColumn}>
            <Text style={styles.deadlineTitle}>Service Interruption Warning</Text>
            <Text style={styles.deadlineText}>
              If your payment is not updated by{" "}
              <strong>{serviceInterruptionDate}</strong>, your subscription will
              be paused and you&apos;ll lose access to {tierName} features.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* CTA */}
      <Section style={styles.ctaSection}>
        <EmailButton href={updatePaymentUrl}>Update Payment Method</EmailButton>
      </Section>

      {/* Common Reasons */}
      <EmailHeading as="h2">Common Reasons for Failed Payments</EmailHeading>

      <Section style={styles.reasonsSection}>
        <Row style={styles.reasonRow}>
          <Column style={styles.reasonBulletColumn}>
            <Text style={styles.reasonBullet}>•</Text>
          </Column>
          <Column style={styles.reasonTextColumn}>
            <Text style={styles.reasonText}>
              <strong>Expired card:</strong> Your card may have expired. Check
              the expiration date and update if needed.
            </Text>
          </Column>
        </Row>

        <Row style={styles.reasonRow}>
          <Column style={styles.reasonBulletColumn}>
            <Text style={styles.reasonBullet}>•</Text>
          </Column>
          <Column style={styles.reasonTextColumn}>
            <Text style={styles.reasonText}>
              <strong>Insufficient funds:</strong> Ensure your account has
              sufficient balance for the charge.
            </Text>
          </Column>
        </Row>

        <Row style={styles.reasonRow}>
          <Column style={styles.reasonBulletColumn}>
            <Text style={styles.reasonBullet}>•</Text>
          </Column>
          <Column style={styles.reasonTextColumn}>
            <Text style={styles.reasonText}>
              <strong>Card declined:</strong> Your bank may have declined the
              transaction. Contact them to authorize charges from FreddyBeach.
            </Text>
          </Column>
        </Row>

        <Row style={styles.reasonRow}>
          <Column style={styles.reasonBulletColumn}>
            <Text style={styles.reasonBullet}>•</Text>
          </Column>
          <Column style={styles.reasonTextColumn}>
            <Text style={styles.reasonText}>
              <strong>New card number:</strong> If you received a replacement
              card, please update your payment information.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Support */}
      <Section style={styles.supportSection}>
        <Text style={styles.supportTitle}>Need Help?</Text>
        <Text style={styles.supportText}>
          If you&apos;re having trouble updating your payment method or have
          questions about your account, our support team is here to help.
        </Text>
        <Text style={styles.supportLink}>
          <a href="mailto:support@freddybeach.com" style={styles.link}>
            Contact support@freddybeach.com
          </a>
        </Text>
      </Section>

      <Text style={styles.signature}>— The FreddyBeach Team</Text>
    </EmailLayout>
  );
}

const styles = {
  alertBanner: {
    textAlign: "center" as const,
    padding: "16px",
    backgroundColor: "#FEF2F2",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  alertIcon: {
    fontSize: "32px",
    margin: "0 0 4px 0",
  },
  alertText: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#DC2626",
    fontFamily: BRAND.fontFamily,
    margin: "0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
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
    margin: "24px 0",
  },
  detailsTitle: {
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 16px 0",
  },
  detailRow: {
    marginBottom: "8px",
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
  detailValueFailed: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#DC2626",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  deadlineBox: {
    backgroundColor: "#FEF3C7",
    padding: "20px",
    borderRadius: "8px",
    borderLeft: "4px solid #F59E0B",
    margin: "24px 0",
  },
  deadlineIconColumn: {
    width: "50px",
    verticalAlign: "top" as const,
  },
  deadlineIcon: {
    fontSize: "28px",
    margin: "0",
  },
  deadlineContentColumn: {
    verticalAlign: "top" as const,
  },
  deadlineTitle: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: "#92400E",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  deadlineText: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#92400E",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  reasonsSection: {
    margin: "16px 0 24px 0",
  },
  reasonRow: {
    marginBottom: "12px",
  },
  reasonBulletColumn: {
    width: "20px",
    verticalAlign: "top" as const,
  },
  reasonBullet: {
    fontSize: "16px",
    color: BRAND.primary,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  reasonTextColumn: {
    verticalAlign: "top" as const,
  },
  reasonText: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  supportSection: {
    backgroundColor: "#F9FAFB",
    padding: "20px",
    borderRadius: "8px",
    margin: "24px 0",
    textAlign: "center" as const,
  },
  supportTitle: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  supportText: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 12px 0",
  },
  supportLink: {
    fontSize: "14px",
    fontFamily: BRAND.fontFamily,
    margin: "0",
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

export default PaymentFailedEmail;
