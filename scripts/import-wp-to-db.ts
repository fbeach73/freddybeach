/**
 * Import WordPress blog posts into the blogPost database table.
 *
 * The MDX files already exist in content/blog/ and images in public/images/blog/imported/.
 * This script fetches the original HTML from the WP REST API and inserts it into
 * the database so posts appear in the admin panel (/admin/blog).
 *
 * Usage: npx tsx scripts/import-wp-to-db.ts
 * Add --dry-run to preview without writing to DB.
 */

import "dotenv/config";
import crypto from "crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { blogPost } from "../src/lib/schema";

// --- Configuration ---

const WP_API_BASE = "https://blog.freddybeach.com/wp-json/wp/v2";

const PARODY_POST_IDS = [8583, 8555, 8548, 8546, 8544, 8542, 8529];
const LOCAL_POST_IDS = [7870, 7611, 7386, 7349, 7202, 5337];
// Note: 11411 excluded (password-protected)
const ALL_POST_IDS = [...PARODY_POST_IDS, ...LOCAL_POST_IDS];

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
  const basename = urlObj.pathname.split("/").pop() || "image.jpg";
  return basename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function mapCategory(post: WPPost): string {
  if (PARODY_POST_IDS.includes(post.id)) return "parody";
  const terms = post._embedded?.["wp:term"]?.[0] || [];
  const categoryNames = terms.map((t) => t.name.toLowerCase());
  if (categoryNames.some((n) => n.includes("parody"))) return "parody";
  return "local-news";
}

function rewriteImageUrls(html: string): string {
  // Replace WP image URLs with local paths
  let processed = html.replace(
    /https?:\/\/blog\.freddybeach\.com\/wp-content\/uploads\/[^"'\s)]+/g,
    (url) => {
      const filename = sanitizeFilename(url);
      return `/images/blog/imported/${filename}`;
    }
  );

  // Strip srcset and sizes attributes
  processed = processed.replace(/\s+srcset="[^"]*"/gi, "");
  processed = processed.replace(/\s+sizes="[^"]*"/gi, "");

  return processed;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": "FreddyBeach-Importer/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

// --- Main ---

async function main() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error("POSTGRES_URL environment variable is not set");
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  console.log(dryRun ? "=== DRY RUN ===" : "=== IMPORTING WP POSTS TO DATABASE ===");
  console.log(`Posts to import: ${ALL_POST_IDS.length}\n`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const postId of ALL_POST_IDS) {
    try {
      console.log(`Fetching post ${postId}...`);
      const post = await fetchJson<WPPost>(`${WP_API_BASE}/posts/${postId}?_embed`);

      const title = decodeHtmlEntities(post.title.rendered);
      console.log(`  Title: ${title}`);

      // Skip protected or empty content
      if (post.content.protected || !post.content.rendered.trim()) {
        console.log(`  SKIPPED: Content is empty or protected`);
        skipped++;
        continue;
      }

      // Check for existing slug in DB
      const existing = await db
        .select({ id: blogPost.id })
        .from(blogPost)
        .where(eq(blogPost.slug, post.slug))
        .limit(1);

      if (existing.length > 0) {
        console.log(`  SKIPPED: Slug "${post.slug}" already exists in DB`);
        skipped++;
        continue;
      }

      // Process content HTML — rewrite image URLs to local paths
      const content = rewriteImageUrls(post.content.rendered);

      // Extract excerpt
      const rawExcerpt = stripHtml(decodeHtmlEntities(post.excerpt.rendered));
      const excerpt = truncate(rawExcerpt, 160);

      // Category
      const categoryId = mapCategory(post);

      // Featured image
      let featuredImageUrl: string | null = null;
      let featuredImageAlt: string | null = null;
      const media = post._embedded?.["wp:featuredmedia"]?.[0];
      if (media) {
        const filename = sanitizeFilename(media.source_url);
        featuredImageUrl = `/images/blog/imported/${filename}`;
        featuredImageAlt = media.alt_text || title;
      }

      // Publish date
      const publishedAt = new Date(post.date);

      if (dryRun) {
        console.log(`  Would insert: slug="${post.slug}", category="${categoryId}"`);
        console.log(`  Excerpt: ${excerpt.slice(0, 80)}...`);
        console.log(`  Featured image: ${featuredImageUrl}`);
        inserted++;
        continue;
      }

      // Insert into database
      await db.insert(blogPost).values({
        id: crypto.randomUUID(),
        title,
        slug: post.slug,
        content,
        excerpt,
        categoryId,
        featuredImageUrl,
        featuredImageAlt,
        authorName: "Kyle Sweezey",
        status: "published",
        publishedAt,
        createdAt: publishedAt,
        updatedAt: new Date(),
      });

      console.log(`  INSERTED: "${post.slug}"`);
      inserted++;
    } catch (err) {
      console.error(`  ERROR importing post ${postId}:`, err);
      errors++;
    }
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Errors:   ${errors}`);

  await client.end();
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
