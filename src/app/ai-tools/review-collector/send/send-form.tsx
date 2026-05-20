"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SendFormProps {
  businessId: string;
}

export function SendForm({ businessId }: SendFormProps) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/tools/review-collector/send`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessId,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccess(`Sent to ${customerName.trim()}.`);
      setCustomerName("");
      setCustomerEmail("");
      setSubmitting(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customerName">Customer name</Label>
        <Input
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
          maxLength={120}
          disabled={submitting}
          placeholder="Jane Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerEmail">Customer email</Label>
        <Input
          id="customerEmail"
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          required
          maxLength={200}
          disabled={submitting}
          placeholder="jane@example.com"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Sending..." : "Send review request"}
      </Button>
    </form>
  );
}
