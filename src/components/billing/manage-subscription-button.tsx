"use client";

import { useState } from "react";
import { Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ManageSubscriptionButtonProps {
  className?: string;
  /** Custom button text (optional) */
  children?: React.ReactNode;
  /** Button variant */
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * Opens the Stripe billing portal where the user can update payment
 * methods, view invoices, or cancel their subscription.
 */
export function ManageSubscriptionButton({
  className,
  children,
  variant = "outline",
  size = "default",
}: ManageSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleOpenPortal() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }

      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error("Billing portal error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to open billing portal. Please try again."
      );
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleOpenPortal}
      disabled={isLoading}
      className={className}
      variant={variant}
      size={size}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Opening...
        </>
      ) : children ? (
        children
      ) : (
        <>
          <Settings className="mr-2 h-4 w-4" />
          Manage Subscription
        </>
      )}
    </Button>
  );
}
