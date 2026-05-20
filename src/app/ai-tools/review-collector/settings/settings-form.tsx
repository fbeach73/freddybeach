"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SettingsValues {
  googleReviewUrl: string;
  brandColor: string;
  logoUrl: string;
  senderName: string;
  senderSignature: string;
  notificationEmail: string;
}

interface SettingsFormProps {
  businessId: string;
  initial: SettingsValues;
}

export function SettingsForm({ businessId, initial }: SettingsFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof SettingsValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/tools/review-collector/settings`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ businessId, ...values }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save. Please try again.");
        setSubmitting(false);
        return;
      }
      setSuccess("Saved.");
      setSubmitting(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="googleReviewUrl">
          Google review URL <span className="text-red-600">*</span>
        </Label>
        <Input
          id="googleReviewUrl"
          type="url"
          value={values.googleReviewUrl}
          onChange={(e) => update("googleReviewUrl", e.target.value)}
          placeholder="https://g.page/r/.../review"
          required
        />
        <p className="text-xs text-muted-foreground">
          Where 4–5 star customers will be sent. Find this in your Google
          Business Profile under &ldquo;Ask for reviews.&rdquo;
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notificationEmail">Notification email</Label>
        <Input
          id="notificationEmail"
          type="email"
          value={values.notificationEmail}
          onChange={(e) => update("notificationEmail", e.target.value)}
          placeholder="owner@example.com"
        />
        <p className="text-xs text-muted-foreground">
          Where private feedback notifications get sent. Leave blank to skip
          owner emails.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="brandColor">Brand color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="brandColor"
              type="text"
              value={values.brandColor}
              onChange={(e) => update("brandColor", e.target.value)}
              placeholder="#0F766E"
              maxLength={7}
            />
            {values.brandColor && /^#[0-9a-fA-F]{6}$/.test(values.brandColor) && (
              <div
                className="h-9 w-9 shrink-0 rounded border"
                style={{ background: values.brandColor }}
              />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input
            id="logoUrl"
            type="url"
            value={values.logoUrl}
            onChange={(e) => update("logoUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="senderName">Sender name (in email)</Label>
        <Input
          id="senderName"
          type="text"
          value={values.senderName}
          onChange={(e) => update("senderName", e.target.value)}
          placeholder="Defaults to your business name"
          maxLength={120}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="senderSignature">Email signature</Label>
        <Textarea
          id="senderSignature"
          value={values.senderSignature}
          onChange={(e) => update("senderSignature", e.target.value)}
          placeholder="Optional. Shown under the sender name."
          rows={3}
          maxLength={500}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
