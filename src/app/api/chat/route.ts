import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  canGenerateWithDetails,
  consumeCredit,
  incrementTokenUsage,
  logSubscriptionUsage,
} from "@/lib/services/token-system";

export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = session.user.id;

    // Parse request body
    let body: { messages?: UIMessage[] };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages } = body;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required and must not be empty" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check eligibility before streaming (same 402 shape as the generate routes)
    const eligibility = await canGenerateWithDetails(userId, 1);

    if (!eligibility.allowed) {
      return new Response(
        JSON.stringify({
          error: "Insufficient credits",
          reason: eligibility.reason,
          creditsRemaining: eligibility.creditsRemaining || 0,
        }),
        { status: 402, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize OpenRouter with API key from environment
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const result = streamText({
      model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-5-mini"),
      messages: convertToModelMessages(messages),
      // Meter based on eligibility reason (same split as the generate routes):
      // - credits: consume 1 credit from balance
      // - subscription: track for soft cap + audit trail (no credit charge)
      // - byok: audit trail only (chat uses the app key)
      onFinish: async () => {
        try {
          if (eligibility.reason === "credits") {
            await consumeCredit(userId, 1, "AI chat message");
          } else if (eligibility.reason === "subscription") {
            await incrementTokenUsage(userId, 1);
            await logSubscriptionUsage(userId, 1, "AI chat message");
          } else {
            await logSubscriptionUsage(userId, 1, "AI chat message (BYOK)");
          }
        } catch (meterError) {
          console.error("Chat metering error:", meterError);
        }
      },
    });

    return (
      result as unknown as { toUIMessageStreamResponse: () => Response }
    ).toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
