"use client";

import { useState } from "react";
import { Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SubscribeByokButtonProps {
  className?: string;
  /** Custom button text (optional) */
  children?: React.ReactNode;
  /** Button variant */
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
}

export function SubscribeByokButton({
  className,
  children,
  variant = "default",
  size = "default",
}: SubscribeByokButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubscribe() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout/byok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.checkoutUrl) {
        // Redirect to Polar checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Subscribe error:", error);
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
      onClick={handleSubscribe}
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
          <Key className="mr-2 h-4 w-4" />
          Subscribe to BYOK Pro
        </>
      )}
    </Button>
  );
}
