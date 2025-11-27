import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";
import { EmailButton } from "./components/email-button";

// TODO: Define the actual props interface based on review data structure
interface NewReviewEmailProps {
  // Business owner info
  ownerName: string;
  businessName: string;
  businessSlug: string;
  // Review details
  reviewerName: string;
  rating: number; // 1-5 stars
  reviewText: string;
  reviewDate: string; // ISO date string
}

// TODO: Implement star rating display component
function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= rating ? "#FBBF24" : "#D1D5DB" }}>
        {i <= rating ? "★" : "☆"}
      </span>
    );
  }
  return <span style={styles.starRating}>{stars}</span>;
}

export function NewReviewEmail({
  ownerName,
  businessName,
  businessSlug,
  reviewerName,
  rating,
  reviewText,
  reviewDate,
}: NewReviewEmailProps) {
  const firstName = ownerName.split(" ")[0];
  const dashboardUrl = `https://freddybeach.com/dashboard/business/${businessSlug}/reviews`;
  const replyUrl = `https://freddybeach.com/dashboard/business/${businessSlug}/reviews?respond=latest`;

  // TODO: Format the review date properly
  const formattedDate = new Date(reviewDate).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <EmailLayout preview={`New ${rating}-star review for ${businessName}`}>
      <EmailHeading as="h1">New Review Received</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        Great news! <strong>{businessName}</strong> just received a new review
        from a customer.
      </Text>

      {/* Review Card */}
      <Section style={styles.reviewCard}>
        <Row>
          <Column>
            <Text style={styles.reviewerName}>{reviewerName}</Text>
            <Text style={styles.reviewRating}>
              <StarRating rating={rating} />
              <span style={styles.ratingText}> ({rating}/5)</span>
            </Text>
          </Column>
        </Row>
        <Text style={styles.reviewText}>&ldquo;{reviewText}&rdquo;</Text>
        <Text style={styles.reviewDate}>{formattedDate}</Text>
      </Section>

      {/* CTA Buttons */}
      <Section style={styles.ctaSection}>
        <EmailButton href={replyUrl}>Respond to Review</EmailButton>
      </Section>

      <Text style={styles.tipText}>
        <strong>Tip:</strong> Responding to reviews shows customers you care and
        can improve your search ranking!
      </Text>

      {/* Quick Stats Placeholder */}
      {/* TODO: Add weekly/monthly review summary stats */}
      <Section style={styles.statsBox}>
        <Text style={styles.statsTitle}>Your Review Stats</Text>
        <Text style={styles.statsNote}>
          {/* TODO: Populate with actual stats from database */}
          View all your reviews and respond to customers in your dashboard.
        </Text>
        <Text style={styles.dashboardLink}>
          <a href={dashboardUrl} style={styles.link}>
            Go to Reviews Dashboard →
          </a>
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
  reviewCard: {
    backgroundColor: "#F9FAFB",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
    margin: "24px 0",
  },
  reviewerName: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 4px 0",
  },
  reviewRating: {
    fontSize: "18px",
    margin: "0 0 12px 0",
  },
  starRating: {
    letterSpacing: "2px",
  },
  ratingText: {
    fontSize: "14px",
    color: "#6B7280",
  },
  reviewText: {
    fontSize: "16px",
    lineHeight: "24px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    fontStyle: "italic" as const,
    margin: "12px 0",
    padding: "12px 16px",
    backgroundColor: "#FFFFFF",
    borderRadius: "4px",
    borderLeft: `3px solid ${BRAND.primary}`,
  },
  reviewDate: {
    fontSize: "12px",
    color: "#9CA3AF",
    fontFamily: BRAND.fontFamily,
    margin: "8px 0 0 0",
  },
  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  tipText: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    backgroundColor: "#FFFBEB",
    padding: "12px 16px",
    borderRadius: "6px",
    borderLeft: "3px solid #F59E0B",
    margin: "0 0 24px 0",
  },
  statsBox: {
    backgroundColor: "#F3F4F6",
    padding: "16px 20px",
    borderRadius: "8px",
    margin: "24px 0",
  },
  statsTitle: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  statsNote: {
    fontSize: "14px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  dashboardLink: {
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

export default NewReviewEmail;
