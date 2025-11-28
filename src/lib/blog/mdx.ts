// MDX Compilation Utilities (Server-only - uses database)

import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import type { BlogFrontmatter, TOCItem } from "@/types/blog";
import { autoLinkContent, buildBusinessIndex } from "./auto-link";
import { mdxComponents } from "@/components/blog/mdx-components";
import { slugify, stripHtml, generateExcerpt } from "./utils";

// Re-export client-safe utilities for backwards compatibility
export { slugify, stripHtml, generateExcerpt };

// MDX compilation options
const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: "wrap",
        properties: {
          className: ["anchor-link"],
        },
      },
    ],
  ],
};

/**
 * Compile MDX content to React components
 * Optionally applies auto-linking to business names
 */
export async function compileBlogMDX(
  source: string,
  options?: { enableAutoLink?: boolean }
) {
  const { enableAutoLink = true } = options || {};

  // Build business index once for auto-linking
  let processedSource = source;

  if (enableAutoLink) {
    try {
      const businessIndex = await buildBusinessIndex();
      processedSource = await autoLinkContent(source, businessIndex);
    } catch (error) {
      // If auto-linking fails, continue with original source
      console.error("Auto-linking failed:", error);
    }
  }

  const { content, frontmatter } = await compileMDX<BlogFrontmatter>({
    source: processedSource,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: mdxOptions as object,
    },
  });

  return { content, frontmatter };
}

/**
 * Extract table of contents from MDX/HTML content
 * Finds all h2 and h3 headings and returns them as TOC items
 */
export function extractTableOfContents(content: string): TOCItem[] {
  const tocItems: TOCItem[] = [];

  // Match h2 and h3 headings in HTML
  const headingRegex = /<h([23])[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h[23]>/gi;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1], 10);
    const id = match[2];
    const text = match[3].trim();

    if (id && text) {
      tocItems.push({ id, text, level });
    }
  }

  // Also check for markdown-style headings (## and ###)
  const markdownHeadingRegex = /^(#{2,3})\s+(.+)$/gm;
  while ((match = markdownHeadingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugify(text);

    // Avoid duplicates
    if (!tocItems.some((item) => item.id === id)) {
      tocItems.push({ id, text, level });
    }
  }

  return tocItems;
}
