import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Zod schema for structured analysis output
const seoAnalysisSchema = z.object({
  score: z.number().min(0).max(100).describe("Overall SEO score from 0-100"),
  keywords: z.array(
    z.object({
      keyword: z.string().describe("The keyword or phrase"),
      count: z.number().describe("Number of occurrences"),
      density: z.number().describe("Percentage of total words"),
    })
  ).describe("Top keywords found in the content"),
  headings: z.array(
    z.object({
      level: z.number().min(1).max(6).describe("Heading level (1-6)"),
      text: z.string().describe("The heading text"),
    })
  ).describe("Headings found in the content"),
  entities: z.array(
    z.object({
      name: z.string().describe("Entity name"),
      type: z.string().describe("Entity type: business, location, or other"),
      businessSlug: z.string().optional().describe("Slug if it matches a known business"),
    })
  ).describe("Named entities found in the content"),
  suggestions: z.array(z.string()).describe("Specific improvement suggestions"),
  linkOpportunities: z.array(
    z.object({
      businessName: z.string().describe("Business name to link"),
      slug: z.string().describe("Business slug for the link"),
      reason: z.string().describe("Why this link would be valuable"),
    })
  ).describe("Opportunities to link to local businesses"),
});

export type SEOAnalysisResult = z.infer<typeof seoAnalysisSchema>;

export async function POST(req: Request) {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = await req.json();
    const { content, title } = body;

    if (!content || typeof content !== "string") {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate API key
    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch published business names for entity recognition
    const businesses = await db
      .select({ name: business.name, slug: business.slug })
      .from(business)
      .where(eq(business.status, "published"));

    const businessNames = businesses.map((b) => `${b.name} (slug: ${b.slug})`).join("\n");

    // Initialize OpenRouter
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // System prompt for SEO analysis
    const systemPrompt = `You are an expert SEO analyst specializing in local business directories and content marketing.
Analyze the provided blog content for SEO effectiveness, focusing on:

1. **Keyword Analysis**: Identify the main keywords and phrases, their frequency, and density.
2. **Heading Structure**: Evaluate the heading hierarchy (H1, H2, H3, etc.) for proper structure.
3. **Entity Recognition**: Identify mentions of businesses, locations, and other named entities.
4. **Local SEO**: This is for FreddyBeach.com, a Fredericton, NB local business directory. Look for opportunities to link to local businesses.
5. **Content Quality**: Assess readability, engagement, and informativeness.

Here are the published businesses in our directory that could be linked:
${businessNames || "No businesses loaded"}

Score the content from 0-100, where:
- 90-100: Excellent SEO, minimal improvements needed
- 70-89: Good SEO, some improvements possible
- 50-69: Average SEO, several improvements needed
- Below 50: Poor SEO, significant work required

Be specific in your suggestions and identify concrete opportunities for internal linking to local businesses.`;

    const result = await generateObject({
      model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"),
      schema: seoAnalysisSchema,
      system: systemPrompt,
      prompt: `Analyze this blog post for SEO:

Title: ${title || "(No title)"}

Content:
${content}`,
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Blog analyze API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze content" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
