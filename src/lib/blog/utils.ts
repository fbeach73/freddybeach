// Blog utility functions (client-safe - no server dependencies)

/**
 * Simple slugify function for heading IDs and URL slugs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Strip HTML tags from content (for plain text extraction)
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Generate an excerpt from content if not provided
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  const plainText = stripHtml(content);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find the last space before maxLength to avoid cutting words
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength - 30) {
    return truncated.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
}
