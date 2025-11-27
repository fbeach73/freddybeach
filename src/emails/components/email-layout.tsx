import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Preview,
} from "@react-email/components";
import * as React from "react";
import { EmailFooter } from "./email-footer";

// Brand colors from implementation plan
const BRAND = {
  primary: "#B85C38",
  secondary: "#E8D5B7",
  background: "#FAFAFA",
  text: "#1A1A1A",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

interface EmailLayoutProps {
  preview?: string;
  children: React.ReactNode;
  showUnsubscribe?: boolean;
}

export function EmailLayout({
  preview,
  children,
  showUnsubscribe = false,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Img
              src="https://freddybeach.com/logo.png"
              alt="FreddyBeach"
              width={180}
              height={40}
              style={styles.logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={styles.main}>{children}</Section>

          {/* Footer */}
          <EmailFooter showUnsubscribe={showUnsubscribe} />
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: BRAND.background,
    fontFamily: BRAND.fontFamily,
    margin: "0",
    padding: "0",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: "24px",
    textAlign: "center" as const,
    borderRadius: "8px 8px 0 0",
    borderBottom: `3px solid ${BRAND.primary}`,
  },
  logo: {
    margin: "0 auto",
  },
  main: {
    backgroundColor: "#FFFFFF",
    padding: "32px 24px",
  },
} as const;

export { BRAND };
