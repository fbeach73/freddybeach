import { Section, Text, Link, Hr } from "@react-email/components";
import * as React from "react";
import { BRAND } from "./email-layout";

interface EmailFooterProps {
  showUnsubscribe?: boolean;
}

export function EmailFooter({ showUnsubscribe = false }: EmailFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <Section style={styles.footer}>
      <Hr style={styles.divider} />

      {/* Social Links */}
      <Text style={styles.socialLinks}>
        <Link href="https://freddybeach.com" style={styles.link}>
          Website
        </Link>
        {" | "}
        <Link href="https://facebook.com/freddybeach" style={styles.link}>
          Facebook
        </Link>
        {" | "}
        <Link href="https://instagram.com/freddybeach" style={styles.link}>
          Instagram
        </Link>
      </Text>

      {/* Copyright */}
      <Text style={styles.copyright}>
        &copy; {currentYear} FreddyBeach. All rights reserved.
      </Text>

      {/* Physical Address (CAN-SPAM compliance) */}
      <Text style={styles.address}>
        Fredericton, New Brunswick, Canada
      </Text>

      {/* Unsubscribe Link (conditional) */}
      {showUnsubscribe && (
        <Text style={styles.unsubscribe}>
          <Link
            href="https://freddybeach.com/unsubscribe"
            style={styles.unsubscribeLink}
          >
            Unsubscribe from marketing emails
          </Link>
        </Text>
      )}
    </Section>
  );
}

const styles = {
  footer: {
    backgroundColor: "#FFFFFF",
    padding: "24px",
    borderRadius: "0 0 8px 8px",
    textAlign: "center" as const,
  },
  divider: {
    borderColor: "#E5E5E5",
    borderWidth: "1px",
    margin: "0 0 20px 0",
  },
  socialLinks: {
    fontSize: "14px",
    color: "#666666",
    margin: "0 0 16px 0",
    fontFamily: BRAND.fontFamily,
  },
  link: {
    color: BRAND.primary,
    textDecoration: "none",
  },
  copyright: {
    fontSize: "12px",
    color: "#999999",
    margin: "0 0 8px 0",
    fontFamily: BRAND.fontFamily,
  },
  address: {
    fontSize: "12px",
    color: "#999999",
    margin: "0 0 8px 0",
    fontFamily: BRAND.fontFamily,
  },
  unsubscribe: {
    fontSize: "12px",
    color: "#999999",
    margin: "16px 0 0 0",
    fontFamily: BRAND.fontFamily,
  },
  unsubscribeLink: {
    color: "#999999",
    textDecoration: "underline",
  },
} as const;
