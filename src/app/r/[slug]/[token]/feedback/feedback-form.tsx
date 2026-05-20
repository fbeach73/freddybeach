"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackFormProps {
  slug: string;
  token: string;
  brandColor: string;
}

export function FeedbackForm({ slug, token, brandColor }: FeedbackFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please write a few words.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/r/${slug}/${token}/feedback`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/r/${slug}/${token}/thanks`);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tell us what didn't meet your expectations. We read every message."
        rows={5}
        maxLength={4000}
        required
        disabled={submitting}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full"
        style={{ background: brandColor, borderColor: brandColor }}
      >
        {submitting ? "Sending..." : "Send feedback"}
      </Button>
    </form>
  );
}
