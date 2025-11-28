// Blog Author Configuration
// For now, all posts use a single author. This can be expanded later.

import type { BlogAuthor } from "@/types/blog";

// Default author for all blog posts
export const defaultAuthor: BlogAuthor = {
  name: "FreddyBeach Team",
  image: "/images/freddybeach-logo.png",
  bio: "The FreddyBeach team shares insights about local businesses, community events, and tips for exploring Fredericton.",
};

/**
 * Get author by name (for future multi-author support)
 * Currently returns the default author for any input
 */
export function getAuthor(name?: string): BlogAuthor {
  // For now, always return default author
  // In the future, this could look up authors from a database or config
  if (name && name !== defaultAuthor.name) {
    return {
      name,
      image: defaultAuthor.image,
    };
  }
  return defaultAuthor;
}
