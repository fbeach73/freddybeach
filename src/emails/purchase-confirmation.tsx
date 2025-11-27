import { Text, Section, Row, Column, Hr } from "@react-email/components";
import * as React from "react";
import { EmailLayout, BRAND } from "./components/email-layout";
import { EmailHeading } from "./components/email-heading";
import { EmailButton } from "./components/email-button";

interface PurchaseItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseConfirmationEmailProps {
  userName: string;
  orderNumber: string;
  items: PurchaseItem[];
  subtotal: number;
  tax?: number;
  total: number;
  paymentMethodLast4: string;
  paymentMethodBrand?: string;
  receiptUrl?: string;
}

export function PurchaseConfirmationEmail({
  userName,
  orderNumber,
  items,
  subtotal,
  tax = 0,
  total,
  paymentMethodLast4,
  paymentMethodBrand = "Card",
  receiptUrl,
}: PurchaseConfirmationEmailProps) {
  const firstName = userName.split(" ")[0];
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);

  return (
    <EmailLayout preview={`Your FreddyBeach order #${orderNumber} is confirmed`}>
      <Section style={styles.receiptHeader}>
        <Text style={styles.receiptLabel}>RECEIPT</Text>
        <Text style={styles.orderNumber}>Order #{orderNumber}</Text>
        <Text style={styles.orderDate}>{formattedDate}</Text>
      </Section>

      <EmailHeading as="h1">Thanks for your purchase!</EmailHeading>

      <Text style={styles.greeting}>Hi {firstName},</Text>

      <Text style={styles.paragraph}>
        Your payment has been processed successfully. Here&apos;s a summary of
        your purchase:
      </Text>

      {/* Order Items */}
      <Section style={styles.itemsSection}>
        <Row style={styles.tableHeader}>
          <Column style={styles.itemColumn}>
            <Text style={styles.tableHeaderText}>Item</Text>
          </Column>
          <Column style={styles.qtyColumn}>
            <Text style={styles.tableHeaderText}>Qty</Text>
          </Column>
          <Column style={styles.priceColumn}>
            <Text style={styles.tableHeaderText}>Price</Text>
          </Column>
        </Row>

        {items.map((item, index) => (
          <Row key={index} style={styles.itemRow}>
            <Column style={styles.itemColumn}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.description && (
                <Text style={styles.itemDescription}>{item.description}</Text>
              )}
            </Column>
            <Column style={styles.qtyColumn}>
              <Text style={styles.itemQty}>{item.quantity}</Text>
            </Column>
            <Column style={styles.priceColumn}>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.unitPrice * item.quantity)}
              </Text>
            </Column>
          </Row>
        ))}

        <Hr style={styles.divider} />

        {/* Totals */}
        <Row style={styles.totalRow}>
          <Column style={styles.totalLabelColumn}>
            <Text style={styles.totalLabel}>Subtotal</Text>
          </Column>
          <Column style={styles.totalValueColumn}>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </Column>
        </Row>

        {tax > 0 && (
          <Row style={styles.totalRow}>
            <Column style={styles.totalLabelColumn}>
              <Text style={styles.totalLabel}>Tax</Text>
            </Column>
            <Column style={styles.totalValueColumn}>
              <Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
            </Column>
          </Row>
        )}

        <Row style={styles.grandTotalRow}>
          <Column style={styles.totalLabelColumn}>
            <Text style={styles.grandTotalLabel}>Total</Text>
          </Column>
          <Column style={styles.totalValueColumn}>
            <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Payment Method */}
      <Section style={styles.paymentSection}>
        <Text style={styles.paymentLabel}>Payment Method</Text>
        <Text style={styles.paymentValue}>
          {paymentMethodBrand} ending in {paymentMethodLast4}
        </Text>
      </Section>

      {receiptUrl && (
        <Section style={styles.ctaSection}>
          <EmailButton href={receiptUrl}>View Full Receipt</EmailButton>
        </Section>
      )}

      <Section style={styles.helpSection}>
        <EmailHeading as="h2">Need Help?</EmailHeading>
        <Text style={styles.paragraph}>
          If you have any questions about your purchase or need assistance,
          please contact us at{" "}
          <a href="mailto:support@freddybeach.com" style={styles.link}>
            support@freddybeach.com
          </a>
          .
        </Text>
      </Section>

      <Text style={styles.signature}>— The FreddyBeach Team</Text>
    </EmailLayout>
  );
}

const styles = {
  receiptHeader: {
    textAlign: "center" as const,
    marginBottom: "24px",
    padding: "16px",
    backgroundColor: BRAND.secondary,
    borderRadius: "8px",
  },
  receiptLabel: {
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    color: BRAND.primary,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 4px 0",
  },
  orderNumber: {
    fontSize: "20px",
    fontWeight: "700" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 4px 0",
  },
  orderDate: {
    fontSize: "14px",
    color: "#666666",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
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
  itemsSection: {
    backgroundColor: "#F9FAFB",
    padding: "16px",
    borderRadius: "8px",
    margin: "24px 0",
  },
  tableHeader: {
    borderBottom: "1px solid #E5E7EB",
    paddingBottom: "8px",
    marginBottom: "8px",
  },
  tableHeaderText: {
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  itemColumn: {
    width: "60%",
    verticalAlign: "top" as const,
  },
  qtyColumn: {
    width: "15%",
    textAlign: "center" as const,
    verticalAlign: "top" as const,
  },
  priceColumn: {
    width: "25%",
    textAlign: "right" as const,
    verticalAlign: "top" as const,
  },
  itemRow: {
    paddingTop: "12px",
    paddingBottom: "12px",
  },
  itemName: {
    fontSize: "16px",
    fontWeight: "500" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0 0 2px 0",
  },
  itemDescription: {
    fontSize: "14px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  itemQty: {
    fontSize: "16px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
    textAlign: "center" as const,
  },
  itemPrice: {
    fontSize: "16px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
    textAlign: "right" as const,
  },
  divider: {
    borderColor: "#E5E7EB",
    margin: "16px 0",
  },
  totalRow: {
    marginBottom: "4px",
  },
  totalLabelColumn: {
    width: "75%",
    textAlign: "right" as const,
    paddingRight: "16px",
  },
  totalValueColumn: {
    width: "25%",
    textAlign: "right" as const,
  },
  totalLabel: {
    fontSize: "14px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  totalValue: {
    fontSize: "14px",
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  grandTotalRow: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #E5E7EB",
  },
  grandTotalLabel: {
    fontSize: "16px",
    fontWeight: "600" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
    textAlign: "right" as const,
  },
  grandTotalValue: {
    fontSize: "18px",
    fontWeight: "700" as const,
    color: BRAND.primary,
    fontFamily: BRAND.fontFamily,
    margin: "0",
    textAlign: "right" as const,
  },
  paymentSection: {
    backgroundColor: "#F3F4F6",
    padding: "16px",
    borderRadius: "8px",
    margin: "24px 0",
  },
  paymentLabel: {
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    color: "#6B7280",
    fontFamily: BRAND.fontFamily,
    margin: "0 0 4px 0",
  },
  paymentValue: {
    fontSize: "16px",
    fontWeight: "500" as const,
    color: BRAND.text,
    fontFamily: BRAND.fontFamily,
    margin: "0",
  },
  ctaSection: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  helpSection: {
    marginTop: "32px",
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

export default PurchaseConfirmationEmail;
