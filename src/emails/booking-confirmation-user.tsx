import { Text, Section, Row, Column, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";
import { EmailButton } from "./components/email-button";

interface BookingConfirmationUserProps {
  userName: string;
  businessName: string;
  selectedDateTime: string;
  preferredPackage: string;
  googleCalendarUrl: string;
}

export function BookingConfirmationUser({
  userName,
  businessName,
  selectedDateTime,
  preferredPackage,
  googleCalendarUrl,
}: BookingConfirmationUserProps) {
  const firstName = userName.split(" ")[0];

  return (
    <EmailLayout preview={`Your consultation request for ${selectedDateTime} has been received`}>
      {/* Success Banner */}
      <Section style={styles.successBanner}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successText}>Request Received</Text>
      </Section>

      <EmailHeading as="h1">Thank You for Your Request!</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        We&apos;ve received your consultation request and will be in touch within
        24 hours to confirm your booking.
      </Text>

      {/* Booking Details */}
      <Section style={styles.detailsBox}>
        <Text style={styles.sectionTitle}>Your Request Details</Text>

        <Row style={styles.detailRow}>
          <Column style={styles.detailIconColumn}>
            <Text style={styles.detailIcon}>📅</Text>
          </Column>
          <Column style={styles.detailTextColumn}>
            <Text style={styles.detailLabel}>Requested Time</Text>
            <Text style={styles.detailValue}>{selectedDateTime}</Text>
            <Text style={styles.detailSubtext}>Atlantic Time (AT)</Text>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.detailIconColumn}>
            <Text style={styles.detailIcon}>📦</Text>
          </Column>
          <Column style={styles.detailTextColumn}>
            <Text style={styles.detailLabel}>Package</Text>
            <Text style={styles.detailValue}>{preferredPackage}</Text>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.detailIconColumn}>
            <Text style={styles.detailIcon}>🏢</Text>
          </Column>
          <Column style={styles.detailTextColumn}>
            <Text style={styles.detailLabel}>Business</Text>
            <Text style={styles.detailValue}>{businessName}</Text>
          </Column>
        </Row>
      </Section>

      {/* Add to Calendar CTA */}
      <Section style={styles.calendarSection}>
        <Text style={styles.calendarTitle}>Save the Date</Text>
        <Text style={styles.calendarDescription}>
          Add this to your calendar so you don&apos;t forget!
        </Text>
        <EmailButton href={googleCalendarUrl}>Add to Google Calendar</EmailButton>
      </Section>

      {/* What's Next */}
      <Section style={styles.nextStepsSection}>
        <Text style={styles.nextStepsTitle}>What Happens Next?</Text>
        <Row style={styles.stepRow}>
          <Column style={styles.stepNumberColumn}>
            <Text style={styles.stepNumber}>1</Text>
          </Column>
          <Column style={styles.stepTextColumn}>
            <Text style={styles.stepText}>
              We&apos;ll review your request and confirm your consultation time
            </Text>
          </Column>
        </Row>
        <Row style={styles.stepRow}>
          <Column style={styles.stepNumberColumn}>
            <Text style={styles.stepNumber}>2</Text>
          </Column>
          <Column style={styles.stepTextColumn}>
            <Text style={styles.stepText}>
              You&apos;ll receive a calendar invite with the video meeting link
            </Text>
          </Column>
        </Row>
        <Row style={styles.stepRow}>
          <Column style={styles.stepNumberColumn}>
            <Text style={styles.stepNumber}>3</Text>
          </Column>
          <Column style={styles.stepTextColumn}>
            <Text style={styles.stepText}>
              We&apos;ll come prepared with insights tailored to your business
            </Text>
          </Column>
        </Row>
      </Section>

      <Text style={styles.closing}>
        If you have any questions before your consultation, feel free to reach
        out to{" "}
        <Link href="mailto:kyle@freddybeach.com" style={styles.link}>
          kyle@freddybeach.com
        </Link>
        .
      </Text>

      <Text style={styles.signature}>— Kyle & The FreddyBeach Team</Text>
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
    marginBottom: "16px",
  },
  detailIconColumn: {
    width: "40px",
    verticalAlign: "top" as const,
  },
  detailIcon: {
    fontSize: "20px",
    margin: "0",
  },
  detailTextColumn: {
    verticalAlign: "top" as const,
  },
  detailLabel: {
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  detailValue: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "4px 0 0 0",
  },
  detailSubtext: {
    fontSize: "14px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "2px 0 0 0",
  },
  calendarSection: {
    backgroundColor: "#EEF2FF",
    padding: "24px",
    borderRadius: "8px",
    margin: "24px 0",
    textAlign: "center" as const,
  },
  calendarTitle: {
    fontSize: "16px",
    fontWeight: "700" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  calendarDescription: {
    fontSize: "14px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 16px 0",
  },
  nextStepsSection: {
    backgroundColor: "#F9FAFB",
    padding: "20px",
    borderRadius: "8px",
    margin: "24px 0",
  },
  nextStepsTitle: {
    fontSize: "14px",
    fontWeight: "700" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 16px 0",
  },
  stepRow: {
    marginBottom: "12px",
  },
  stepNumberColumn: {
    width: "32px",
    verticalAlign: "top" as const,
  },
  stepNumber: {
    fontSize: "14px",
    fontWeight: "700" as const,
    color: "#FFFFFF",
    fontFamily: BRAND.fontFamily,
    margin: "0",
    backgroundColor: BRAND.primary,
    width: "24px",
    height: "24px",
    lineHeight: "24px",
    borderRadius: "50%",
    textAlign: "center" as const,
    display: "inline-block",
  },
  stepTextColumn: {
    verticalAlign: "top" as const,
  },
  stepText: {
    fontSize: "14px",
    lineHeight: "22px",
    color: BRAND.text,
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

export default BookingConfirmationUser;

/**
 * Generate a Google Calendar URL for adding an event
 */
export function generateGoogleCalendarUrl(params: {
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  location?: string;
}): string {
  const { title, startDate, endDate, description, location } = params;

  // Format date to Google Calendar format: 20240115T140000Z
  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const baseUrl = "https://calendar.google.com/calendar/render";
  const queryParams = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: description,
    ...(location && { location }),
  });

  return `${baseUrl}?${queryParams.toString()}`;
}
