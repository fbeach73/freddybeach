import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { business, businessTool } from "@/lib/schema";
import type { ToolAccessType } from "@/lib/auth/tool-access";

const VALID_ACCESS: ToolAccessType[] = ["free", "gifted", "trial", "paid"];

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const businessId = String(body?.businessId ?? "").trim();
  const toolSlug = String(body?.toolSlug ?? "").trim();
  const accessType = String(body?.accessType ?? "gifted") as ToolAccessType;
  const expiresAtRaw = body?.expiresAt ?? null;

  if (!businessId || !toolSlug) {
    return NextResponse.json(
      { error: "businessId and toolSlug required" },
      { status: 400 }
    );
  }
  if (!VALID_ACCESS.includes(accessType)) {
    return NextResponse.json({ error: "Invalid accessType" }, { status: 400 });
  }

  const [biz] = await db
    .select({ id: business.id })
    .from(business)
    .where(eq(business.id, businessId))
    .limit(1);
  if (!biz) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  let expiresAt: Date | null = null;
  if (expiresAtRaw) {
    const parsed = new Date(expiresAtRaw);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: "expiresAt must be a valid ISO date" },
        { status: 400 }
      );
    }
    expiresAt = parsed;
  }

  // Upsert: if a grant already exists for (business, tool), refresh it.
  const [existing] = await db
    .select({ id: businessTool.id })
    .from(businessTool)
    .where(
      and(
        eq(businessTool.businessId, businessId),
        eq(businessTool.toolSlug, toolSlug)
      )
    )
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(businessTool)
      .set({
        accessType,
        expiresAt,
        grantedBy: session.user.id,
        grantedAt: new Date(),
      })
      .where(eq(businessTool.id, existing.id))
      .returning();
    return NextResponse.json({ success: true, grant: updated });
  }

  const [created] = await db
    .insert(businessTool)
    .values({
      id: nanoid(),
      businessId,
      toolSlug,
      accessType,
      expiresAt,
      grantedBy: session.user.id,
    })
    .returning();

  return NextResponse.json({ success: true, grant: created });
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await db.delete(businessTool).where(eq(businessTool.id, id));
  return NextResponse.json({ success: true });
}
