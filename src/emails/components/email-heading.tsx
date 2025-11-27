import { Heading } from "@react-email/components";
import * as React from "react";
import { BRAND } from "./email-layout";

type HeadingLevel = "h1" | "h2" | "h3";

interface EmailHeadingProps {
  as?: HeadingLevel;
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}

const headingStyles: Record<HeadingLevel, React.CSSProperties> = {
  h1: {
    fontSize: "28px",
    lineHeight: "36px",
    fontWeight: "700",
    margin: "0 0 16px 0",
  },
  h2: {
    fontSize: "22px",
    lineHeight: "28px",
    fontWeight: "600",
    margin: "0 0 12px 0",
  },
  h3: {
    fontSize: "18px",
    lineHeight: "24px",
    fontWeight: "600",
    margin: "0 0 8px 0",
  },
};

export function EmailHeading({
  as = "h1",
  children,
  align = "left",
}: EmailHeadingProps) {
  return (
    <Heading
      as={as}
      style={{
        ...headingStyles[as],
        color: BRAND.text,
        fontFamily: BRAND.fontFamily,
        textAlign: align,
      }}
    >
      {children}
    </Heading>
  );
}
