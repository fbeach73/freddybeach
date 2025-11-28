// Meta Description Helpers for Blog SEO
// Utilities for generating and optimizing meta descriptions

const MAX_DESCRIPTION_LENGTH = 160;
const MIN_DESCRIPTION_LENGTH = 50;
const IDEAL_DESCRIPTION_LENGTH = 155;

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
    .replace(/&amp;/g, "&") // Replace HTML entities
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Generate an excerpt from HTML or MDX content
 * Extracts text, removes code blocks, and creates a clean summary
 */
export function generateExcerpt(
  content: string,
  maxLength: number = IDEAL_DESCRIPTION_LENGTH
): string {
  // Remove code blocks first (both fenced and inline)
  let text = content
    .replace(/```[\s\S]*?```/g, "") // Remove fenced code blocks
    .replace(/`[^`]+`/g, "") // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert markdown links to text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // Remove markdown images
    .replace(/#{1,6}\s+/g, "") // Remove heading markers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
    .replace(/\*([^*]+)\*/g, "$1") // Remove italic
    .replace(/__([^_]+)__/g, "$1") // Remove bold (underscore)
    .replace(/_([^_]+)_/g, "$1") // Remove italic (underscore)
    .replace(/~~([^~]+)~~/g, "$1") // Remove strikethrough
    .replace(/^[-*+]\s+/gm, "") // Remove list markers
    .replace(/^\d+\.\s+/gm, "") // Remove numbered list markers
    .replace(/^>\s+/gm, "") // Remove blockquote markers
    .replace(/---+/g, "") // Remove horizontal rules
    .replace(/\n+/g, " "); // Convert newlines to spaces

  // Strip any remaining HTML
  text = stripHtml(text);

  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim();

  // If text is already short enough, return it
  if (text.length <= maxLength) {
    return text;
  }

  // Find a good break point (end of sentence or word boundary)
  const breakPoints = [
    text.lastIndexOf(". ", maxLength - 3),
    text.lastIndexOf("! ", maxLength - 3),
    text.lastIndexOf("? ", maxLength - 3),
    text.lastIndexOf(", ", maxLength - 3),
    text.lastIndexOf(" ", maxLength - 3),
  ].filter((p) => p > MIN_DESCRIPTION_LENGTH);

  // Prefer sentence breaks, then commas, then word boundaries
  const breakPoint = Math.max(...breakPoints, MIN_DESCRIPTION_LENGTH);

  // If we found a sentence break, use it
  if (
    text.lastIndexOf(". ", maxLength - 3) > MIN_DESCRIPTION_LENGTH &&
    text.lastIndexOf(". ", maxLength - 3) === breakPoint
  ) {
    return text.substring(0, breakPoint + 1).trim();
  }

  // Otherwise, truncate at the break point and add ellipsis
  return text.substring(0, breakPoint).trim() + "...";
}

/**
 * Generate a meta description from blog post content
 * Uses the provided excerpt if available, otherwise generates from content
 */
export function generateMetaDescription(
  excerpt: string | undefined,
  content: string,
  maxLength: number = IDEAL_DESCRIPTION_LENGTH
): string {
  // Prefer provided excerpt if it exists and is valid
  if (excerpt && excerpt.length >= MIN_DESCRIPTION_LENGTH) {
    const cleanExcerpt = stripHtml(excerpt).trim();
    if (cleanExcerpt.length <= maxLength) {
      return cleanExcerpt;
    }
    return generateExcerpt(cleanExcerpt, maxLength);
  }

  // Generate from content
  return generateExcerpt(content, maxLength);
}

/**
 * Validate a meta description length
 * Returns feedback about the description quality
 */
export function validateMetaDescription(description: string): {
  isValid: boolean;
  length: number;
  feedback: string;
} {
  const length = description.length;

  if (length < MIN_DESCRIPTION_LENGTH) {
    return {
      isValid: false,
      length,
      feedback: `Too short (${length}/${MIN_DESCRIPTION_LENGTH} min). Add more detail.`,
    };
  }

  if (length > MAX_DESCRIPTION_LENGTH) {
    return {
      isValid: false,
      length,
      feedback: `Too long (${length}/${MAX_DESCRIPTION_LENGTH} max). Google may truncate this.`,
    };
  }

  if (length >= MIN_DESCRIPTION_LENGTH && length <= IDEAL_DESCRIPTION_LENGTH) {
    return {
      isValid: true,
      length,
      feedback: `Good length (${length} chars). Optimal for search results.`,
    };
  }

  return {
    isValid: true,
    length,
    feedback: `Acceptable length (${length} chars). Consider shortening slightly.`,
  };
}

/**
 * Generate a meta title from blog post title
 * Appends site name and handles length constraints
 */
export function generateMetaTitle(
  title: string,
  siteName: string = "FreddyBeach"
): string {
  const MAX_TITLE_LENGTH = 60;
  const separator = " | ";
  const suffix = `${separator}${siteName}`;

  // If title + suffix fits, use it
  if (title.length + suffix.length <= MAX_TITLE_LENGTH) {
    return `${title}${suffix}`;
  }

  // If title alone is too long, truncate it
  if (title.length > MAX_TITLE_LENGTH) {
    return title.substring(0, MAX_TITLE_LENGTH - 3) + "...";
  }

  // Title alone without suffix
  return title;
}

/**
 * Clean and normalize a slug for URL use
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .substring(0, 60); // Limit length
}
