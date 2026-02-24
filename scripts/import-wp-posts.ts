/**
 * Import selected WordPress blog posts into the Next.js MDX blog.
 *
 * Fetches posts from the WordPress REST API at blog.freddybeach.com,
 * downloads images, converts HTML to Markdown, and writes MDX files.
 *
 * Usage: npx tsx scripts/import-wp-posts.ts
 * Add --dry-run to preview without writing files.
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import TurndownService from "turndown";

// --- Configuration ---

const WP_API_BASE = "https://blog.freddybeach.com/wp-json/wp/v2";

const PARODY_POST_IDS = [8583, 8555, 8548, 8546, 8544, 8542, 8529];
const LOCAL_POST_IDS = [11411, 7870, 7611, 7386, 7349, 7202, 5337];
const ALL_POST_IDS = [...PARODY_POST_IDS, ...LOCAL_POST_IDS];

const OUTPUT_DIR = path.join(process.cwd(), "content", "blog");
const IMAGE_DIR = path.join(process.cwd(), "public", "images", "blog", "imported");

const dryRun = process.argv.includes("--dry-run");

// --- Types ---

interface WPPost {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  excerpt: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
      media_details?: { sizes?: Record<string, { source_url: string }> };
    }>;
    "wp:term"?: Array<Array<{ name: string; slug: string }>>;
  };
}

// --- Utilities ---

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8230;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "...";
}

function sanitizeFilename(url: string): string {
  const urlObj = new URL(url);
  const basename = path.basename(urlObj.pathname);
  return basename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function fetchUrl(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, { headers: { "User-Agent": "FreddyBeach-Importer/1.0" } }, (res) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function fetchJson<T>(url: string): Promise<T> {
  const buffer = await fetchUrl(url);
  return JSON.parse(buffer.toString("utf-8")) as T;
}

async function downloadImage(url: string, filename: string): Promise<string> {
  const localPath = path.join(IMAGE_DIR, filename);
  const publicPath = `/images/blog/imported/${filename}`;

  if (fs.existsSync(localPath)) {
    return publicPath;
  }

  if (dryRun) {
    return publicPath;
  }

  const buffer = await fetchUrl(url);
  fs.writeFileSync(localPath, buffer);
  return publicPath;
}

// --- Turndown setup ---

function createTurndown(): TurndownService {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });

  // Handle <figure> with <img> and optional <figcaption>
  td.addRule("figure", {
    filter: "figure",
    replacement(_content, node) {
      const el = node as HTMLElement;
      const img = el.querySelector("img");
      if (!img) return "";
      const src = img.getAttribute("src") || "";
      const alt = img.getAttribute("alt") || "";
      const caption = el.querySelector("figcaption");
      const captionText = caption ? caption.textContent?.trim() : "";
      return `\n\n![${alt || captionText || ""}](${src})\n\n`;
    },
  });

  // Preserve YouTube iframes as raw HTML
  td.addRule("youtube-iframe", {
    filter(node) {
      if (node.nodeName !== "IFRAME") return false;
      const src = (node as HTMLElement).getAttribute("src") || "";
      return src.includes("youtube") || src.includes("youtu.be");
    },
    replacement(_content, node) {
      const el = node as HTMLElement;
      const src = el.getAttribute("src") || "";
      const width = el.getAttribute("width") || "560";
      const height = el.getAttribute("height") || "315";
      return `\n\n<iframe width="${width}" height="${height}" src="${src}" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>\n\n`;
    },
  });

  // Remove empty paragraphs
  td.addRule("empty-p", {
    filter(node) {
      return node.nodeName === "P" && !node.textContent?.trim() && !(node as HTMLElement).querySelector("img");
    },
    replacement() {
      return "";
    },
  });

  return td;
}

// --- Image processing ---

async function processInlineImages(html: string): Promise<string> {
  // Find all img src URLs in the HTML
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
  const urls = new Set<string>();
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (src.includes("blog.freddybeach.com") || src.includes("freddybeach.com")) {
      urls.add(src);
    }
  }

  let processed = html;

  for (const url of urls) {
    const filename = sanitizeFilename(url);
    try {
      const localPath = await downloadImage(url, filename);
      processed = processed.split(url).join(localPath);
    } catch (err) {
      console.warn(`  Warning: Failed to download inline image: ${url}`);
    }
  }

  // Strip srcset and sizes attributes (WP responsive image refs)
  processed = processed.replace(/\s+srcset="[^"]*"/gi, "");
  processed = processed.replace(/\s+sizes="[^"]*"/gi, "");

  return processed;
}

// --- Category mapping ---

function mapCategory(post: WPPost): string {
  const terms = post._embedded?.["wp:term"]?.[0] || [];
  const categoryNames = terms.map((t) => t.name.toLowerCase());

  if (PARODY_POST_IDS.includes(post.id)) return "parody";
  if (categoryNames.some((n) => n.includes("parody"))) return "parody";
  return "local-news";
}

// --- Main import ---

async function importPost(postId: number): Promise<"imported" | "skipped" | "error"> {
  try {
    console.log(`\nFetching post ${postId}...`);
    const post = await fetchJson<WPPost>(`${WP_API_BASE}/posts/${postId}?_embed`);

    const title = decodeHtmlEntities(post.title.rendered);
    console.log(`  Title: ${title}`);

    // Skip password-protected or empty posts
    if (post.content.protected || !post.content.rendered.trim()) {
      console.log(`  SKIPPED: Content is empty or protected`);
      return "skipped";
    }

    // Extract excerpt
    const rawExcerpt = stripHtml(decodeHtmlEntities(post.excerpt.rendered));
    const excerpt = truncate(rawExcerpt, 160);

    // Category
    const categoryId = mapCategory(post);

    // Featured image
    let featuredImage = "/images/blog/default-featured.jpg";
    let featuredImageAlt = title;
    const media = post._embedded?.["wp:featuredmedia"]?.[0];
    if (media) {
      const filename = sanitizeFilename(media.source_url);
      try {
        featuredImage = await downloadImage(media.source_url, filename);
        featuredImageAlt = media.alt_text || title;
      } catch (err) {
        console.warn(`  Warning: Failed to download featured image`);
      }
    }

    // Process inline images and clean HTML
    let processedHtml = await processInlineImages(post.content.rendered);

    // Convert HTML to Markdown
    const td = createTurndown();
    let markdown = td.turndown(processedHtml);

    // Clean up excessive blank lines
    markdown = markdown.replace(/\n{3,}/g, "\n\n");

    // Build frontmatter
    const publishedAt = new Date(post.date).toISOString();
    const escapedTitle = title.replace(/"/g, '\\"');
    const escapedExcerpt = excerpt.replace(/"/g, '\\"');
    const escapedAlt = featuredImageAlt.replace(/"/g, '\\"');

    const frontmatter = [
      "---",
      `title: "${escapedTitle}"`,
      `slug: ${post.slug}`,
      `excerpt: "${escapedExcerpt}"`,
      `categoryId: ${categoryId}`,
      `featuredImage: ${featuredImage}`,
      `featuredImageAlt: "${escapedAlt}"`,
      `authorName: Kyle Sweezey`,
      `publishedAt: "${publishedAt}"`,
      "---",
    ].join("\n");

    const mdxContent = `${frontmatter}\n\n${markdown}\n`;

    // Write file
    const filePath = path.join(OUTPUT_DIR, `${post.slug}.mdx`);

    if (dryRun) {
      console.log(`  Would write: ${filePath}`);
      console.log(`  Category: ${categoryId}`);
      console.log(`  Excerpt: ${excerpt.slice(0, 80)}...`);
    } else {
      fs.writeFileSync(filePath, mdxContent, "utf-8");
      console.log(`  Wrote: ${filePath}`);
    }

    return "imported";
  } catch (err) {
    console.error(`  ERROR importing post ${postId}:`, err);
    return "error";
  }
}

async function main() {
  console.log(dryRun ? "=== DRY RUN ===" : "=== IMPORTING WORDPRESS POSTS ===");
  console.log(`Posts to import: ${ALL_POST_IDS.length}`);

  // Ensure output directories exist
  if (!dryRun) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
  }

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const postId of ALL_POST_IDS) {
    const result = await importPost(postId);
    if (result === "imported") imported++;
    else if (result === "skipped") skipped++;
    else errors++;
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Imported: ${imported}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Errors:   ${errors}`);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
