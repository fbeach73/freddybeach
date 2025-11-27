import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactOwnerButtonProps {
  businessName: string;
  className?: string;
}

/**
 * Placeholder button for contacting the business owner.
 * Currently displays a disabled button as functionality is not yet implemented.
 * Will be converted to client component when contact form modal is added.
 */
export function ContactOwnerButton({
  className,
}: ContactOwnerButtonProps) {
  return (
    <Button
      variant="outline"
      size="lg"
      className={cn("w-full", className)}
      disabled
    >
      <MessageSquare className="mr-2 h-5 w-5" />
      Contact Business Owner
    </Button>
  );
}
