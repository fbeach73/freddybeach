import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Bot detection patterns - common bot user agents
const BOT_PATTERNS = [
  // Search engines
  { pattern: /googlebot/i, name: "Googlebot" },
  { pattern: /bingbot/i, name: "Bingbot" },
  { pattern: /slurp/i, name: "Yahoo Slurp" },
  { pattern: /duckduckbot/i, name: "DuckDuckBot" },
  { pattern: /baiduspider/i, name: "Baiduspider" },
  { pattern: /yandexbot/i, name: "YandexBot" },
  // Social media
  { pattern: /facebookexternalhit/i, name: "Facebook" },
  { pattern: /twitterbot/i, name: "Twitter" },
  { pattern: /linkedinbot/i, name: "LinkedIn" },
  { pattern: /pinterest/i, name: "Pinterest" },
  { pattern: /slackbot/i, name: "Slackbot" },
  { pattern: /telegrambot/i, name: "Telegram" },
  { pattern: /whatsapp/i, name: "WhatsApp" },
  // SEO & monitoring tools
  { pattern: /semrushbot/i, name: "SEMrush" },
  { pattern: /ahrefsbot/i, name: "Ahrefs" },
  { pattern: /mj12bot/i, name: "Majestic" },
  { pattern: /dotbot/i, name: "DotBot" },
  { pattern: /rogerbot/i, name: "Moz" },
  { pattern: /screaming frog/i, name: "Screaming Frog" },
  // Uptime & monitoring
  { pattern: /uptimerobot/i, name: "UptimeRobot" },
  { pattern: /pingdom/i, name: "Pingdom" },
  { pattern: /statuscake/i, name: "StatusCake" },
  // AI & other bots
  { pattern: /gptbot/i, name: "GPTBot" },
  { pattern: /chatgpt/i, name: "ChatGPT" },
  { pattern: /claudebot/i, name: "ClaudeBot" },
  { pattern: /anthropic/i, name: "Anthropic" },
  { pattern: /ccbot/i, name: "CCBot" },
  { pattern: /bytespider/i, name: "ByteSpider" },
  // Generic bot patterns
  { pattern: /bot\b/i, name: "Generic Bot" },
  { pattern: /crawler/i, name: "Crawler" },
  { pattern: /spider/i, name: "Spider" },
  { pattern: /scraper/i, name: "Scraper" },
  { pattern: /headless/i, name: "Headless Browser" },
  { pattern: /phantom/i, name: "PhantomJS" },
  { pattern: /selenium/i, name: "Selenium" },
  { pattern: /puppeteer/i, name: "Puppeteer" },
  { pattern: /playwright/i, name: "Playwright" },
];

// Detect if user agent is a bot
function detectBot(userAgent: string | null): { isBot: boolean; botName: string | null } {
  if (!userAgent) {
    return { isBot: false, botName: null };
  }

  for (const { pattern, name } of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return { isBot: true, botName: name };
    }
  }

  return { isBot: false, botName: null };
}

// Parse device type from user agent
function getDeviceType(userAgent: string | null): string {
  if (!userAgent) return "unknown";

  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  return "desktop";
}

// Parse browser from user agent
function getBrowser(userAgent: string | null): string {
  if (!userAgent) return "unknown";

  if (/edg/i.test(userAgent)) return "Edge";
  if (/chrome/i.test(userAgent)) return "Chrome";
  if (/firefox/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent)) return "Safari";
  if (/opera|opr/i.test(userAgent)) return "Opera";
  return "Other";
}

// Parse OS from user agent
function getOS(userAgent: string | null): string {
  if (!userAgent) return "unknown";

  if (/windows/i.test(userAgent)) return "Windows";
  if (/mac os|macos/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";
  if (/android/i.test(userAgent)) return "Android";
  if (/ios|iphone|ipad/i.test(userAgent)) return "iOS";
  return "Other";
}

// Simple hash function for visitor identification (privacy-friendly)
async function hashVisitor(ip: string, userAgent: string | null): Promise<string> {
  const data = `${ip}-${userAgent || ""}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

// Paths to exclude from tracking
const EXCLUDED_PATHS = [
  "/_next", // Next.js internals
  "/api/analytics", // Analytics API (prevent infinite loop)
  "/favicon", // Favicon
  "/.well-known", // Well-known URIs
];

// File extensions to exclude
const EXCLUDED_EXTENSIONS = [
  ".js", ".css", ".map", ".json", ".xml", ".txt", ".ico", ".png", ".jpg",
  ".jpeg", ".gif", ".svg", ".webp", ".woff", ".woff2", ".ttf", ".eot"
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip excluded paths
  if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Skip file extensions
  if (EXCLUDED_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
    return NextResponse.next();
  }

  // Get request info
  const userAgent = request.headers.get("user-agent");
  const referrer = request.headers.get("referer") || request.headers.get("referrer");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
             request.headers.get("x-real-ip") ||
             "unknown";

  // Get Vercel geo headers (free with Vercel deployment)
  const country = request.headers.get("x-vercel-ip-country") || null;
  const region = request.headers.get("x-vercel-ip-country-region") || null;
  const city = request.headers.get("x-vercel-ip-city") || null;

  // Detect bot
  const { isBot, botName } = detectBot(userAgent);

  // Generate visitor hash and session ID
  const visitorHash = await hashVisitor(ip, userAgent);

  // Get or create session ID from cookie
  const response = NextResponse.next();
  let sessionId = request.cookies.get("fb_session")?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    response.cookies.set("fb_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  // Send analytics data to API endpoint asynchronously (don't block the response)
  const analyticsData = {
    path: pathname,
    referrer,
    userAgent,
    visitorHash,
    isBot,
    botName,
    sessionId,
    deviceType: getDeviceType(userAgent),
    browser: getBrowser(userAgent),
    os: getOS(userAgent),
    country,
    region,
    city,
  };

  // Fire and forget - don't await
  const baseUrl = request.nextUrl.origin;
  fetch(`${baseUrl}/api/analytics/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(analyticsData),
  }).catch(() => {
    // Silently ignore errors - analytics shouldn't break the site
  });

  return response;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Match all paths except static files and API routes we want to exclude
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
