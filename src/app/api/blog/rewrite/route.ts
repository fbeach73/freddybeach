import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { SEOAnalysisResult } from "../analyze/route";

// Zod schema for rewrite output
const rewriteResultSchema = z.object({
  rewrittenContent: z.string().describe("The SEO-optimized rewritten content in HTML format"),
  changes: z.array(
    z.object({
      type: z.enum(["added", "removed", "modified"]).describe("Type of change"),
      description: z.string().describe("Description of what was changed"),
    })
  ).describe("Summary of changes made"),
  newScore: z.number().min(0).max(100).describe("Estimated new SEO score after changes"),
});

export type RewriteResult = z.infer<typeof rewriteResultSchema>;

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
    const { content, title, analysis, instructions } = body as {
      content: string;
      title?: string;
      analysis?: SEOAnalysisResult;
      instructions?: string;
    };

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

    // Fetch published business names for linking
    const businesses = await db
      .select({ name: business.name, slug: business.slug })
      .from(business)
      .where(eq(business.status, "published"));

    const businessList = businesses
      .map((b) => `- ${b.name}: /businesses/${b.slug}`)
      .join("\n");

    // Initialize OpenRouter
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // Build context from analysis if provided
    let analysisContext = "";
    if (analysis) {
      analysisContext = `
Previous SEO Analysis:
- Current Score: ${analysis.score}/100
- Top Keywords: ${analysis.keywords.slice(0, 5).map((k) => k.keyword).join(", ")}
- Suggestions: ${analysis.suggestions.join("; ")}
- Link Opportunities: ${analysis.linkOpportunities.map((l) => l.businessName).join(", ")}
`;
    }

    // System prompt for SEO rewriting
    const systemPrompt = `You are an expert SEO content writer specializing in local business content.
Your task is to rewrite the provided blog content to improve its SEO while maintaining its voice and intent.

Guidelines:
1. **Preserve the core message and tone** - don't change the fundamental content
2. **Improve keyword usage** - naturally incorporate relevant keywords without stuffing
3. **Enhance heading structure** - use proper H2/H3 hierarchy
4. **Add internal links** - link to relevant local businesses where natural (use markdown links that will be converted to HTML)
5. **Improve readability** - shorter paragraphs, clearer sentences
6. **Local SEO focus** - mention Fredericton, NB, and local context where appropriate
7. **Maintain HTML format** - output should be valid HTML suitable for a blog post

Available local businesses to link to:
${businessList || "No businesses available"}

When adding links to businesses, use this format: <a href="/businesses/SLUG">Business Name</a>

${instructions ? `\nSpecial Instructions from the user:\n${instructions}` : ""}
${analysisContext}`;

    const result = await generateObject({
      model: openrouter(process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"),
      schema: rewriteResultSchema,
      system: systemPrompt,
      prompt: `Rewrite this blog post for better SEO:

Title: ${title || "(No title)"}

Current Content:
${content}

Provide the rewritten HTML content along with a summary of changes made.`,
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Blog rewrite API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to rewrite content" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
