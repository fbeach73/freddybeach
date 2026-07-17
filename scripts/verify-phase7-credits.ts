/**
 * Phase 7 verification: DB-level checks of the credit/tier system
 * (specs/ai-platform-foundation/implementation-plan.md, Phase 7).
 *
 * Covers the checklist items that don't need a running dev server or
 * Stripe CLI: free monthly top-up (incl. rewind), credit consumption,
 * legacy-tier normalization, Pro eligibility (double-charge regression),
 * Starter-uses-credits, founding-member idempotency, and exact
 * subscription expiry (date-drift guard).
 *
 * Creates a throwaway user and deletes it (plus its ledger rows) at the end.
 *
 * CAUTION: runs against whatever POSTGRES_URL points at. The founding-member
 * check flips the throwaway user's flag, briefly (+1 for ~a second) inflating
 * the live counter shown by FoundingMemberBanner until cleanup deletes the
 * row. Fine for a manual pre-launch run; do not schedule this against prod.
 *
 * Usage: POSTGRES_URL=... npx tsx scripts/verify-phase7-credits.ts
 *        (or: set -a; source .env.local; set +a; npx tsx scripts/verify-phase7-credits.ts)
 */

import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { user, creditTransaction, userTokenUsage } from "../src/lib/schema";
import {
  canGenerateWithDetails,
  consumeCredit,
  getUserCredits,
  getSubscriptionInfo,
  getFoundingMemberCount,
  markFoundingMember,
  incrementTokenUsage,
  getTokenUsage,
  activateSubscription,
  endSubscriptionImmediately,
} from "../src/lib/services/token-system";

const TEST_USER_ID = `phase7-verify-${Date.now()}`;
const TEST_EMAIL = `${TEST_USER_ID}@verify.test.local`;

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function cleanup() {
  await db.delete(creditTransaction).where(eq(creditTransaction.userId, TEST_USER_ID));
  await db.delete(userTokenUsage).where(eq(userTokenUsage.userId, TEST_USER_ID));
  await db.delete(user).where(eq(user.id, TEST_USER_ID));
}

async function main() {
  console.log(`Creating test user ${TEST_USER_ID}\n`);
  await db.insert(user).values({
    id: TEST_USER_ID,
    name: "Phase 7 Verify (temporary)",
    email: TEST_EMAIL,
    creditBalance: 0,
  });

  // --- Free tier: lazy monthly top-up to 10 ---
  console.log("Free tier monthly top-up:");
  const first = await canGenerateWithDetails(TEST_USER_ID, 1);
  check(
    "new free user is eligible via credits",
    first.allowed && first.reason === "credits",
    `got allowed=${first.allowed} reason=${first.reason}`
  );
  check(
    "topped up to 10 credits",
    (await getUserCredits(TEST_USER_ID)) === 10,
    `balance=${await getUserCredits(TEST_USER_ID)}`
  );

  const afterConsume = await consumeCredit(TEST_USER_ID, 1, "Phase 7 verify");
  check("consume 1 credit → 9", afterConsume === 9, `got ${afterConsume}`);

  // Rewind the grant stamp a month → next eligibility check tops back to 10
  await db
    .update(user)
    .set({ freeCreditsGrantedMonth: "2026-06" })
    .where(eq(user.id, TEST_USER_ID));
  await canGenerateWithDetails(TEST_USER_ID, 1);
  check(
    "rewound month stamp → topped back to 10",
    (await getUserCredits(TEST_USER_ID)) === 10,
    `balance=${await getUserCredits(TEST_USER_ID)}`
  );

  // Same month again → no double grant
  await consumeCredit(TEST_USER_ID, 1, "Phase 7 verify");
  await canGenerateWithDetails(TEST_USER_ID, 1);
  check(
    "same-month check does not re-grant",
    (await getUserCredits(TEST_USER_ID)) === 9,
    `balance=${await getUserCredits(TEST_USER_ID)}`
  );

  // --- Legacy tier normalization + Pro eligibility (double-charge regression) ---
  console.log("\nLegacy tier + Pro subscription:");
  const in30d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db
    .update(user)
    .set({ subscriptionTier: "monthly", subscriptionExpiresAt: in30d, subscriptionStartedAt: new Date() })
    .where(eq(user.id, TEST_USER_ID));

  const legacyInfo = await getSubscriptionInfo(TEST_USER_ID);
  check(
    'legacy "monthly" normalizes to "pro"',
    legacyInfo.tier === "pro" && legacyInfo.isActive,
    `tier=${legacyInfo.tier} active=${legacyInfo.isActive}`
  );

  const proEligibility = await canGenerateWithDetails(TEST_USER_ID, 1);
  check(
    'pro subscriber eligibility reason is "subscription" (no credit charge)',
    proEligibility.allowed && proEligibility.reason === "subscription",
    `got reason=${proEligibility.reason}`
  );
  const balanceBeforeProGen = await getUserCredits(TEST_USER_ID);
  check(
    "pro subscriber's credit balance untouched by eligibility",
    balanceBeforeProGen === 9,
    `balance=${balanceBeforeProGen}`
  );

  await incrementTokenUsage(TEST_USER_ID, 1);
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const usage = await getTokenUsage(TEST_USER_ID, currentMonth);
  check("soft-cap meter increments", usage === 1, `usage=${usage}`);

  // --- Starter tier uses credits, not unlimited ---
  console.log("\nStarter tier:");
  await db
    .update(user)
    .set({ subscriptionTier: "starter" })
    .where(eq(user.id, TEST_USER_ID));
  const starterEligibility = await canGenerateWithDetails(TEST_USER_ID, 1);
  check(
    'starter subscriber eligibility reason is "credits" (allowance model)',
    starterEligibility.allowed && starterEligibility.reason === "credits",
    `got reason=${starterEligibility.reason}`
  );

  // --- Exact expiry passthrough (Stripe date-drift guard) ---
  console.log("\nSubscription lifecycle:");
  const exactExpiry = new Date("2026-12-31T23:59:59.000Z");
  await activateSubscription(TEST_USER_ID, "pro", exactExpiry);
  const activated = await getSubscriptionInfo(TEST_USER_ID);
  check(
    "activateSubscription stores exact expiresAt (no drift)",
    activated.expiresAt?.getTime() === exactExpiry.getTime(),
    `stored=${activated.expiresAt?.toISOString()}`
  );

  await endSubscriptionImmediately(TEST_USER_ID);
  const ended = await getSubscriptionInfo(TEST_USER_ID);
  check("endSubscriptionImmediately clears the tier", !ended.isActive, `active=${ended.isActive}`);

  // --- Founding member idempotency ---
  // Assumes cap headroom: once 100 real founding members exist,
  // markFoundingMember correctly returns false and these two checks
  // will fail by design — that's the cap working, not a regression.
  console.log("\nFounding member:");
  const countBefore = await getFoundingMemberCount();
  const firstMark = await markFoundingMember(TEST_USER_ID);
  const secondMark = await markFoundingMember(TEST_USER_ID);
  const countAfter = await getFoundingMemberCount();
  check("markFoundingMember returns true", firstMark === true);
  check(
    "second call is idempotent (count +1 exactly)",
    secondMark === true && countAfter === countBefore + 1,
    `before=${countBefore} after=${countAfter}`
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error("Verification crashed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    console.log("Cleaning up test user…");
    await cleanup();
    console.log("Done.");
    process.exit(process.exitCode ?? 0);
  });
