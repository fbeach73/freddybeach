import { Metadata } from "next"
import Link from "next/link"
import {
  LegalLayout,
  TableOfContents,
  LegalSectionContent,
  type LegalSection,
} from "@/components/legal"

export const metadata: Metadata = {
  title: "Terms of Service | Freddybeach Optimal Ads",
  description:
    "Terms of Service for Freddybeach Optimal Ads, the automated Meta ads bidding, scaling, pausing, and resuming tool.",
}

const sections: LegalSection[] = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "service", title: "Description of Service" },
  { id: "accounts", title: "Accounts & Meta Authorization" },
  { id: "automation", title: "Automated Actions & Ad Spend" },
  { id: "acceptable-use", title: "Acceptable Use" },
  { id: "disclaimers", title: "Disclaimers" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "termination", title: "Termination" },
  { id: "changes", title: "Changes to These Terms" },
  { id: "contact", title: "Contact Us" },
]

export default function MetaTermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service — Freddybeach Optimal Ads"
      lastUpdated="July 30, 2026"
      sections={sections}
      tocSlot={<TableOfContents sections={sections} />}
    >
      <LegalSectionContent id="acceptance" title="Acceptance of Terms">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of
          Freddybeach Optimal Ads (&quot;the App&quot;), an advertising
          automation service operated by FreddyBeach.com (&quot;we&quot;,
          &quot;us&quot;). By connecting your Meta ad account or otherwise
          using the App, you agree to these Terms and to our{" "}
          <Link href="/meta/privacy-policy">Privacy Policy</Link>. If you do not
          agree, do not use the App.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="service" title="Description of Service">
        <p>
          The App connects to the Meta Marketing API to automate management of
          your ad campaigns, including:
        </p>
        <ul>
          <li>Automated bid adjustments based on performance rules</li>
          <li>Automated budget scaling (up or down)</li>
          <li>
            Automated pausing and resuming of campaigns, ad sets, and ads
          </li>
          <li>Performance reporting and automation history</li>
        </ul>
        <p>
          The App is not affiliated with, endorsed by, or sponsored by Meta
          Platforms, Inc. Your use of Meta&apos;s platforms remains subject to
          Meta&apos;s own terms and advertising policies.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="accounts" title="Accounts & Meta Authorization">
        <p>
          You must provide accurate account information and keep your
          credentials secure. You are responsible for all activity under your
          account. By connecting a Meta ad account, you represent that you
          have the authority to manage that ad account and that you authorize
          the App to take the automated actions you configure. You may revoke
          this authorization at any time through your Facebook Business
          Integrations settings.
        </p>
      </LegalSectionContent>

      <LegalSectionContent
        id="automation"
        title="Automated Actions & Ad Spend"
      >
        <p>
          The App executes actions automatically based on rules you configure.
          You acknowledge and agree that:
        </p>
        <ul>
          <li>
            <strong>You control the rules.</strong> All bidding, scaling, and
            pause/resume behavior is driven by settings you define, and you
            are responsible for reviewing them
          </li>
          <li>
            <strong>Ad spend is yours.</strong> All advertising costs incurred
            in your Meta ad account — including spend resulting from automated
            scaling or bidding — are your sole responsibility
          </li>
          <li>
            <strong>Performance is not guaranteed.</strong> We do not
            guarantee any particular advertising results, return on ad spend,
            or cost savings
          </li>
          <li>
            <strong>API dependence.</strong> The App depends on the Meta
            Marketing API; delays, outages, or changes on Meta&apos;s side may
            affect or interrupt automation
          </li>
        </ul>
      </LegalSectionContent>

      <LegalSectionContent id="acceptable-use" title="Acceptable Use">
        <p>You agree not to:</p>
        <ul>
          <li>
            Use the App to run ads that violate Meta&apos;s Advertising
            Standards or any applicable law
          </li>
          <li>
            Connect ad accounts you are not authorized to manage
          </li>
          <li>
            Attempt to reverse engineer, disrupt, or gain unauthorized access
            to the App or its infrastructure
          </li>
          <li>
            Resell or provide access to the App to third parties without our
            written consent
          </li>
        </ul>
      </LegalSectionContent>

      <LegalSectionContent id="disclaimers" title="Disclaimers">
        <p>
          THE APP IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
          WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
          WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
          NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE APP WILL BE
          UNINTERRUPTED, ERROR-FREE, OR THAT AUTOMATED ACTIONS WILL EXECUTE AT
          ANY PARTICULAR TIME.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="liability" title="Limitation of Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR
          ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
          DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR AD SPEND, ARISING
          FROM YOUR USE OF THE APP — INCLUDING SPEND OR LOST OPPORTUNITY
          RESULTING FROM AUTOMATED BIDDING, SCALING, PAUSING, OR RESUMING OF
          ADS. OUR TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE AMOUNT
          YOU PAID US FOR THE APP IN THE TWELVE MONTHS PRECEDING THE CLAIM.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="termination" title="Termination">
        <p>
          You may stop using the App and disconnect your Meta ad account at
          any time. We may suspend or terminate your access if you violate
          these Terms or if required to comply with Meta platform policies or
          applicable law. Upon termination, your data will be handled as
          described in our <Link href="/meta/privacy-policy">Privacy Policy</Link>,
          and you may request deletion via our{" "}
          <Link href="/meta/data-deletion">Data Deletion page</Link>.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="changes" title="Changes to These Terms">
        <p>
          We may update these Terms from time to time. Material changes will
          be communicated by email or an in-app notice, and the &quot;Last
          updated&quot; date above will be revised. Continued use of the App
          after changes take effect constitutes acceptance of the updated
          Terms.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="contact" title="Contact Us">
        <p>
          Questions about these Terms? Contact us at{" "}
          <a href="mailto:hello@freddybeach.com">hello@freddybeach.com</a>.
        </p>
      </LegalSectionContent>
    </LegalLayout>
  )
}
