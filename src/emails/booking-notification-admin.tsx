import { Text, Section, Row, Column, Hr } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";

interface BookingNotificationAdminProps {
  customerName: string;
  customerEmail: string;
  businessName: string;
  primaryNeed: string;
  challenge: string;
  submittedAt: string;
  selectedDateTime?: string;
}

export function BookingNotificationAdmin({
  customerName,
  customerEmail,
  businessName,
  primaryNeed,
  challenge,
  submittedAt,
  selectedDateTime,
}: BookingNotificationAdminProps) {
  return (
    <EmailLayout preview={`New booking request from ${customerName} at ${businessName}`}>
      {/* Alert Banner */}
      <Section style={styles.alertBanner}>
        <Text style={styles.alertIcon}>📬</Text>
        <Text style={styles.alertText}>New Consultation Request</Text>
      </Section>

      <EmailHeading as="h1">New Booking Request</EmailHeading>

      <Text style={styles.paragraph}>
        A new consultation request has been submitted through the website.
        Review the details below and follow up with the customer.
      </Text>

      {/* Customer Details */}
      <Section style={styles.detailsBox}>
        <Text style={styles.sectionTitle}>Customer Information</Text>

        <Row style={styles.detailRow}>
          <Column style={styles.labelColumn}>
            <Text style={styles.label}>Name</Text>
          </Column>
          <Column style={styles.valueColumn}>
            <Text style={styles.value}>{customerName}</Text>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.labelColumn}>
            <Text style={styles.label}>Email</Text>
          </Column>
          <Column style={styles.valueColumn}>
            <Text style={styles.valueLink}>
              <a href={`mailto:${customerEmail}`} style={styles.link}>
                {customerEmail}
              </a>
            </Text>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.labelColumn}>
            <Text style={styles.label}>Business</Text>
          </Column>
          <Column style={styles.valueColumn}>
            <Text style={styles.value}>{businessName}</Text>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.labelColumn}>
            <Text style={styles.label}>Primary Need</Text>
          </Column>
          <Column style={styles.valueColumn}>
            <Text style={styles.valueBadge}>{primaryNeed}</Text>
          </Column>
        </Row>

        {selectedDateTime && (
          <Row style={styles.detailRow}>
            <Column style={styles.labelColumn}>
              <Text style={styles.label}>Requested</Text>
            </Column>
            <Column style={styles.valueColumn}>
              <Text style={styles.valueHighlight}>{selectedDateTime}</Text>
            </Column>
          </Row>
        )}
      </Section>

      {/* Challenge Description */}
      <Section style={styles.challengeSection}>
        <Text style={styles.sectionTitle}>Challenge Description</Text>
        <Text style={styles.challengeText}>{challenge}</Text>
      </Section>

      <Hr style={styles.divider} />

      {/* Submission Info */}
      <Text style={styles.submissionInfo}>
        Submitted on {submittedAt}
      </Text>

      {/* Quick Actions */}
      <Section style={styles.actionsSection}>
        <Text style={styles.actionsTitle}>Quick Actions</Text>
        <Text style={styles.actionsText}>
          Reply directly to this email to contact {customerName.split(" ")[0]},
          or use the email address above.
        </Text>
      </Section>
    </EmailLayout>
  );
}

const styles = {
  alertBanner: {
    textAlign: "center" as const,
    padding: "16px",
    backgroundColor: "#EEF2FF",
    borderRadius: "8px",
    marginBottom: "24px",
  },
  alertIcon: {
    fontSize: "24px",
    margin: "0",
  },
  alertText: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#4338CA",
    fontFamily: BRAND.fontFamily,
    margin: "8px 0 0 0",
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "26px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 24px 0",
  },
  detailsBox: {
    backgroundColor: BRAND.secondary,
    padding: "24px",
    borderRadius: "8px",
    margin: "24px 0",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 16px 0",
  },
  detailRow: {
    marginBottom: "12px",
  },
  labelColumn: {
    width: "100px",
    verticalAlign: "top" as const,
  },
  label: {
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  valueColumn: {
    verticalAlign: "top" as const,
  },
  value: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  valueLink: {
    fontSize: "14px",
    fontWeight: "600" as const,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  link: {
    color: BRAND.primary,
    textDecoration: "underline",
  },
  valueBadge: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: BRAND.primary,
    fontFamily: BRAND.fontFamily,
    margin: "0",
    backgroundColor: "#EEF2FF",
    padding: "4px 12px",
    borderRadius: "4px",
    display: "inline-block",
  },
  valueHighlight: {
    fontSize: "14px",
    fontWeight: "700" as const,
    color: "#166534",
    fontFamily: BRAND.fontFamily,
    margin: "0",
    backgroundColor: "#DCFCE7",
    padding: "4px 12px",
    borderRadius: "4px",
    display: "inline-block",
  },
  challengeSection: {
    backgroundColor: "#FFFBEB",
    padding: "20px",
    borderRadius: "8px",
    margin: "24px 0",
    borderLeft: "4px solid #F59E0B",
  },
  challengeText: {
    fontSize: "14px",
    lineHeight: "22px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
    whiteSpace: "pre-wrap" as const,
  },
  divider: {
    borderColor: "#E5E7EB",
    margin: "24px 0",
  },
  submissionInfo: {
    fontSize: "12px",
    color: "#9CA3AF",
    fontFamily: BRAND.fontFamily,
    textAlign: "center" as const,
    margin: "0",
  },
  actionsSection: {
    backgroundColor: "#F0FDF4",
    padding: "16px",
    borderRadius: "8px",
    margin: "24px 0 0 0",
    textAlign: "center" as const,
  },
  actionsTitle: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#166534",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  actionsText: {
    fontSize: "13px",
    color: "#15803D",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
} as const;

export default BookingNotificationAdmin;
