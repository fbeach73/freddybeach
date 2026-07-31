import { Metadata } from "next"
import {
  LegalLayout,
  TableOfContents,
  LegalSectionContent,
  type LegalSection,
} from "@/components/legal"
import { DataDeletionForm } from "./data-deletion-form"

export const metadata: Metadata = {
  title: "User Data Deletion | Freddybeach Optimal Ads",
  description:
    "Request deletion of your data from Freddybeach Optimal Ads, the automated Meta ads bidding, scaling, pausing, and resuming tool.",
}

const sections: LegalSection[] = [
  { id: "overview", title: "Overview" },
  { id: "what-is-deleted", title: "What Gets Deleted" },
  { id: "how-to-request", title: "How to Request Deletion" },
  { id: "revoke-access", title: "Revoke App Access on Facebook" },
  { id: "request-form", title: "Submit a Deletion Request" },
]

export default function MetaDataDeletionPage() {
  return (
    <LegalLayout
      title="User Data Deletion — Freddybeach Optimal Ads"
      lastUpdated="July 30, 2026"
      sections={sections}
      tocSlot={<TableOfContents sections={sections} />}
    >
      <LegalSectionContent id="overview" title="Overview">
        <p>
          Freddybeach Optimal Ads respects your right to control your data. In
          accordance with Meta Platform requirements, this page explains how
          to request deletion of all data the App holds about you and your
          connected Meta ad accounts.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="what-is-deleted" title="What Gets Deleted">
        <p>When your deletion request is processed, we remove:</p>
        <ul>
          <li>Your account and profile information</li>
          <li>
            Stored Meta access tokens and ad account connection details
          </li>
          <li>
            Cached campaign, ad set, and ad data retrieved from the Meta
            Marketing API
          </li>
          <li>Your automation rules, settings, and automation history</li>
          <li>Usage logs associated with your account</li>
        </ul>
        <p>
          Deletion is completed within 30 days of your request, and we will
          confirm by email once it is done. Limited records may be retained
          where required by law (e.g., billing records).
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="how-to-request" title="How to Request Deletion">
        <p>You can request deletion in either of two ways:</p>
        <ul>
          <li>
            <strong>Use the form below</strong> — submit your email address
            and we will process your request
          </li>
          <li>
            <strong>Email us directly</strong> at{" "}
            <a href="mailto:hello@freddybeach.com">hello@freddybeach.com</a>{" "}
            with the subject line &quot;Data Deletion Request&quot; from the
            email address associated with your account
          </li>
        </ul>
      </LegalSectionContent>

      <LegalSectionContent
        id="revoke-access"
        title="Revoke App Access on Facebook"
      >
        <p>
          You can also remove the App&apos;s access to your Meta account at
          any time:
        </p>
        <ul>
          <li>
            Go to your Facebook{" "}
            <a
              href="https://www.facebook.com/settings?tab=business_tools"
              target="_blank"
              rel="noopener noreferrer"
            >
              Settings &rarr; Business Integrations
            </a>
          </li>
          <li>Find &quot;Freddybeach Optimal Ads&quot; in the list</li>
          <li>Select it and click &quot;Remove&quot;</li>
        </ul>
        <p>
          Removing the App revokes its API access immediately. To also delete
          data we have already stored, submit a deletion request below.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="request-form" title="Submit a Deletion Request">
        <DataDeletionForm />
      </LegalSectionContent>
    </LegalLayout>
  )
}
