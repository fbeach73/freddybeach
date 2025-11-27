import { Button } from "@react-email/components";
import * as React from "react";
import { BRAND } from "./email-layout";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function EmailButton({
  href,
  children,
  variant = "primary",
}: EmailButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Button
      href={href}
      style={{
        backgroundColor: isPrimary ? BRAND.primary : "transparent",
        color: isPrimary ? "#FFFFFF" : BRAND.primary,
        padding: "14px 28px",
        borderRadius: "6px",
        fontWeight: "600",
        fontSize: "16px",
        textDecoration: "none",
        textAlign: "center" as const,
        display: "inline-block",
        border: isPrimary ? "none" : `2px solid ${BRAND.primary}`,
        fontFamily: BRAND.fontFamily,
      }}
    >
      {children}
    </Button>
  );
}
