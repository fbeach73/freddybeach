import { Text, Section, Row, Column, Hr } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";
import { EmailButton } from "./components/email-button";

// TODO: Define the actual stats data structure based on analytics schema
interface WeeklyStatsEmailProps {
  // Business owner info
  ownerName: string;
  businessName: string;
  businessSlug: string;
  // Date range
  weekStartDate: string; // ISO date string
  weekEndDate: string; // ISO date string
  // Stats data
  stats: {
    totalViews: number;
    viewsChange: number; // percentage change from previous week
    totalClicks: number;
    clicksChange: number;
    phoneClicks: number;
    websiteClicks: number;
    directionsClicks: number;
    newReviews: number;
    averageRating: number;
    totalReviews: number;
  };
  // Top search terms (optional)
  topSearchTerms?: string[];
}

// TODO: Helper to format percentage changes with up/down indicator
function formatChange(change: number): string {
  if (change > 0) return `+${change}%`;
  if (change < 0) return `${change}%`;
  return "0%";
}

// TODO: Helper to get change color
function getChangeColor(change: number): string {
  if (change > 0) return "#22C55E";
  if (change < 0) return "#EF4444";
  return "#6B7280";
}

export function WeeklyStatsEmail({
  ownerName,
  businessName,
  businessSlug,
  weekStartDate,
  weekEndDate,
  stats,
  topSearchTerms,
}: WeeklyStatsEmailProps) {
  const firstName = ownerName.split(" ")[0];
  const dashboardUrl = `https://freddybeach.com/dashboard/business/${businessSlug}/analytics`;

  // TODO: Format dates properly
  const formattedStartDate = new Date(weekStartDate).toLocaleDateString(
    "en-CA",
    {
      month: "short",
      day: "numeric",
    }
  );
  const formattedEndDate = new Date(weekEndDate).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <EmailLayout
      preview={`Your weekly stats for ${businessName} - ${stats.totalViews} views this week`}
      showUnsubscribe={true}
    >
      <EmailHeading as="h1">Your Weekly Business Report</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        Here&apos;s how <strong>{businessName}</strong> performed on FreddyBeach from{" "}
        {formattedStartDate} to {formattedEndDate}.
      </Text>

      {/* Main Stats Grid */}
      <Section style={styles.statsGrid}>
        <Row>
          <Column style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalViews}</Text>
            <Text style={styles.statLabel}>Profile Views</Text>
            <Text
              style={{
                ...styles.statChange,
                color: getChangeColor(stats.viewsChange),
              }}
            >
              {formatChange(stats.viewsChange)} vs last week
            </Text>
          </Column>
          <Column style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalClicks}</Text>
            <Text style={styles.statLabel}>Total Clicks</Text>
            <Text
              style={{
                ...styles.statChange,
                color: getChangeColor(stats.clicksChange),
              }}
            >
              {formatChange(stats.clicksChange)} vs last week
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Click Breakdown */}
      <Section style={styles.breakdownSection}>
        <Text style={styles.breakdownTitle}>Click Breakdown</Text>
        <Row style={styles.breakdownRow}>
          <Column style={styles.breakdownLabel}>
            <Text style={styles.breakdownLabelText}>Phone Calls</Text>
          </Column>
          <Column style={styles.breakdownValue}>
            <Text style={styles.breakdownValueText}>{stats.phoneClicks}</Text>
          </Column>
        </Row>
        <Row style={styles.breakdownRow}>
          <Column style={styles.breakdownLabel}>
            <Text style={styles.breakdownLabelText}>Website Visits</Text>
          </Column>
          <Column style={styles.breakdownValue}>
            <Text style={styles.breakdownValueText}>{stats.websiteClicks}</Text>
          </Column>
        </Row>
        <Row style={styles.breakdownRow}>
          <Column style={styles.breakdownLabel}>
            <Text style={styles.breakdownLabelText}>Get Directions</Text>
          </Column>
          <Column style={styles.breakdownValue}>
            <Text style={styles.breakdownValueText}>
              {stats.directionsClicks}
            </Text>
          </Column>
        </Row>
      </Section>

      <Hr style={styles.divider} />

      {/* Reviews Summary */}
      <Section style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Reviews This Week</Text>
        <Row>
          <Column style={styles.reviewStat}>
            <Text style={styles.reviewStatValue}>{stats.newReviews}</Text>
            <Text style={styles.reviewStatLabel}>New Reviews</Text>
          </Column>
          <Column style={styles.reviewStat}>
            <Text style={styles.reviewStatValue}>
              {stats.averageRating.toFixed(1)}
            </Text>
            <Text style={styles.reviewStatLabel}>Avg Rating</Text>
          </Column>
          <Column style={styles.reviewStat}>
            <Text style={styles.reviewStatValue}>{stats.totalReviews}</Text>
            <Text style={styles.reviewStatLabel}>Total Reviews</Text>
          </Column>
        </Row>
      </Section>

      {/* Top Search Terms (if available) */}
      {topSearchTerms && topSearchTerms.length > 0 && (
        <Section style={styles.searchTermsSection}>
          <Text style={styles.sectionTitle}>Top Search Terms</Text>
          <Text style={styles.searchTermsNote}>
            People found you by searching for:
          </Text>
          <Text style={styles.searchTermsList}>
            {topSearchTerms.map((term, index) => (
              <span key={index}>
                {term}
                {index < topSearchTerms.length - 1 && " • "}
              </span>
            ))}
          </Text>
        </Section>
      )}

      {/* CTA */}
      <Section style={styles.ctaSection}>
        <EmailButton href={dashboardUrl}>View Full Analytics</EmailButton>
      </Section>

      {/* Tips Section */}
      <Section style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Tips to Improve</Text>
        {/* TODO: Generate dynamic tips based on stats performance */}
        <Text style={styles.tipItem}>
          • Add more photos to increase engagement
        </Text>
        <Text style={styles.tipItem}>
          • Respond to reviews to show you care
        </Text>
        <Text style={styles.tipItem}>
          • Keep your hours up-to-date for accuracy
        </Text>
      </Section>

      <Text style={styles.signature}>— The FreddyBeach Team</Text>

      <Text style={styles.footerNote}>
        You&apos;re receiving this because you own or manage {businessName} on
        FreddyBeach. You can{" "}
        <a
          href={`https://freddybeach.com/dashboard/settings/notifications`}
          style={styles.link}
        >
          adjust your email preferences
        </a>{" "}
        at any time.
      </Text>
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
  statsGrid: {
    margin: "24px 0",
  },
  statCard: {
    backgroundColor: "#F9FAFB",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center" as const,
    width: "48%",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "700" as const,
    color: BRAND.primary,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 4px 0",
  },
  statLabel: {
    fontSize: "14px",
    fontWeight: "500" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  statChange: {
    fontSize: "12px",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  breakdownSection: {
    backgroundColor: "#FFFFFF",
    padding: "16px 0",
    margin: "16px 0",
  },
  breakdownTitle: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 12px 0",
  },
  breakdownRow: {
    marginBottom: "8px",
  },
  breakdownLabel: {
    width: "70%",
  },
  breakdownLabelText: {
    fontSize: "14px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  breakdownValue: {
    width: "30%",
    textAlign: "right" as const,
  },
  breakdownValueText: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  divider: {
    borderColor: "#E5E7EB",
    margin: "24px 0",
  },
  reviewsSection: {
    margin: "24px 0",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 16px 0",
  },
  reviewStat: {
    textAlign: "center" as const,
    width: "33%",
  },
  reviewStatValue: {
    fontSize: "24px",
    fontWeight: "700" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 4px 0",
  },
  reviewStatLabel: {
    fontSize: "12px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  searchTermsSection: {
    backgroundColor: "#F3F4F6",
    padding: "16px",
    borderRadius: "8px",
    margin: "24px 0",
  },
  searchTermsNote: {
    fontSize: "14px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  searchTermsList: {
    fontSize: "14px",
    fontWeight: "500" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  tipsSection: {
    backgroundColor: "#FFFBEB",
    padding: "16px",
    borderRadius: "8px",
    borderLeft: `3px solid #F59E0B`,
    margin: "24px 0",
  },
  tipsTitle: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 8px 0",
  },
  tipItem: {
    fontSize: "14px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "4px 0",
  },
  signature: {
    fontSize: "16px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "24px 0 16px 0",
  },
  footerNote: {
    fontSize: "12px",
    color: "#9CA3AF",
    fontFamily: BRAND.fontFamily,
    margin: "0",
    lineHeight: "20px",
  },
  link: {
    color: BRAND.primary,
    textDecoration: "underline",
  },
} as const;

export default WeeklyStatsEmail;
