"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function DataDeletionForm() {
  const [email, setEmail] = useState("")
  const [details, setDetails] = useState("")
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("submitting")
    try {
      const res = await fetch("/api/meta/data-deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, details }),
      })
      if (!res.ok) throw new Error("Request failed")
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm">
        <p className="font-medium">Deletion request received.</p>
        <p className="mt-1">
          We&apos;ll process your request within 30 days and send a
          confirmation to the email address you provided.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="deletion-email">Email address</Label>
        <Input
          id="deletion-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Use the email associated with your Freddybeach Optimal Ads account.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="deletion-details">Additional details (optional)</Label>
        <Textarea
          id="deletion-details"
          placeholder="Connected ad account ID, Facebook name, or anything that helps us locate your data"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={2000}
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-destructive">
          Something went wrong. Please try again or email{" "}
          <a className="underline" href="mailto:hello@freddybeach.com">
            hello@freddybeach.com
          </a>
          .
        </p>
      )}
      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting..." : "Request Data Deletion"}
      </Button>
    </form>
  )
}
