import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, creditTransaction } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

const FREE_CREDITS_AMOUNT = 10;

/**
 * POST /api/admin/grant-free-credits
 *
 * One-time admin endpoint to grant 10 free credits to all existing users
 * who have 0 credits and haven't received their signup bonus yet.
 *
 * This is idempotent - it checks for existing "Welcome bonus" transactions.
 */
export async function POST() {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Find all users with 0 credits who haven't received signup bonus
    const usersWithZeroCredits = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        creditBalance: user.creditBalance,
      })
      .from(user)
      .where(eq(user.creditBalance, 0));

    if (usersWithZeroCredits.length === 0) {
      return NextResponse.json({
        message: "No users need credits - all users already have credits",
        granted: 0,
        skipped: 0,
      });
    }

    let granted = 0;
    let skipped = 0;
    const results: Array<{ userId: string; email: string; status: string }> = [];

    for (const u of usersWithZeroCredits) {
      // Check if user already received signup bonus (idempotency check)
      const existingBonus = await db
        .select({ id: creditTransaction.id })
        .from(creditTransaction)
        .where(
          and(
            eq(creditTransaction.userId, u.id),
            eq(creditTransaction.type, "admin_grant"),
            sql`${creditTransaction.description} LIKE '%Welcome bonus%'`
          )
        )
        .limit(1);

      if (existingBonus.length > 0) {
        skipped++;
        results.push({
          userId: u.id,
          email: u.email,
          status: "skipped - already received bonus",
        });
        continue;
      }

      // Grant credits
      await db.transaction(async (tx) => {
        // Update user balance
        await tx
          .update(user)
          .set({
            creditBalance: FREE_CREDITS_AMOUNT,
            updatedAt: new Date(),
          })
          .where(eq(user.id, u.id));

        // Create transaction record
        await tx.insert(creditTransaction).values({
          id: nanoid(),
          userId: u.id,
          amount: FREE_CREDITS_AMOUNT,
          type: "admin_grant",
          description: "Welcome bonus: 10 free AI credits (retroactive)",
          balanceAfter: FREE_CREDITS_AMOUNT,
          createdAt: new Date(),
        });
      });

      granted++;
      results.push({
        userId: u.id,
        email: u.email,
        status: "granted 10 credits",
      });
    }

    return NextResponse.json({
      message: `Granted ${FREE_CREDITS_AMOUNT} credits to ${granted} users`,
      granted,
      skipped,
      results,
    });
  } catch (error) {
    console.error("Failed to grant free credits:", error);
    return NextResponse.json(
      { error: "Failed to grant credits" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/grant-free-credits
 *
 * Check how many users would receive credits (dry run)
 */
export async function GET() {
  try {
    // Verify admin access
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Count users with 0 credits
    const usersWithZeroCredits = await db
      .select({
        id: user.id,
        email: user.email,
        creditBalance: user.creditBalance,
      })
      .from(user)
      .where(eq(user.creditBalance, 0));

    // Check which ones already have bonus
    let wouldGrant = 0;
    let alreadyHasBonus = 0;

    for (const u of usersWithZeroCredits) {
      const existingBonus = await db
        .select({ id: creditTransaction.id })
        .from(creditTransaction)
        .where(
          and(
            eq(creditTransaction.userId, u.id),
            eq(creditTransaction.type, "admin_grant"),
            sql`${creditTransaction.description} LIKE '%Welcome bonus%'`
          )
        )
        .limit(1);

      if (existingBonus.length > 0) {
        alreadyHasBonus++;
      } else {
        wouldGrant++;
      }
    }

    return NextResponse.json({
      message: "Dry run - no changes made",
      usersWithZeroCredits: usersWithZeroCredits.length,
      wouldGrant,
      alreadyHasBonus,
      hint: "POST to this endpoint to grant credits",
    });
  } catch (error) {
    console.error("Failed to check credits:", error);
    return NextResponse.json(
      { error: "Failed to check credits" },
      { status: 500 }
    );
  }
}
