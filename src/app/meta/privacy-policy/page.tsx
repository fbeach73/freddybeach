import { Metadata } from "next"
import Link from "next/link"
import {
  LegalLayout,
  TableOfContents,
  LegalSectionContent,
  type LegalSection,
} from "@/components/legal"

export const metadata: Metadata = {
  title: "Privacy Policy | Freddybeach Optimal Ads",
  description:
    "Privacy Policy for Freddybeach Optimal Ads, the automated Meta ads bidding, scaling, pausing, and resuming tool.",
}

const sections: LegalSection[] = [
  { id: "overview", title: "Overview" },
  { id: "collection", title: "Information We Collect" },
  { id: "usage", title: "How We Use Your Information" },
  { id: "meta-platform", title: "Meta Platform Data" },
  { id: "sharing", title: "Information Sharing" },
  { id: "retention", title: "Data Retention" },
  { id: "security", title: "Data Security" },
  { id: "rights", title: "Your Rights & Data Deletion" },
  { id: "contact", title: "Contact Us" },
]

export default function MetaPrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy — Freddybeach Optimal Ads"
      lastUpdated="July 30, 2026"
      sections={sections}
      tocSlot={<TableOfContents sections={sections} />}
    >
      <LegalSectionContent id="overview" title="Overview">
        <p>
          Freddybeach Optimal Ads (&quot;the App&quot;, &quot;we&quot;,
          &quot;us&quot;) is an advertising automation tool operated by
          FreddyBeach.com that connects to the Meta (Facebook) Marketing API to
          automatically manage ad campaigns on your behalf — including
          automated bidding adjustments, budget scaling, and pausing or
          resuming ads based on performance rules you configure.
        </p>
        <p>
          This Privacy Policy explains what information the App collects, how
          it is used, and the choices you have. By using the App, you agree to
          the practices described here.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="collection" title="Information We Collect">
        <p>
          <strong>Account Information:</strong> Your name, email address, and
          authentication credentials when you create an account or connect the
          App.
        </p>
        <p>
          <strong>Meta Ad Account Data:</strong> When you connect your Meta ad
          account, we access — with your authorization — your ad account ID,
          campaign, ad set, and ad structures, budgets, bids, delivery status,
          and performance metrics (such as spend, impressions, clicks, and
          conversions).
        </p>
        <p>
          <strong>Automation Settings:</strong> The rules, thresholds,
          schedules, and preferences you configure for automated bidding,
          scaling, pausing, and resuming.
        </p>
        <p>
          <strong>Usage Data:</strong> Log data about your use of the App,
          including actions taken by the automation engine, timestamps, device
          and browser information, and IP address.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="usage" title="How We Use Your Information">
        <p>We use the information we collect solely to:</p>
        <ul>
          <li>
            <strong>Operate the App:</strong> Execute the automated bidding,
            budget scaling, and pause/resume actions you configure
          </li>
          <li>
            <strong>Display Performance:</strong> Show you campaign metrics,
            automation history, and reporting dashboards
          </li>
          <li>
            <strong>Send Notifications:</strong> Alert you about automation
            actions, account issues, or important service updates
          </li>
          <li>
            <strong>Improve the Service:</strong> Diagnose issues and improve
            reliability of the automation engine
          </li>
          <li>
            <strong>Comply with Law:</strong> Meet legal obligations and
            enforce our Terms of Service
          </li>
        </ul>
        <p>
          We do not sell your personal information or your advertising data to
          third parties.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="meta-platform" title="Meta Platform Data">
        <p>
          The App accesses Meta Platform Data only through official Meta APIs
          and only with the permissions you grant during the authorization
          flow (such as <code>ads_management</code> and{" "}
          <code>ads_read</code>). Our use of information received from Meta
          APIs adheres to the{" "}
          <a
            href="https://developers.facebook.com/terms/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meta Platform Terms
          </a>{" "}
          and{" "}
          <a
            href="https://developers.facebook.com/devpolicy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Developer Policies
          </a>
          .
        </p>
        <ul>
          <li>
            We only request the minimum permissions required to provide the
            automation features
          </li>
          <li>
            Access tokens are stored encrypted and are never shared with third
            parties
          </li>
          <li>
            You can revoke the App&apos;s access at any time from your{" "}
            <a
              href="https://www.facebook.com/settings?tab=business_tools"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook Business Integrations settings
            </a>
          </li>
        </ul>
      </LegalSectionContent>

      <LegalSectionContent id="sharing" title="Information Sharing">
        <p>We share information only in these limited circumstances:</p>
        <ul>
          <li>
            <strong>Service Providers:</strong> Infrastructure providers
            (hosting, databases, email delivery) that process data on our
            behalf under confidentiality obligations
          </li>
          <li>
            <strong>Meta:</strong> API calls to Meta necessarily transmit the
            instructions needed to manage your campaigns
          </li>
          <li>
            <strong>Legal Requirements:</strong> When required by law, legal
            process, or to protect our rights and users
          </li>
          <li>
            <strong>Business Transfers:</strong> In connection with a merger,
            acquisition, or sale of assets, with notice to you
          </li>
        </ul>
      </LegalSectionContent>

      <LegalSectionContent id="retention" title="Data Retention">
        <p>
          We retain your account information and automation settings for as
          long as your account is active. Campaign performance data retrieved
          from Meta is cached only as long as needed to power reporting and
          automation. When you disconnect your ad account or delete your
          account, associated Meta Platform Data is deleted within 30 days,
          except where retention is required by law.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="security" title="Data Security">
        <p>
          We use industry-standard safeguards to protect your information,
          including encryption in transit (HTTPS/TLS), encrypted storage of
          access tokens, role-based access controls, and regular security
          reviews. No method of transmission or storage is 100% secure, but we
          work to protect your data using commercially reasonable measures.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="rights" title="Your Rights & Data Deletion">
        <p>You may at any time:</p>
        <ul>
          <li>Access or correct your account information</li>
          <li>
            Revoke the App&apos;s access to your Meta ad account via your
            Facebook settings
          </li>
          <li>
            Request deletion of all data we hold about you via our{" "}
            <Link href="/meta/data-deletion">Data Deletion page</Link>
          </li>
        </ul>
        <p>
          Deletion requests are processed within 30 days and confirmed by
          email.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="contact" title="Contact Us">
        <p>
          For questions about this Privacy Policy or our data practices,
          contact us at{" "}
          <a href="mailto:hello@freddybeach.com">hello@freddybeach.com</a>.
        </p>
      </LegalSectionContent>
    </LegalLayout>
  )
}
