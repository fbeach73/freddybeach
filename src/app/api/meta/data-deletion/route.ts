import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/services/email"

const NOTIFY_EMAIL = "hello@freddybeach.com"

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function POST(request: Request) {
  let body: { email?: string; details?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const email = typeof body.email === "string" ? body.email.trim() : ""
  const details =
    typeof body.details === "string" ? body.details.trim().slice(0, 2000) : ""

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: "A valid email address is required" },
      { status: 400 }
    )
  }

  const submittedAt = new Date().toISOString()
  const safeEmail = escapeHtml(email)
  const safeDetails = escapeHtml(details)

  const html = `
    <h2>Meta App Data Deletion Request</h2>
    <p>A user has requested deletion of their data from Freddybeach Optimal Ads.</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Additional details:</strong><br/>${safeDetails || "(none provided)"}</p>
    <p><strong>Submitted:</strong> ${submittedAt}</p>
    <p>Source: /meta/data-deletion</p>
  `

  const text = `Meta App Data Deletion Request

A user has requested deletion of their data from Freddybeach Optimal Ads.

Email: ${email}
Additional details: ${details || "(none provided)"}
Submitted: ${submittedAt}
Source: /meta/data-deletion`

  const sent = await sendEmail({
    to: NOTIFY_EMAIL,
    subject: `Data Deletion Request: ${email}`,
    html,
    text,
  })

  if (!sent) {
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
