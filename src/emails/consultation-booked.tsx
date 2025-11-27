import { Text, Section, Row, Column, Link } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";
import { EmailButton } from "./components/email-button";

interface ConsultationBookedEmailProps {
  userName: string;
  consultationTitle: string;
  dateTime: string; // Formatted date and time string
  duration: string; // e.g., "30 minutes"
  meetingLink?: string;
  timezone: string;
  preparationNotes?: string[];
  rescheduleUrl?: string;
  cancelUrl?: string;
  // Calendar link URLs (generated externally)
  googleCalendarUrl?: string;
  outlookCalendarUrl?: string;
}

export function ConsultationBookedEmail({
  userName,
  consultationTitle,
  dateTime,
  duration,
  meetingLink,
  timezone,
  preparationNotes,
  rescheduleUrl = "https://freddybeach.com/dashboard/consultations",
  cancelUrl = "https://freddybeach.com/dashboard/consultations",
  googleCalendarUrl,
  outlookCalendarUrl,
}: ConsultationBookedEmailProps) {
  const firstName = userName.split(" ")[0];

  const defaultPreparationNotes = [
    "Review any questions or topics you'd like to discuss",
    "Have your business information readily available",
    "Test your microphone and camera before the call",
    "Join from a quiet location with stable internet",
  ];

  const notes = preparationNotes || defaultPreparationNotes;

  return (
    <EmailLayout preview={`Your consultation is confirmed for ${dateTime}`}>
      {/* Success Banner */}
      <Section style={styles.successBanner}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successText}>Booking Confirmed</Text>
      </Section>

      <EmailHeading as="h1">Consultation Scheduled</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        Your consultation has been successfully booked. We&apos;re looking
        forward to speaking with you!
      </Text>

      {/* Consultation Details */}
      <Section style={styles.detailsBox}>
        <Text style={styles.consultationTitle}>{consultationTitle}</Text>

        <Row style={styles.detailRow}>
          <Column style={styles.detailIconColumn}>
            <Text style={styles.detailIcon}>📅</Text>
          </Column>
          <Column style={styles.detailTextColumn}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>{dateTime}</Text>
            <Text style={styles.detailSubtext}>{timezone}</Text>
          </Column>
        </Row>

        <Row style={styles.detailRow}>
          <Column style={styles.detailIconColumn}>
            <Text style={styles.detailIcon}>⏱️</Text>
          </Column>
          <Column style={styles.detailTextColumn}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{duration}</Text>
          </Column>
        </Row>

        {meetingLink && (
          <Row style={styles.detailRow}>
            <Column style={styles.detailIconColumn}>
              <Text style={styles.detailIcon}>🔗</Text>
            </Column>
            <Column style={styles.detailTextColumn}>
              <Text style={styles.detailLabel}>Meeting Link</Text>
              <Link href={meetingLink} style={styles.meetingLink}>
                Join Video Call →
              </Link>
            </Column>
          </Row>
        )}
      </Section>

      {/* Add to Calendar */}
      <Section style={styles.calendarSection}>
        <Text style={styles.calendarTitle}>Add to Calendar</Text>
        <Row style={styles.calendarButtonsRow}>
          {googleCalendarUrl && (
            <Column style={styles.calendarButtonColumn}>
              <Link href={googleCalendarUrl} style={styles.calendarButton}>
                Google Calendar
              </Link>
            </Column>
          )}
          {outlookCalendarUrl && (
            <Column style={styles.calendarButtonColumn}>
              <Link href={outlookCalendarUrl} style={styles.calendarButton}>
                Outlook
              </Link>
            </Column>
          )}
        </Row>
        <Text style={styles.calendarNote}>
          An ICS calendar file is also attached to this email.
        </Text>
      </Section>

      {/* Preparation Notes */}
      <EmailHeading as="h2">How to Prepare</EmailHeading>

      <Section style={styles.preparationSection}>
        {notes.map((note, index) => (
          <Row key={index} style={styles.preparationRow}>
            <Column style={styles.preparationCheckColumn}>
              <Text style={styles.preparationCheck}>☐</Text>
            </Column>
            <Column style={styles.preparationTextColumn}>
              <Text style={styles.preparationText}>{note}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* Join Meeting CTA */}
      {meetingLink && (
        <Section style={styles.ctaSection}>
          <EmailButton href={meetingLink}>Join Video Call</EmailButton>
          <Text style={styles.ctaNote}>
            This link will be active at your scheduled time.
          </Text>
        </Section>
      )}

      {/* Reschedule/Cancel */}
      <Section style={styles.actionsSection}>
        <Text style={styles.actionsTitle}>Need to make changes?</Text>
        <Text style={styles.actionsText}>
          <Link href={rescheduleUrl} style={styles.link}>
            Reschedule
          </Link>
          <Text style={styles.actionsDivider}> | </Text>
          <Link href={cancelUrl} style={styles.link}>
            Cancel
          </Link>
        </Text>
        <Text style={styles.actionsNote}>
          Please provide at least 24 hours notice if you need to reschedule or
          cancel.
        </Text>
      </Section>

      <Text style={styles.closing}>
        If you have any questions before your consultation, feel free to reach
        out to{" "}
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
  consultationTitle: {
    fontSize: "20px",
    fontWeight: "700" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 20px 0",
    textAlign: "center" as const,
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
  meetingLink: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: BRAND.primary,
    fontFamily: BRAND.fontFamily,
    textDecoration: "underline",
    margin: "4px 0 0 0",
    display: "block",
  },
  calendarSection: {
    backgroundColor: "#F9FAFB",
    padding: "20px",
    borderRadius: "8px",
    margin: "24px 0",
    textAlign: "center" as const,
  },
  calendarTitle: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 12px 0",
  },
  calendarButtonsRow: {
    textAlign: "center" as const,
  },
  calendarButtonColumn: {
    display: "inline-block",
    padding: "0 8px",
  },
  calendarButton: {
    fontSize: "14px",
    fontWeight: "500" as const,
    color: BRAND.primary,
    fontFamily: BRAND.fontFamily,
    textDecoration: "none",
    padding: "8px 16px",
    border: `1px solid ${BRAND.primary}`,
    borderRadius: "6px",
    display: "inline-block",
  },
  calendarNote: {
    fontSize: "12px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "12px 0 0 0",
  },
  preparationSection: {
    margin: "16px 0 24px 0",
    backgroundColor: "#F9FAFB",
    padding: "20px",
    borderRadius: "8px",
  },
  preparationRow: {
    marginBottom: "12px",
  },
  preparationCheckColumn: {
    width: "28px",
    verticalAlign: "top" as const,
  },
  preparationCheck: {
    fontSize: "16px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  preparationTextColumn: {
    verticalAlign: "top" as const,
  },
  preparationText: {
    fontSize: "14px",
    lineHeight: "22px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  ctaNote: {
    fontSize: "12px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "12px 0 0 0",
    textAlign: "center" as const,
  },
  actionsSection: {
    backgroundColor: "#F9FAFB",
    padding: "20px",
    borderRadius: "8px",
    margin: "24px 0",
    textAlign: "center" as const,
  },
  actionsTitle: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  actionsText: {
    fontSize: "14px",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  actionsDivider: {
    color: "#D1D5DB",
    display: "inline",
  },
  link: {
    color: BRAND.primary,
    textDecoration: "underline",
  },
  actionsNote: {
    fontSize: "12px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "8px 0 0 0",
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

export default ConsultationBookedEmail;


/**
 * Generate an ICS calendar file content for a consultation
 */
export function generateConsultationICS(params: {
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  meetingLink?: string;
  location?: string;
  organizerEmail?: string;
  attendeeEmail: string;
}): string {
  const {
    title,
    startDate,
    endDate,
    description,
    meetingLink,
    location,
    organizerEmail = "noreply@freddybeach.com",
    attendeeEmail,
  } = params;

  // Format date to ICS format: 20240115T140000Z
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  // Escape special characters for ICS
  const escapeICS = (text: string): string => {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;")
      .replace(/\n/g, "\\n");
  };

  // Generate a unique ID for the event
  const uid = `${Date.now()}-${Math.random().toString(36).substring(2)}@freddybeach.com`;

  const locationLine = meetingLink
    ? `LOCATION:${escapeICS(meetingLink)}`
    : location
    ? `LOCATION:${escapeICS(location)}`
    : "";

  const descriptionWithLink = meetingLink
    ? `${description}\n\nJoin video call: ${meetingLink}`
    : description;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FreddyBeach//Consultation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(descriptionWithLink)}`,
    locationLine,
    `ORGANIZER;CN=FreddyBeach:mailto:${organizerEmail}`,
    `ATTENDEE;CN=${attendeeEmail};RSVP=TRUE:mailto:${attendeeEmail}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Your FreddyBeach consultation starts in 15 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return icsContent;
}
