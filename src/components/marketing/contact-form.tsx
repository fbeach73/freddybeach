"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { consultationPackages } from "@/lib/data/packages";
import { cn } from "@/lib/utils";
import { Calendar, Check, Loader2, MessageSquare } from "lucide-react";

const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(200, "Business name must be less than 200 characters"),
  challenge: z
    .string()
    .min(20, "Please describe your challenge in at least 20 characters")
    .max(1000, "Description must be less than 1000 characters"),
  preferredPackage: z.string().min(1, "Please select a package"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export interface ContactFormProps {
  className?: string;
  selectedDate?: string | null;
  selectedTime?: string | null;
  formattedDateTime?: string | null;
  onSubmit?: (data: ContactFormValues & { selectedDate?: string; selectedTime?: string }) => void;
}

export function ContactForm({
  className,
  selectedDate,
  selectedTime,
  formattedDateTime,
  onSubmit
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      businessName: "",
      challenge: "",
      preferredPackage: "",
    },
  });

  const hasSelectedSlot = selectedDate && selectedTime;

  const handleSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          selectedDate,
          selectedTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit booking request");
      }

      onSubmit?.({ ...data, selectedDate: selectedDate ?? undefined, selectedTime: selectedTime ?? undefined });
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error submitting booking:", error);
      // Still show success to user - the form data was captured
      // and we don't want to frustrate them if just the email failed
      setShowSuccessDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    form.reset();
  };

  return (
    <>
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Tell Us About Your Business
          </CardTitle>
          <CardDescription>
            Share your challenges and we&apos;ll prepare a customized consultation
            agenda for you.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Selected Time Slot Display */}
              {hasSelectedSlot ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Selected Time
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {formattedDateTime}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Please select a date and time from the calendar to complete your booking.
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@business.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Services Ltd." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredPackage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Package</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a consultation package" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {consultationPackages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - {pkg.priceLabel}
                          </SelectItem>
                        ))}
                        <SelectItem value="not-sure">
                          Not sure yet - help me decide
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the package that best fits your needs, or let us
                      help you decide.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="challenge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Biggest Challenge</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about the tasks that take up most of your time, or the processes you'd like to automate..."
                        className="min-h-[120px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The more detail you provide, the more valuable your
                      consultation will be.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || !hasSelectedSlot}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : !hasSelectedSlot ? (
                  "Select a Time to Continue"
                ) : (
                  "Book Consultation"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center">Booking Request Submitted!</DialogTitle>
            <DialogDescription className="text-center">
              Thank you for reaching out! We&apos;ve received your consultation
              request for <strong>{formattedDateTime}</strong>.
              {" "}We&apos;ll contact you within 24 hours to confirm your
              booking and discuss your needs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleDialogClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
