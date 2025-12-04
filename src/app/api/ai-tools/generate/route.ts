import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import {
  canGenerateWithDetails,
  consumeCredit,
  getUserCredits,
} from "@/lib/services/token-system";
import { getToolBySlug } from "@/lib/data/ai-tools";

// Text generation model
const TEXT_MODEL = "gemini-2.0-flash";

// System prompts for each tool
const TOOL_PROMPTS: Record<string, (input: string, option?: string) => string> = {
  "review-responder": (input, tone = "professional") => `You are an expert at crafting business review responses.
Generate a ${tone} response to the following customer review.
The response should:
- Acknowledge the customer's feedback
- Be warm and genuine
- Address any concerns mentioned
- If positive, express gratitude
- If negative, apologize and offer to resolve
- Keep it concise (2-4 sentences)
- Sign off appropriately for a local business

Customer Review:
${input}

Generate ONLY the response text, nothing else.`,

  "social-post-generator": (input, platform = "instagram") => `You are a social media marketing expert.
Generate an engaging ${platform} post about the following topic for a local business.
The post should:
- Be attention-grabbing and engaging
- Include relevant emojis (but not excessive)
- Be appropriate length for ${platform}
- Include a call-to-action
- Feel authentic and local

Topic/Business:
${input}

Generate ONLY the post text, nothing else.`,

  "business-description-writer": (input, length = "medium") => {
    const wordCounts = { short: "50-100", medium: "150-250", long: "300-500" };
    return `You are a professional copywriter specializing in local business marketing.
Write a compelling business description (${wordCounts[length as keyof typeof wordCounts] || "150-250"} words) based on the following information.
The description should:
- Highlight unique selling points
- Appeal to local customers
- Be professional yet warm
- Include key services/products
- Convey the business's personality

Business Information:
${input}

Generate ONLY the description text, nothing else.`;
  },

  "email-template-generator": (input, emailType = "reminder") => `You are an email marketing expert for local businesses.
Generate a ${emailType} email template based on the following details.
The email should:
- Have a clear subject line (on its own line, prefixed with "Subject: ")
- Be professional but friendly
- Include personalization placeholders like [Customer Name], [Date], [Time], etc.
- Have a clear call-to-action if appropriate
- Be appropriate for a local business

Details:
${input}

Format the response as:
Subject: [subject line]

[email body]`,
};

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const { toolSlug, input, option } = body;

    if (!toolSlug || !input) {
      return NextResponse.json(
        { error: "Missing required fields: toolSlug, input" },
        { status: 400 }
      );
    }

    // Verify tool exists
    const tool = getToolBySlug(toolSlug);
    if (!tool) {
      return NextResponse.json(
        { error: "Invalid tool slug" },
        { status: 400 }
      );
    }

    // Check if user can generate (has credits)
    const eligibility = await canGenerateWithDetails(userId, 1);

    if (!eligibility.allowed) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          reason: eligibility.reason,
          creditsRemaining: eligibility.creditsRemaining || 0,
        },
        { status: 402 }
      );
    }

    // Get the prompt builder for this tool
    const promptBuilder = TOOL_PROMPTS[toolSlug];
    if (!promptBuilder) {
      return NextResponse.json(
        { error: "Tool not configured for AI generation" },
        { status: 400 }
      );
    }

    // Build the prompt
    const prompt = promptBuilder(input, option);

    // Get API key
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Call Gemini API
    const client = new GoogleGenAI({ apiKey });

    const response = await client.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
    });

    // Extract text from response
    const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return NextResponse.json(
        { error: "Failed to generate content" },
        { status: 500 }
      );
    }

    // Consume credit (1 credit for text generation)
    const newBalance = await consumeCredit(
      userId,
      1,
      `${tool.name} generation`
    );

    // Get updated credits for response
    const creditsRemaining = newBalance ?? (await getUserCredits(userId));

    return NextResponse.json({
      success: true,
      output: generatedText.trim(),
      creditsUsed: 1,
      creditsRemaining,
      toolSlug,
    });
  } catch (error) {
    console.error("AI tool generation error:", error);

    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes("429") || error.message.includes("quota")) {
        return NextResponse.json(
          { error: "AI service rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
