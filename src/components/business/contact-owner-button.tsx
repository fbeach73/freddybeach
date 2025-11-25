"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactOwnerButtonProps {
  businessName: string;
  className?: string;
}

export function ContactOwnerButton({
  businessName,
  className,
}: ContactOwnerButtonProps) {
  const handleContact = () => {
    // Placeholder for future modal/form implementation
    console.log(`Contact owner of ${businessName}`);
  };

  return (
    <Button
      onClick={handleContact}
      variant="outline"
      size="lg"
      className={cn("w-full", className)}
    >
      <MessageSquare className="mr-2 h-5 w-5" />
      Contact Business Owner
    </Button>
  );
}
