import { Metadata } from "next"
import Link from "next/link"
import {
  LegalLayout,
  TableOfContents,
  LegalSectionContent,
  type LegalSection,
} from "@/components/legal"

export const metadata: Metadata = {
  title: "Terms of Service | Freddy Beach Directory",
  description:
    "Read the terms and conditions for using Freddy Beach Directory, including user accounts, business listings, and AI features.",
}

const sections: LegalSection[] = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "accounts", title: "User Accounts" },
  { id: "listings", title: "Business Listings" },
  { id: "ai-usage", title: "AI Tools Usage" },
  { id: "payments", title: "Subscription & Payments" },
  { id: "prohibited", title: "Prohibited Conduct" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact Us" },
]

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="November 25, 2025"
      sections={sections}
      tocSlot={<TableOfContents sections={sections} />}
    >
      <LegalSectionContent id="acceptance" title="Acceptance of Terms">
        <p>
          By accessing or using Freddy Beach Directory (&quot;the Service&quot;),
          you agree to be bound by these Terms of Service (&quot;Terms&quot;). If
          you do not agree to these Terms, please do not use the Service.
        </p>
        <p>
          <strong>Agreement:</strong> These Terms constitute a legally binding
          agreement between you and Freddy Beach Directory. By creating an
          account, claiming a business listing, or using any features of our
          platform, you acknowledge that you have read, understood, and agree to
          be bound by these Terms.
        </p>
        <p>
          <strong>Eligibility:</strong> To use the Service, you must:
        </p>
        <ul>
          <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
          <li>Have the legal capacity to enter into a binding agreement</li>
          <li>Not be prohibited from using the Service under applicable laws</li>
          <li>
            If claiming or managing a business listing, have the authority to
            represent that business
          </li>
        </ul>
      </LegalSectionContent>

      <LegalSectionContent id="accounts" title="User Accounts">
        <p>
          <strong>Account Creation:</strong> To access certain features of the
          Service, you must create an account. When registering, you agree to:
        </p>
        <ul>
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and update your information to keep it accurate</li>
          <li>Create only one account per person or business entity</li>
          <li>
            Use your real identity or your business&apos;s official identity when
            claiming listings
          </li>
        </ul>
        <p>
          <strong>Account Security:</strong> You are responsible for:
        </p>
        <ul>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>
            Notifying us immediately of any unauthorized access or security
            breaches
          </li>
          <li>
            Ensuring that your connected third-party accounts (e.g., Google) are
            secure
          </li>
        </ul>
        <p>
          <strong>Account Termination:</strong> We reserve the right to suspend
          or terminate your account at our discretion if:
        </p>
        <ul>
          <li>You violate these Terms or any applicable laws</li>
          <li>Your account has been inactive for an extended period</li>
          <li>We reasonably believe your account poses a security risk</li>
          <li>Continued use would harm other users or the Service</li>
        </ul>
        <p>
          You may also delete your account at any time through your account
          settings or by contacting us.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="listings" title="Business Listings">
        <p>
          <strong>Claiming Process:</strong> To claim a business listing, you
          must verify that you are authorized to represent the business. We may
          require verification through:
        </p>
        <ul>
          <li>Email verification using a business domain email</li>
          <li>Phone verification to a publicly listed business number</li>
          <li>Documentation proving business ownership or authorization</li>
          <li>Other verification methods as we deem appropriate</li>
        </ul>
        <p>
          <strong>Accuracy Requirements:</strong> As a business owner or
          authorized representative, you agree to:
        </p>
        <ul>
          <li>Provide truthful and accurate business information</li>
          <li>Keep your listing up-to-date, including hours, contact info, and services</li>
          <li>Not misrepresent your business, its offerings, or its relationship to other entities</li>
          <li>Promptly correct any inaccuracies brought to your attention</li>
        </ul>
        <p>
          <strong>Prohibited Content:</strong> Business listings may not contain:
        </p>
        <ul>
          <li>False, misleading, or deceptive information</li>
          <li>Content that infringes on intellectual property rights</li>
          <li>Offensive, discriminatory, or illegal content</li>
          <li>Spam, promotional content for unrelated businesses, or malware</li>
          <li>Personal information about individuals without their consent</li>
        </ul>
        <p>
          We reserve the right to remove or modify listings that violate these
          requirements without prior notice.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="ai-usage" title="AI Tools Usage">
        <p>
          <strong>Acceptable Use:</strong> Freddy Beach Directory offers
          AI-powered features to help users and businesses. When using AI tools,
          you agree to:
        </p>
        <ul>
          <li>Use AI features only for legitimate business and directory purposes</li>
          <li>Review and verify AI-generated content before publishing</li>
          <li>Not use AI tools to generate spam, misleading content, or harmful material</li>
          <li>Not attempt to circumvent usage limits or abuse the AI systems</li>
          <li>Comply with our AI provider&apos;s terms of service (OpenRouter)</li>
        </ul>
        <p>
          <strong>Content Ownership:</strong> When you use our AI tools:
        </p>
        <ul>
          <li>
            Input content you provide remains your property, subject to our
            license to process it
          </li>
          <li>
            AI-generated output may be used by you for your business purposes
          </li>
          <li>
            You are solely responsible for how you use AI-generated content
          </li>
          <li>
            We do not claim ownership of AI-generated content created through
            your prompts
          </li>
        </ul>
        <p>
          <strong>Limitations Disclaimer:</strong> AI-generated content is
          provided &quot;as is&quot; without warranties. You acknowledge that:
        </p>
        <ul>
          <li>AI output may contain errors, inaccuracies, or inappropriate content</li>
          <li>AI cannot provide legal, financial, or professional advice</li>
          <li>You are responsible for reviewing and editing AI-generated content</li>
          <li>
            We are not liable for any consequences of using AI-generated content
          </li>
        </ul>
      </LegalSectionContent>

      <LegalSectionContent id="payments" title="Subscription & Payments">
        <p>
          <strong>Subscription Tiers:</strong> Freddy Beach Directory offers
          various subscription plans with different features and pricing. Free
          tier users have access to basic features, while paid plans unlock
          additional capabilities such as enhanced AI tools, priority support,
          and advanced analytics.
        </p>
        <p>
          <strong>Billing Terms:</strong> For paid subscriptions:
        </p>
        <ul>
          <li>
            Payments are processed securely through our payment provider (Stripe)
          </li>
          <li>
            Subscriptions are billed in advance on a monthly or annual basis
          </li>
          <li>Prices are listed in the currency displayed at checkout</li>
          <li>
            You authorize us to charge your payment method for recurring
            subscription fees
          </li>
          <li>
            Failed payments may result in service suspension until payment is
            received
          </li>
        </ul>
        <p>
          <strong>Cancellation Policy:</strong> You may cancel your subscription
          at any time:
        </p>
        <ul>
          <li>
            Monthly subscriptions: Access continues until the end of the current
            billing period
          </li>
          <li>
            Annual subscriptions: May be eligible for pro-rated refunds per our
            Refund Policy
          </li>
          <li>
            Free features remain accessible after paid subscription cancellation
          </li>
          <li>
            Business listings are not deleted upon subscription cancellation
          </li>
        </ul>
        <p>
          For detailed refund information, please see our{" "}
          <Link href="/refund" className="underline hover:text-primary">
            Refund Policy
          </Link>
          .
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="prohibited" title="Prohibited Conduct">
        <p>When using Freddy Beach Directory, you agree not to:</p>
        <ul>
          <li>
            <strong>Violate Laws:</strong> Use the Service for any unlawful
            purpose or in violation of any local, provincial, national, or
            international law
          </li>
          <li>
            <strong>Harm Others:</strong> Harass, abuse, threaten, or intimidate
            other users or businesses
          </li>
          <li>
            <strong>Spread Misinformation:</strong> Post false, misleading, or
            defamatory content about businesses or individuals
          </li>
          <li>
            <strong>Spam:</strong> Send unsolicited communications or post
            repetitive, irrelevant content
          </li>
          <li>
            <strong>Impersonate:</strong> Misrepresent your identity or falsely
            claim affiliation with any person or business
          </li>
          <li>
            <strong>Scrape Data:</strong> Use automated tools to collect data
            from the Service without permission
          </li>
          <li>
            <strong>Circumvent Security:</strong> Attempt to bypass security
            measures, access unauthorized areas, or interfere with the Service
          </li>
          <li>
            <strong>Infringe Rights:</strong> Upload content that violates
            copyrights, trademarks, or other intellectual property rights
          </li>
          <li>
            <strong>Manipulate Reviews:</strong> Post fake reviews, incentivize
            reviews, or manipulate ratings
          </li>
          <li>
            <strong>Resell Access:</strong> Sell, transfer, or sublicense your
            account or access to the Service
          </li>
        </ul>
        <p>
          Violations may result in content removal, account suspension, or
          permanent ban from the Service.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="liability" title="Limitation of Liability">
        <p>
          <strong>&quot;As Is&quot; Disclaimer:</strong> The Service is provided
          on an &quot;as is&quot; and &quot;as available&quot; basis without
          warranties of any kind, either express or implied, including but not
          limited to:
        </p>
        <ul>
          <li>Implied warranties of merchantability or fitness for a particular purpose</li>
          <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
          <li>Warranties regarding the accuracy or reliability of any information</li>
          <li>Warranties regarding the quality or accuracy of business listings</li>
        </ul>
        <p>
          <strong>Limitation of Damages:</strong> To the maximum extent permitted
          by law:
        </p>
        <ul>
          <li>
            Freddy Beach Directory shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages
          </li>
          <li>
            Our total liability for any claims arising from your use of the
            Service shall not exceed the amount you paid us in the twelve (12)
            months preceding the claim
          </li>
          <li>
            We are not responsible for any loss of data, profits, goodwill, or
            other intangible losses
          </li>
          <li>
            We are not liable for the actions, content, or data of third parties,
            including other users and listed businesses
          </li>
        </ul>
        <p>
          Some jurisdictions do not allow the exclusion of certain warranties or
          limitations of liability, so some of the above may not apply to you.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="changes" title="Changes to Terms">
        <p>
          <strong>Update Process:</strong> We may modify these Terms at any time
          at our discretion. When we make changes:
        </p>
        <ul>
          <li>
            We will update the &quot;Last updated&quot; date at the top of this
            page
          </li>
          <li>
            For material changes, we will provide notice through the Service or
            via email
          </li>
          <li>
            Continued use of the Service after changes constitutes acceptance of
            the new Terms
          </li>
          <li>
            If you disagree with the changes, you should discontinue use and
            delete your account
          </li>
        </ul>
        <p>
          We encourage you to review these Terms periodically to stay informed
          about your rights and obligations when using the Service.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="contact" title="Contact Us">
        <p>
          If you have questions about these Terms of Service or need assistance,
          please contact us:
        </p>
        <ul>
          <li>
            <strong>General Inquiries:</strong>{" "}
            <a href="mailto:hello@freddybeach.com">
              hello@freddybeach.com
            </a>
          </li>
          <li>
            <strong>Legal Matters:</strong>{" "}
            <a href="mailto:legal@freddybeach.com">
              legal@freddybeach.com
            </a>
          </li>
          <li>
            <strong>Address:</strong> Freddy Beach Directory, Fredericton, New
            Brunswick, Canada
          </li>
        </ul>
        <p>
          For privacy-related inquiries, please see our{" "}
          <Link href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </Link>{" "}
          or contact{" "}
          <a href="mailto:privacy@freddybeach.com">
            privacy@freddybeach.com
          </a>
          .
        </p>
      </LegalSectionContent>
    </LegalLayout>
  )
}
