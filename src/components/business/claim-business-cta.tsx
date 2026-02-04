"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CLAIM_ROLE_OPTIONS } from "@/lib/constants/claims";

interface ClaimBusinessCtaProps {
  businessId: string;
  businessName: string;
  isLoggedIn: boolean;
  className?: string;
}

export function ClaimBusinessCta({
  businessId,
  businessName,
  isLoggedIn,
  className,
}: ClaimBusinessCtaProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [role, setRole] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  // Validation state
  const [errors, setErrors] = useState<{
    role?: string;
    phone?: string;
    description?: string;
  }>({});

  const benefits = [
    "Respond to customer reviews",
    "Update business information",
    "Add photos and special offers",
    "Access business analytics",
  ];

  const handleButtonClick = () => {
    if (!isLoggedIn) {
      // Redirect to sign in with return URL
      router.push(`/sign-in?callbackURL=/${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!role) {
      newErrors.role = "Please select your role";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      // Remove all non-digit characters to check actual phone number
      const digitsOnly = phone.replace(/\D/g, "");
      // Must have at least 10 digits and only contain valid characters
      if (!/^[\d\s\-+()]+$/.test(phone.trim())) {
        newErrors.phone = "Please enter a valid phone number";
      } else if (digitsOnly.length < 10) {
        newErrors.phone = "Phone number must have at least 10 digits";
      } else if (digitsOnly.length > 15) {
        newErrors.phone = "Phone number is too long";
      }
    }

    if (!description.trim()) {
      newErrors.description = "Please describe your connection to this business";
    } else if (description.trim().length < 20) {
      newErrors.description = "Please provide more detail (at least 20 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          role,
          phone: phone.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to submit claim");
        return;
      }

      toast.success("Claim submitted successfully! We'll review it shortly.");
      setOpen(false);

      // Reset form
      setRole("");
      setPhone("");
      setDescription("");
      setErrors({});

      // Redirect to dashboard to see their pending claims
      router.push("/dashboard/my-businesses");
    } catch (error) {
      console.error("Claim submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "nb-card bg-card",
        className
      )}
    >
      {/* Accent bar */}
      <div className="h-2 bg-nb-green border-b-2 border-nb-border" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center bg-nb-green border-2 border-nb-border">
            <Building2 className="h-5 w-5 text-black" />
          </div>
          <h3 className="text-lg font-bold uppercase tracking-tight">Is this your business?</h3>
        </div>
        <div className="border-b-2 border-nb-border/10 mb-4" />
        <p className="text-muted-foreground mb-4">
          Claim{" "}
          <span className="font-bold text-foreground">{businessName}</span> to
          manage your listing and unlock these benefits:
        </p>
        <ul className="space-y-2 mb-5">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-nb-green shrink-0" />
              <span className="font-medium">{benefit}</span>
            </li>
          ))}
        </ul>

        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            // Reset form when dialog closes
            if (!isOpen) {
              setRole("");
              setPhone("");
              setDescription("");
              setErrors({});
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="nb-btn w-full bg-nb-green text-black hover:bg-nb-green"
              size="lg"
              onClick={handleButtonClick}
            >
              Claim This Business
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-none border-4 border-nb-border">
            <DialogHeader>
              <DialogTitle className="font-bold uppercase">Claim {businessName}</DialogTitle>
              <DialogDescription>
                Please provide information to verify your connection to this
                business. Our team will review your claim within 1-2 business
                days.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">
                  Your Role <span className="text-destructive">*</span>
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role" className="rounded-none border-2 border-nb-border">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLAIM_ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(506) 555-1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-none border-2 border-nb-border"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  We may contact you to verify your claim
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  How are you connected to this business?{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Please describe your role and relationship to this business..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="rounded-none border-2 border-nb-border"
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="nb-btn flex-1 bg-card text-foreground hover:bg-card"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="nb-btn flex-1 bg-nb-green text-black hover:bg-nb-green"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Claim"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
