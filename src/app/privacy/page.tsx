import { Metadata } from "next"
import {
  LegalLayout,
  TableOfContents,
  LegalSectionContent,
  type LegalSection,
} from "@/components/legal"

export const metadata: Metadata = {
  title: "Privacy Policy | Freddy Beach Directory",
  description:
    "Learn how Freddy Beach Directory collects, uses, and protects your personal information.",
}

const sections: LegalSection[] = [
  { id: "collection", title: "Information We Collect" },
  { id: "usage", title: "How We Use Your Information" },
  { id: "sharing", title: "Information Sharing" },
  { id: "cookies", title: "Cookies and Tracking" },
  { id: "security", title: "Data Security" },
  { id: "rights", title: "Your Rights" },
  { id: "contact", title: "Contact Us" },
]

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="November 25, 2025"
      sections={sections}
      tocSlot={<TableOfContents sections={sections} />}
    >
      <LegalSectionContent id="collection" title="Information We Collect">
        <p>
          <strong>Account Information:</strong> When you create an account, we
          collect your name, email address, and authentication credentials. If
          you sign in with Google, we receive your basic profile information
          from Google.
        </p>
        <p>
          <strong>Business Listing Information:</strong> If you claim or create
          a business listing, we collect business details including name,
          address, phone number, hours of operation, description, and any images
          you upload.
        </p>
        <p>
          <strong>Usage Data:</strong> We automatically collect certain
          information when you use our service, including:
        </p>
        <ul>
          <li>Pages visited and features used</li>
          <li>Search queries and filter selections</li>
          <li>Device type, browser, and operating system</li>
          <li>IP address and approximate location</li>
          <li>Date and time of visits</li>
        </ul>
      </LegalSectionContent>

      <LegalSectionContent id="usage" title="How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul>
          <li>
            <strong>Provide Services:</strong> Operate and maintain the
            directory, process account registration, and enable business
            listings
          </li>
          <li>
            <strong>Improve Listings:</strong> Help businesses maintain accurate
            and up-to-date information
          </li>
          <li>
            <strong>Send Notifications:</strong> Communicate important updates
            about your account, listings, or our services
          </li>
          <li>
            <strong>Power AI Features:</strong> Provide AI-assisted content
            generation and business recommendations when you opt to use these
            features
          </li>
          <li>
            <strong>Analytics:</strong> Understand how users interact with our
            platform to improve the experience
          </li>
          <li>
            <strong>Security:</strong> Detect, prevent, and address fraud,
            abuse, or technical issues
          </li>
        </ul>
      </LegalSectionContent>

      <LegalSectionContent id="sharing" title="Information Sharing">
        <p>
          We do not sell your personal information. We may share information in
          the following circumstances:
        </p>
        <ul>
          <li>
            <strong>Public Business Listings:</strong> Business information you
            submit is displayed publicly on the directory
          </li>
          <li>
            <strong>Service Providers:</strong> We work with third-party
            companies that help us operate our service (hosting, analytics,
            email delivery)
          </li>
          <li>
            <strong>AI Service Providers:</strong> When you use AI features,
            your prompts are processed by our AI provider (OpenRouter) to
            generate responses
          </li>
          <li>
            <strong>Payment Processors:</strong> If you subscribe to a paid
            plan, payment information is handled by our payment processor
            (Polar)
          </li>
        </ul>
        <p>
          <strong>Legal Requirements:</strong> We may disclose information if
          required by law, court order, or government request, or to protect the
          rights, property, or safety of Freddy Beach Directory, our users, or
          others.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="cookies" title="Cookies and Tracking">
        <p>We use cookies and similar technologies to:</p>
        <ul>
          <li>
            <strong>Essential Cookies:</strong> Required for the website to
            function, including authentication and session management
          </li>
          <li>
            <strong>Preference Cookies:</strong> Remember your settings like
            dark mode preference
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us understand how visitors
            use our site to improve the experience
          </li>
        </ul>
        <p>
          <strong>Managing Cookies:</strong> Most browsers allow you to control
          cookies through settings. Blocking certain cookies may affect site
          functionality. You can also clear cookies at any time through your
          browser settings.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="security" title="Data Security">
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal information, including:
        </p>
        <ul>
          <li>Encryption of data in transit using HTTPS/TLS</li>
          <li>Secure authentication through Better Auth with OAuth providers</li>
          <li>Regular security assessments and updates</li>
          <li>Access controls limiting who can view personal data</li>
          <li>Secure database hosting with regular backups</li>
        </ul>
        <p>
          While we strive to protect your information, no method of transmission
          over the Internet is 100% secure. We cannot guarantee absolute
          security but are committed to maintaining industry-standard
          protections.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="rights" title="Your Rights">
        <p>
          Depending on your location, you may have the following rights
          regarding your personal information:
        </p>
        <ul>
          <li>
            <strong>Access:</strong> Request a copy of the personal information
            we hold about you
          </li>
          <li>
            <strong>Correction:</strong> Request that we correct inaccurate or
            incomplete information
          </li>
          <li>
            <strong>Deletion:</strong> Request that we delete your personal
            information, subject to legal retention requirements
          </li>
          <li>
            <strong>Export:</strong> Request your data in a portable,
            machine-readable format
          </li>
          <li>
            <strong>Opt-Out:</strong> Unsubscribe from marketing communications
            at any time using the link in our emails
          </li>
        </ul>
        <p>
          To exercise any of these rights, please contact us using the
          information below. We will respond to your request within 30 days.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="contact" title="Contact Us">
        <p>
          If you have questions about this Privacy Policy or our data practices,
          please contact us:
        </p>
        <ul>
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:privacy@freddybeach.com">
              privacy@freddybeach.com
            </a>
          </li>
          <li>
            <strong>Address:</strong> Freddy Beach Directory, Fredericton, New
            Brunswick, Canada
          </li>
        </ul>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any material changes by posting the new policy on this page and
          updating the &quot;Last updated&quot; date.
        </p>
      </LegalSectionContent>
    </LegalLayout>
  )
}
