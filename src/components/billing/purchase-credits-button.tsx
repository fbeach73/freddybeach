"use client";

import { useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PurchaseCreditsButtonProps {
  /** Pack ID to purchase (e.g., "credits-10", "credits-50", "credits-100") */
  packId: string;
  credits: number;
  priceLabel: string;
  className?: string;
  /** Custom button text (optional - defaults to "Buy X Credits for $Y") */
  children?: React.ReactNode;
  /** Button variant */
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
}

export function PurchaseCreditsButton({
  packId,
  credits,
  priceLabel,
  className,
  children,
  variant = "default",
  size = "default",
}: PurchaseCreditsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handlePurchase() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout/credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start checkout. Please try again."
      );
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handlePurchase}
      disabled={isLoading}
      className={className}
      variant={variant}
      size={size}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : children ? (
        children
      ) : (
        <>
          <Coins className="mr-2 h-4 w-4" />
          Buy {credits} Credits for {priceLabel}
        </>
      )}
    </Button>
  );
}
