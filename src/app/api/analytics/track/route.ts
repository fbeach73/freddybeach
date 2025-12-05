import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageView } from "@/lib/schema";
import { nanoid } from "nanoid";

interface TrackingData {
  path: string;
  referrer?: string | null;
  userAgent?: string | null;
  visitorHash?: string | null;
  isBot: boolean;
  botName?: string | null;
  sessionId?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const data: TrackingData = await request.json();

    // Insert page view
    await db.insert(pageView).values({
      id: nanoid(),
      path: data.path,
      referrer: data.referrer || null,
      userAgent: data.userAgent || null,
      visitorHash: data.visitorHash || null,
      isBot: data.isBot,
      botName: data.botName || null,
      sessionId: data.sessionId || null,
      deviceType: data.deviceType || null,
      browser: data.browser || null,
      os: data.os || null,
      country: data.country || null,
      region: data.region || null,
      city: data.city || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log but don't fail - analytics shouldn't break the site
    console.error("[Analytics] Failed to track page view:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
