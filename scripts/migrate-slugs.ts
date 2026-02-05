/**
 * One-time migration: clean up business slugs by regenerating them from names.
 * Removes random nanoid suffixes (e.g. "majed-renovations-PG6ioJ" → "majed-renovations").
 *
 * Usage: npx tsx scripts/migrate-slugs.ts
 * Add --dry-run to preview changes without writing to DB.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { business } from "../src/lib/schema";

const dryRun = process.argv.includes("--dry-run");

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error("POSTGRES_URL environment variable is not set");
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  console.log(dryRun ? "=== DRY RUN ===" : "=== MIGRATING SLUGS ===");

  // Fetch all businesses
  const businesses = await db
    .select({ id: business.id, name: business.name, slug: business.slug })
    .from(business);

  console.log(`Found ${businesses.length} businesses\n`);

  // First pass: compute all new slugs and handle collisions
  const slugCounts = new Map<string, number>();
  const updates: Array<{ id: string; oldSlug: string; newSlug: string }> = [];

  for (const biz of businesses) {
    const baseSlug = slugify(biz.name.trim());
    const count = slugCounts.get(baseSlug) || 0;

    let newSlug: string;
    if (count === 0) {
      newSlug = baseSlug;
    } else {
      newSlug = `${baseSlug}-${count + 1}`;
    }
    slugCounts.set(baseSlug, count + 1);

    if (biz.slug !== newSlug) {
      updates.push({ id: biz.id, oldSlug: biz.slug, newSlug });
    }
  }

  if (updates.length === 0) {
    console.log("All slugs are already clean. Nothing to do.");
    await client.end();
    return;
  }

  console.log(`${updates.length} slugs to update:\n`);
  for (const u of updates) {
    console.log(`  ${u.oldSlug}  →  ${u.newSlug}`);
  }

  if (dryRun) {
    console.log("\nDry run complete. No changes made.");
    await client.end();
    return;
  }

  // Apply updates
  console.log("\nApplying updates...");
  for (const u of updates) {
    await db
      .update(business)
      .set({ slug: u.newSlug })
      .where(eq(business.id, u.id));
  }

  console.log(`\nDone! Updated ${updates.length} slugs.`);
  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
