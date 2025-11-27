import { Metadata } from "next"
import Link from "next/link"
import {
  LegalLayout,
  TableOfContents,
  LegalSectionContent,
  type LegalSection,
} from "@/components/legal"

export const metadata: Metadata = {
  title: "Refund Policy | Freddy Beach Directory",
  description:
    "Learn about our refund policy for subscriptions and consultation services at Freddy Beach Directory.",
}

const sections: LegalSection[] = [
  { id: "subscriptions", title: "Subscription Refunds" },
  { id: "consultations", title: "Consultation Services" },
  { id: "process", title: "Refund Process" },
  { id: "exceptions", title: "Exceptions" },
  { id: "contact", title: "Contact Us" },
]

export default function RefundPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      lastUpdated="November 25, 2025"
      sections={sections}
      tocSlot={<TableOfContents sections={sections} />}
    >
      <LegalSectionContent id="subscriptions" title="Subscription Refunds">
        <p>
          <strong>30-Day Money-Back Guarantee:</strong> We offer a 30-day
          money-back guarantee on all new paid subscriptions. If you are not
          satisfied with your subscription within the first 30 days of your
          initial purchase, you may request a full refund.
        </p>
        <p>
          <strong>Annual Subscription Refunds:</strong> If you have an annual
          subscription and wish to cancel after the 30-day guarantee period:
        </p>
        <ul>
          <li>
            You may request a pro-rated refund for the unused portion of your
            subscription
          </li>
          <li>
            The refund amount will be calculated based on the number of full
            months remaining in your subscription
          </li>
          <li>
            A 10% administrative fee may be applied to pro-rated refunds
          </li>
          <li>
            Refunds are calculated from the date we receive your cancellation
            request
          </li>
        </ul>
        <p>
          <strong>Monthly Subscription Terms:</strong> For monthly
          subscriptions:
        </p>
        <ul>
          <li>
            Monthly subscriptions are not eligible for refunds after the 30-day
            guarantee period
          </li>
          <li>
            You may cancel at any time, and your access will continue until the
            end of your current billing period
          </li>
          <li>No partial refunds are issued for unused days within a billing cycle</li>
          <li>
            Cancellation must be completed before your next billing date to
            avoid being charged for the following month
          </li>
        </ul>
      </LegalSectionContent>

      <LegalSectionContent id="consultations" title="Consultation Services">
        <p>
          <strong>Cancellation Policy:</strong> For any paid consultation
          services (business optimization, marketing strategy, etc.):
        </p>
        <ul>
          <li>
            <strong>72+ hours before:</strong> Full refund or reschedule at no
            charge
          </li>
          <li>
            <strong>24-72 hours before:</strong> 50% refund or reschedule with a
            $25 fee
          </li>
          <li>
            <strong>Less than 24 hours:</strong> No refund; reschedule with a
            $50 fee
          </li>
          <li>
            <strong>No-show:</strong> No refund or reschedule; full amount
            forfeited
          </li>
        </ul>
        <p>
          <strong>Partial Completion Refunds:</strong> If a consultation service
          is partially completed:
        </p>
        <ul>
          <li>
            Refunds are calculated based on the proportion of work not yet
            delivered
          </li>
          <li>
            Any materials, reports, or deliverables already provided are
            non-refundable
          </li>
          <li>
            Both parties must agree in writing to the scope of incomplete work
            before a refund is processed
          </li>
        </ul>
        <p>
          <strong>Satisfaction Guarantee:</strong> We stand behind the quality
          of our consultation services:
        </p>
        <ul>
          <li>
            If you are unsatisfied with a consultation, contact us within 7 days
            of the session
          </li>
          <li>
            We will work with you to address your concerns, which may include a
            follow-up session at no charge
          </li>
          <li>
            If we cannot resolve your concerns, we may offer a partial or full
            refund at our discretion
          </li>
        </ul>
      </LegalSectionContent>

      <LegalSectionContent id="process" title="Refund Process">
        <p>
          <strong>How to Request a Refund:</strong> To initiate a refund
          request:
        </p>
        <ul>
          <li>
            <strong>Email:</strong> Send your request to{" "}
            <a href="mailto:billing@freddybeach.com">
              billing@freddybeach.com
            </a>
          </li>
          <li>
            <strong>Account Dashboard:</strong> Submit a refund request through
            your account settings (for subscription refunds)
          </li>
        </ul>
        <p>
          <strong>Required Information:</strong> Please include the following in
          your refund request:
        </p>
        <ul>
          <li>Your full name and email address associated with your account</li>
          <li>The type of purchase (subscription tier or consultation service)</li>
          <li>Date of purchase and payment amount</li>
          <li>Reason for the refund request</li>
          <li>
            Transaction ID or receipt number (if available, found in your
            confirmation email)
          </li>
        </ul>
        <p>
          <strong>Processing Timeframe:</strong> Once we receive your refund
          request:
        </p>
        <ul>
          <li>
            We will review your request and respond within 2-3 business days
          </li>
          <li>
            Approved refunds are processed within 5-7 business days of approval
          </li>
          <li>
            Refunds are issued to the original payment method used for the
            purchase
          </li>
          <li>
            Depending on your bank or payment provider, it may take an
            additional 5-10 business days for the refund to appear in your
            account
          </li>
        </ul>
      </LegalSectionContent>

      <LegalSectionContent id="exceptions" title="Exceptions">
        <p>
          <strong>Non-Refundable Situations:</strong> The following are not
          eligible for refunds:
        </p>
        <ul>
          <li>
            <strong>Account Violations:</strong> Subscriptions terminated due to
            violations of our{" "}
            <Link href="/terms" className="underline hover:text-primary">
              Terms of Service
            </Link>
          </li>
          <li>
            <strong>Completed Services:</strong> Consultation services that have
            been fully delivered and completed
          </li>
          <li>
            <strong>Promotional Offers:</strong> Purchases made using
            promotional codes, discounts, or special offers (unless otherwise
            stated in the promotion terms)
          </li>
          <li>
            <strong>Free Trials:</strong> Charges incurred after a free trial
            period ends (users are notified before the trial converts to a paid
            subscription)
          </li>
          <li>
            <strong>Chargebacks:</strong> If you initiate a chargeback with your
            bank instead of contacting us first, your account will be suspended
            and no future refunds will be issued
          </li>
          <li>
            <strong>Duplicate Accounts:</strong> Refund requests for duplicate
            accounts created to abuse promotional offers or free trials
          </li>
          <li>
            <strong>Currency Fluctuations:</strong> We do not compensate for
            currency exchange rate differences between purchase and refund dates
          </li>
        </ul>
        <p>
          We reserve the right to deny refund requests that do not meet the
          criteria outlined in this policy or that we reasonably believe to be
          fraudulent or abusive.
        </p>
      </LegalSectionContent>

      <LegalSectionContent id="contact" title="Contact Us">
        <p>
          If you have questions about our Refund Policy or need assistance with
          a refund request, please contact our billing team:
        </p>
        <ul>
          <li>
            <strong>Billing Email:</strong>{" "}
            <a href="mailto:billing@freddybeach.com">
              billing@freddybeach.com
            </a>
          </li>
          <li>
            <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM
            Atlantic Time (AT)
          </li>
          <li>
            <strong>Response Time:</strong> We aim to respond to all billing
            inquiries within 1-2 business days
          </li>
          <li>
            <strong>Address:</strong> Freddy Beach Directory, Fredericton, New
            Brunswick, Canada
          </li>
        </ul>
        <p>
          For general support inquiries, please email{" "}
          <a href="mailto:hello@freddybeach.com">
            hello@freddybeach.com
          </a>
          . For privacy-related concerns, see our{" "}
          <Link href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSectionContent>
    </LegalLayout>
  )
}
