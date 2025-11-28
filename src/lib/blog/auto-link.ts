// Auto-Linking System for Blog Posts
// Detects business names in content and converts them to links

import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { eq } from "drizzle-orm";

/**
 * Business index entry for auto-linking
 */
interface BusinessIndexEntry {
  name: string;
  slug: string;
  categorySlug: string;
  aliases: string[];
}

/**
 * Maximum number of auto-links to add per article
 */
const MAX_AUTO_LINKS = 5;

/**
 * Build an index of all published businesses with their name variations
 */
export async function buildBusinessIndex(): Promise<BusinessIndexEntry[]> {
  const businesses = await db
    .select({
      name: business.name,
      slug: business.slug,
      categoryId: business.categoryId,
    })
    .from(business)
    .where(eq(business.status, "published"));

  return businesses.map((b) => ({
    name: b.name,
    slug: b.slug,
    categorySlug: b.categoryId || "local", // fallback to 'local' if no category
    aliases: generateAliases(b.name),
  }));
}

/**
 * Generate name variations for better matching
 * Example: "The Downtown Diner" -> ["The Downtown Diner", "Downtown Diner"]
 */
export function generateAliases(name: string): string[] {
  const aliases: string[] = [name];

  // Remove common prefixes
  const prefixPatterns = [
    /^The\s+/i,
    /^A\s+/i,
    /^An\s+/i,
  ];

  for (const pattern of prefixPatterns) {
    if (pattern.test(name)) {
      aliases.push(name.replace(pattern, "").trim());
    }
  }

  // Remove common suffixes
  const suffixPatterns = [
    /\s+Inc\.?$/i,
    /\s+LLC\.?$/i,
    /\s+Ltd\.?$/i,
    /\s+Co\.?$/i,
    /\s+Restaurant$/i,
    /\s+Cafe$/i,
    /\s+Café$/i,
    /\s+Bar$/i,
    /\s+Pub$/i,
    /\s+Grill$/i,
  ];

  const baseWithoutPrefix = aliases[aliases.length - 1];
  for (const pattern of suffixPatterns) {
    if (pattern.test(baseWithoutPrefix)) {
      const withoutSuffix = baseWithoutPrefix.replace(pattern, "").trim();
      if (withoutSuffix.length > 3 && !aliases.includes(withoutSuffix)) {
        aliases.push(withoutSuffix);
      }
    }
  }

  return aliases;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Auto-link business names in content
 * Returns the content with business names wrapped in markdown links
 *
 * @param content - The markdown/text content to process
 * @param businessIndex - Optional pre-built index (if not provided, will fetch from DB)
 * @returns Content with business names linked
 */
export async function autoLinkContent(
  content: string,
  businessIndex?: BusinessIndexEntry[]
): Promise<string> {
  const index = businessIndex || await buildBusinessIndex();

  if (index.length === 0) {
    return content;
  }

  let linkedContent = content;
  let linkCount = 0;
  const linkedBusinesses = new Set<string>();

  // Sort by name length (longest first) to match longer names first
  // This prevents "Downtown" from matching before "Downtown Diner"
  const sortedEntries = [...index].sort((a, b) => {
    const maxAliasA = Math.max(...a.aliases.map((alias) => alias.length));
    const maxAliasB = Math.max(...b.aliases.map((alias) => alias.length));
    return maxAliasB - maxAliasA;
  });

  for (const entry of sortedEntries) {
    if (linkCount >= MAX_AUTO_LINKS) {
      break;
    }

    // Skip if we've already linked this business
    if (linkedBusinesses.has(entry.slug)) {
      continue;
    }

    // Try each alias
    for (const alias of entry.aliases) {
      if (linkCount >= MAX_AUTO_LINKS) {
        break;
      }

      // Create regex that matches the alias but not if it's:
      // - Already inside a markdown link [text](url)
      // - Already inside an HTML tag
      // - Part of a URL
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(
        `(?<!\\[)(?<!\\]\\()(?<![\\w-])${escapeRegex(alias)}(?![\\w-])(?!\\])(?!\\))`,
        "gi"
      );

      // Check if the alias exists in content (case-insensitive)
      if (regex.test(linkedContent)) {
        // Reset regex lastIndex
        regex.lastIndex = 0;

        // Replace only the first occurrence
        linkedContent = linkedContent.replace(regex, (match) => {
          // Double-check we're not inside a link already
          const beforeMatch = linkedContent.substring(
            0,
            linkedContent.indexOf(match)
          );
          const openBrackets = (beforeMatch.match(/\[/g) || []).length;
          const closeBrackets = (beforeMatch.match(/\]/g) || []).length;

          // If brackets are unbalanced, we might be inside a link
          if (openBrackets > closeBrackets) {
            return match;
          }

          linkCount++;
          linkedBusinesses.add(entry.slug);

          // Return markdown link
          return `[${match}](/${entry.categorySlug}/${entry.slug})`;
        });

        // Only replace once per business
        break;
      }
    }
  }

  return linkedContent;
}

/**
 * Check if content already contains links to a specific business
 */
export function hasExistingLink(content: string, slug: string): boolean {
  // Check for markdown links to the business
  const markdownLinkRegex = new RegExp(`\\]\\([^)]*/${escapeRegex(slug)}[^)]*\\)`, "i");

  // Check for HTML links to the business
  const htmlLinkRegex = new RegExp(`href=["'][^"']*/${escapeRegex(slug)}[^"']*["']`, "i");

  return markdownLinkRegex.test(content) || htmlLinkRegex.test(content);
}

/**
 * Get statistics about auto-linking for a piece of content
 */
export async function getAutoLinkStats(content: string): Promise<{
  potentialLinks: { name: string; slug: string }[];
  existingLinks: string[];
}> {
  const index = await buildBusinessIndex();
  const potentialLinks: { name: string; slug: string }[] = [];
  const existingLinks: string[] = [];

  for (const entry of index) {
    // Check if already linked
    if (hasExistingLink(content, entry.slug)) {
      existingLinks.push(entry.name);
      continue;
    }

    // Check if name appears in content
    for (const alias of entry.aliases) {
      const regex = new RegExp(`\\b${escapeRegex(alias)}\\b`, "i");
      if (regex.test(content)) {
        potentialLinks.push({ name: entry.name, slug: entry.slug });
        break;
      }
    }
  }

  return { potentialLinks, existingLinks };
}
