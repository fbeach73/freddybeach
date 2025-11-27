"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ClaimBusinessCtaProps {
  businessId: string;
  businessName: string;
  isLoggedIn: boolean;
  className?: string;
}

const ROLE_OPTIONS = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Manager" },
  { value: "authorized_representative", label: "Authorized Representative" },
] as const;

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
    } else if (!/^[\d\s\-+()]+$/.test(phone.trim())) {
      newErrors.phone = "Please enter a valid phone number";
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
    <Card
      className={cn(
        "border-2 border-dashed border-primary/30 bg-primary/5",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">Is this your business?</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Claim{" "}
          <span className="font-medium text-foreground">{businessName}</span> to
          manage your listing and unlock these benefits:
        </p>
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg" onClick={handleButtonClick}>
              Claim This Business
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Claim {businessName}</DialogTitle>
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
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
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
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
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
      </CardContent>
    </Card>
  );
}
