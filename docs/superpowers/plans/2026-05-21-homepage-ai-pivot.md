# Homepage AI-Pivot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the FreddyBeach homepage around the Review Collector tool for Atlantic Canada SMBs, refocus `/ai-tools` as a single-funnel page, broaden SEO/JSON-LD to the right region, and remove all fabricated stats — in four logical commits.

**Architecture:** New homepage composes seven focused, single-purpose section components (one shared with `/ai-tools` — the interactive demo widget). `generateHomepageSchema()` produces `Organization` + `WebSite` + `SoftwareApplication` + `FAQPage` JSON-LD with `areaServed` expanded to four Atlantic provinces. `/ai-tools` reorders so demos precede pricing; logged-in dashboard view is unchanged. Four files become unused after the refactor and are deleted.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Lucide icons · Better Auth (existing `AuthDialog`). No new deps.

**Source spec:** `docs/superpowers/specs/2026-05-21-homepage-ai-pivot-design.md`

**Verification gate (run between every commit):**
- `pnpm lint` — must pass
- `pnpm typecheck` — must pass
- Manual: `pnpm dev`, walk the affected pages (specified per phase)

**Hard rule from user:** Never auto-commit. Each "Commit" step is a checkpoint — pause for explicit user "ok to commit" before running `git commit`.

---

## Phase 1 · Commit 1: Review Collector demo widget

A single new client component that renders an inbox-style email preview, five star buttons, and animates between three states (initial / Google branch / private feedback branch). No backend, no auth, pure client state.

**Files:**
- Create: `src/components/home/review-collector-demo-widget.tsx`

### Task 1.1: Scaffold the widget with state machine + initial view

- [ ] **Step 1: Create the file with the three-state component skeleton**

Write `src/components/home/review-collector-demo-widget.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Mail, Star, ArrowRight, MessageSquare, RotateCcw } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";

type DemoState = "initial" | "google-branch" | "feedback-branch";

export function ReviewCollectorDemoWidget() {
  const [state, setState] = useState<DemoState>("initial");
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleStarClick = (n: number) => {
    setState(n >= 4 ? "google-branch" : "feedback-branch");
  };

  const reset = () => {
    setState("initial");
    setHoveredStar(null);
  };

  return (
    <div className="relative">
      <div className="nb-card bg-card p-6 space-y-4">
        {/* Sample inbox preview */}
        <div className="border-2 border-nb-border bg-background p-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Mail className="h-3.5 w-3.5" />
            <span>Sample Business &lt;hello@samplebusiness.ca&gt;</span>
          </div>
          <p className="mt-2 font-bold">Quick favor — how did we do?</p>
          <p className="mt-1 text-muted-foreground">
            Hi there — thanks for stopping by today. Could you take 5 seconds to rate your visit?
          </p>
          <div className="mt-3">
            <span className="inline-block nb-btn bg-nb-yellow text-black px-4 py-2 text-xs font-bold">
              Rate your visit
            </span>
          </div>
        </div>

        {/* Stars + branch state — fills in next tasks */}
        {state === "initial" && (
          <StarRow
            hovered={hoveredStar}
            onHover={setHoveredStar}
            onClick={handleStarClick}
          />
        )}
        {state === "google-branch" && <GoogleBranch onReset={reset} />}
        {state === "feedback-branch" && <FeedbackBranch onReset={reset} />}

        {/* Persistent CTA pill */}
        <AuthDialog defaultTab="sign-up">
          <button className="block w-full text-center text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground py-2">
            This is a demo — try the real thing free →
          </button>
        </AuthDialog>
      </div>
    </div>
  );
}

function StarRow({
  hovered,
  onHover,
  onClick,
}: {
  hovered: number | null;
  onHover: (n: number | null) => void;
  onClick: (n: number) => void;
}) {
  return (
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
        Tap a star — see what happens
      </p>
      <div className="flex justify-center gap-1" onMouseLeave={() => onHover(null)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => onHover(n)}
            onClick={() => onClick(n)}
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={
                hovered !== null && n <= hovered
                  ? "h-10 w-10 fill-nb-yellow text-nb-yellow"
                  : "h-10 w-10 text-muted-foreground"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function GoogleBranch({ onReset }: { onReset: () => void }) {
  return (
    <div className="border-2 border-nb-border bg-nb-yellow/20 p-4 text-sm space-y-3">
      <div className="flex items-center gap-2 font-bold">
        <ArrowRight className="h-4 w-4" />
        Going to Google
      </div>
      <p className="text-muted-foreground">
        4–5★ customers see your Google review page right away.
      </p>
      <div className="inline-block nb-btn bg-white text-black border-2 border-nb-border px-3 py-2 text-xs font-bold">
        ★★★★★ Leave a Google review →
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="gap-1 text-xs"
      >
        <RotateCcw className="h-3 w-3" />
        Reset demo
      </Button>
    </div>
  );
}

function FeedbackBranch({ onReset }: { onReset: () => void }) {
  return (
    <div className="border-2 border-nb-border bg-background p-4 text-sm space-y-3">
      <div className="flex items-center gap-2 font-bold">
        <MessageSquare className="h-4 w-4" />
        Private feedback — to your inbox
      </div>
      <p className="text-muted-foreground">
        1–3★ customers see a private feedback form. The Google link is still visible (no review gating).
      </p>
      <textarea
        disabled
        placeholder="Tell us what went wrong… (demo only)"
        className="w-full border-2 border-nb-border bg-muted/30 p-2 text-xs"
        rows={3}
      />
      <p className="text-xs text-muted-foreground">
        Or still leave a public review:{" "}
        <span className="underline">★★★★★ Open Google →</span>
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="gap-1 text-xs"
      >
        <RotateCcw className="h-3 w-3" />
        Reset demo
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS (no errors).

- [ ] **Step 3: Drop the widget into the existing hero temporarily to smoke-test**

Edit `src/app/page.tsx` to import and render the widget under `<AIHeroSection />` (just for testing — will be removed in Phase 2):

```tsx
import { ReviewCollectorDemoWidget } from "@/components/home/review-collector-demo-widget";
// inside JSX, after <AIHeroSection />:
<div className="container mx-auto px-4 my-12 max-w-md">
  <ReviewCollectorDemoWidget />
</div>
```

- [ ] **Step 4: Manually verify the widget**

Run: `pnpm dev`
Open: http://localhost:3000

Verify:
1. Five-star row visible under the placeholder email preview
2. Hover star 3 → first 3 stars fill yellow
3. Click star 5 → animates to the "Going to Google" panel
4. Click "Reset demo" → returns to star row
5. Click star 2 → animates to "Private feedback" panel with the disabled textarea visible AND the "Or still leave a public review" Google link visible (compliance check)
6. Click the bottom "This is a demo" pill → AuthDialog opens to the sign-up tab
7. No console errors

- [ ] **Step 5: Revert the smoke-test changes to page.tsx**

`git restore src/app/page.tsx` (or undo the temporary edit). The widget file stays; the import in `page.tsx` goes away.

- [ ] **Step 6: Verify revert**

Run: `git diff src/app/page.tsx`
Expected: no output (file matches HEAD).

- [ ] **Step 7: Stage + ask for commit approval**

```bash
git add src/components/home/review-collector-demo-widget.tsx
git status
```

Show staged file list to user. **Wait for "ok to commit" before running:**

```bash
git commit -m "feat: review collector demo widget" -m "Self-contained client component used by both the homepage hero and /ai-tools.
Renders a sample customer email + 5-star buttons; tapping 4-5 stars animates
to a Google-link panel, tapping 1-3 stars animates to a private feedback
panel (with Google link still visible per policy). No backend, no auth.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 2 · Commit 2: Homepage AI-pivot

The biggest phase. Creates six new components, rewrites `page.tsx`, updates `layout.tsx` metadata, and overhauls `generateHomepageSchema()`.

### Task 2.1: Trust strip component

**Files:**
- Create: `src/components/home/trust-strip.tsx`

- [ ] **Step 1: Write the component**

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Business } from "@/lib/types";

interface TrustStripProps {
  businesses: Business[];
}

export function TrustStrip({ businesses }: TrustStripProps) {
  if (businesses.length === 0) return null;

  const visible = businesses.slice(0, 12);

  return (
    <section className="py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
        Trusted by Atlantic Canada businesses
      </p>
      <div className="flex flex-wrap gap-2">
        {visible.map((b) => (
          <Link
            key={b.id}
            href={`/${b.categorySlug}/${b.slug}`}
            className="inline-flex items-center border-2 border-nb-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-nb-yellow hover:text-black transition-colors"
          >
            {b.name}
          </Link>
        ))}
        <Link
          href="/businesses"
          className="inline-flex items-center gap-1 border-2 border-nb-border bg-nb-yellow text-black px-3 py-1.5 text-sm font-bold hover:bg-nb-yellow/80"
        >
          See the full directory <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: PASS.

### Task 2.2: How-it-works component

**Files:**
- Create: `src/components/home/how-it-works.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Mail, Star, Inbox } from "lucide-react";

const STEPS = [
  {
    icon: Mail,
    title: "1. Send",
    body: "Paste customer email, hit send. Branded request goes out in seconds.",
  },
  {
    icon: Star,
    title: "2. Customer rates",
    body: "One tap on five stars. Branches automatically based on the rating.",
  },
  {
    icon: Inbox,
    title: "3. You get the result",
    body: "Public Google review, or private feedback emailed straight to you.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-12">
      <div className="mb-8">
        <div className="w-16 h-2 bg-nb-blue mb-4" />
        <h2 className="text-2xl md:text-3xl font-black uppercase">
          How it works
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.title} className="nb-card bg-card p-6">
            <s.icon className="h-8 w-8 mb-3" />
            <h3 className="font-bold text-lg mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: PASS.

### Task 2.3: Outcome + compliance component

**Files:**
- Create: `src/components/home/outcome-compliance.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { ShieldCheck } from "lucide-react";

export function OutcomeCompliance() {
  return (
    <section className="py-12">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="nb-card bg-card p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
            What changes
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span aria-hidden>→</span>
              <span>More 5★ reviews from your existing customer base — no new marketing.</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>→</span>
              <span>Unhappy customers email you privately instead of posting publicly.</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>→</span>
              <span>Owner sees ratings + feedback in one dashboard.</span>
            </li>
          </ul>
        </div>
        <div className="nb-card bg-nb-yellow/30 p-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-xs font-bold uppercase tracking-wide">
              Google-policy compliant
            </p>
          </div>
          <p className="text-sm">
            The public Google review link is shown on every screen — even the private feedback path.
            No review gating.
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: PASS.

### Task 2.4: Lighter tools grid component

**Files:**
- Create: `src/components/home/lighter-tools-grid.tsx`

- [ ] **Step 1: Write the component**

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { aiTools } from "@/lib/data/ai-tools";

const HIGHLIGHTED_SLUGS = [
  "review-responder",
  "social-post-generator",
  "image-generator",
];

export function LighterToolsGrid() {
  const tools = aiTools.filter((t) => HIGHLIGHTED_SLUGS.includes(t.slug));
  if (tools.length === 0) return null;

  return (
    <section className="py-12">
      <div className="mb-8">
        <div className="w-16 h-2 bg-nb-green mb-4" />
        <h2 className="text-2xl md:text-3xl font-black uppercase">
          More tools as you grow
        </h2>
        <p className="mt-2 text-muted-foreground">
          Every FreddyBeach account also gets:
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.id}
            href={`/ai-tools/${t.slug}`}
            className="nb-card bg-card p-5 group hover:bg-muted/50 transition-colors"
          >
            <h3 className="font-bold mb-1">{t.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t.shortDescription}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide">
              Open <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Verify `image-generator` is in `ai-tools.ts`**

Run: `grep -n "\"image-generator\"" src/lib/data/ai-tools.ts`
Expected: a match. If no match, replace `"image-generator"` in `HIGHLIGHTED_SLUGS` above with the first available `slug` in `aiTools` that isn't `review-collector` (verify with `grep "slug:" src/lib/data/ai-tools.ts`).

### Task 2.5: Homepage FAQ component (with schema export)

**Files:**
- Create: `src/components/home/homepage-faq.tsx`

- [ ] **Step 1: Write the component + schema helper**

```tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FaqEntity {
  question: string;
  answer: string;
}

export const HOMEPAGE_FAQ: FaqEntity[] = [
  {
    question: "Is this Google-policy compliant? I've heard about review gating.",
    answer:
      "Yes. The public Google review link is visible on every screen, including the private feedback path. We never block any customer from leaving a public review — we just route them to the right place based on their rating.",
  },
  {
    question: "Who is FreddyBeach for?",
    answer:
      "Atlantic Canada small businesses: trades, dentists, auto repair, home services, restaurants, retail — anyone whose reputation lives on Google reviews and who doesn't have time to build review-request workflows from scratch.",
  },
  {
    question: "What happens if a customer leaves negative feedback?",
    answer:
      "It comes straight to your inbox as private feedback, not to your public Google profile. You see what went wrong, you can fix it, and you can choose to follow up with the customer directly.",
  },
  {
    question: "What's free vs paid?",
    answer:
      "The Review Collector is free for pilot businesses we're working with directly. Other AI tools (image generation, social posts, review replies) are available to all signed-up users. Paid tiers add higher generation limits and featured directory placement.",
  },
  {
    question: "Can I use my regular Gmail for sending review requests?",
    answer:
      "Yes. Requests are sent from FreddyBeach on your behalf using your business's branding, so you don't need to configure SMTP or connect a Gmail account.",
  },
];

export function getHomepageFaqEntities() {
  return HOMEPAGE_FAQ.map((qa) => ({
    "@type": "Question",
    name: qa.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: qa.answer,
    },
  }));
}

export function HomepageFaq() {
  return (
    <section className="py-12">
      <div className="mb-8">
        <div className="w-16 h-2 bg-nb-orange mb-4" />
        <h2 className="text-2xl md:text-3xl font-black uppercase">
          Frequently asked
        </h2>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {HOMEPAGE_FAQ.map((qa, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left font-bold">
              {qa.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {qa.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: PASS.

### Task 2.6: Update `generateHomepageSchema`

**Files:**
- Modify: `src/lib/seo/json-ld.ts` (function `generateHomepageSchema` at line 287)

- [ ] **Step 1: Replace the function body**

Find the existing `generateHomepageSchema()` function (line 287, ends ~line 324). Replace the entire function with:

```ts
/**
 * Generate Organization + WebSite + SoftwareApplication + FAQPage schema for the homepage
 * @see https://developers.google.com/search/docs/appearance/structured-data/organization
 */
export function generateHomepageSchema(
  faqEntities?: ReturnType<typeof import("@/components/home/homepage-faq").getHomepageFaqEntities>
) {
  return JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: PUBLISHER_LOGO,
      description:
        "AI tools and automation for Atlantic Canada small business. Turn happy customers into 5-star Google reviews, generate marketing images and social posts, and reply to reviews — all in one place.",
      areaServed: [
        { "@type": "AdministrativeArea", name: "New Brunswick" },
        { "@type": "AdministrativeArea", name: "Nova Scotia" },
        { "@type": "AdministrativeArea", name: "Prince Edward Island" },
        { "@type": "AdministrativeArea", name: "Newfoundland and Labrador" },
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Fredericton",
        addressRegion: "NB",
        addressCountry: "CA",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "FreddyBeach Review Collector",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${SITE_URL}/ai-tools/review-collector`,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "CAD",
      },
    },
    ...(faqEntities && faqEntities.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqEntities,
          },
        ]
      : []),
  ]);
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: PASS.

### Task 2.7: Rewrite `page.tsx` to compose the new sections

**Files:**
- Modify: `src/app/page.tsx` (full rewrite)

- [ ] **Step 1: Replace the file contents**

```tsx
import { Sparkles } from "lucide-react";
import { generateHomepageSchema } from "@/lib/seo/json-ld";
import { getFeaturedBusinessesFromDb } from "@/lib/data/businesses-db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { ReviewCollectorDemoWidget } from "@/components/home/review-collector-demo-widget";
import { TrustStrip } from "@/components/home/trust-strip";
import { HowItWorks } from "@/components/home/how-it-works";
import { OutcomeCompliance } from "@/components/home/outcome-compliance";
import { LighterToolsGrid } from "@/components/home/lighter-tools-grid";
import { ConsultationCTA } from "@/components/home/consultation-cta";
import {
  HomepageFaq,
  getHomepageFaqEntities,
} from "@/components/home/homepage-faq";

export const revalidate = 60;

export default async function Home() {
  const featuredBusinesses = await getFeaturedBusinessesFromDb();
  const jsonLd = generateHomepageSchema(getHomepageFaqEntities());

  return (
    <div className="flex-1 bg-nb-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <div className="container mx-auto px-4">
        {/* Section A · Hero */}
        <section className="py-12 md:py-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6">
              <Badge className="nb-badge bg-nb-yellow text-black gap-1.5">
                <Sparkles className="h-3 w-3" />
                Review Collector · Live now
              </Badge>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl uppercase">
                Turn happy customers into 5★ Google reviews.
              </h1>
              <p className="text-lg text-foreground font-medium md:text-xl">
                Send a one-tap review request after every job. Happy customers
                go to Google. Unhappy ones stay private — and email you instead.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <AuthDialog defaultTab="sign-up">
                  <Button
                    size="lg"
                    className="nb-btn bg-nb-yellow text-black px-8 py-6 gap-2 hover:bg-nb-yellow"
                  >
                    <Sparkles className="h-4 w-4" />
                    Try it free
                  </Button>
                </AuthDialog>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="nb-btn bg-background px-8 py-6"
                >
                  <a href="#rc-demo">See it in 60 seconds</a>
                </Button>
              </div>
            </div>
            <div id="rc-demo" className="max-w-md mx-auto w-full lg:max-w-none">
              <ReviewCollectorDemoWidget />
            </div>
          </div>
        </section>

        {/* Section B · Trust strip */}
        <TrustStrip businesses={featuredBusinesses} />

        {/* Section C · How it works */}
        <HowItWorks />

        {/* Section D · Outcome + compliance */}
        <OutcomeCompliance />

        {/* Section E · Lighter tools grid */}
        <LighterToolsGrid />
      </div>

      {/* Section F · Consultation tier (full width) */}
      <ConsultationCTA />

      <div className="container mx-auto px-4">
        {/* Section G · FAQ */}
        <HomepageFaq />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

### Task 2.8: Update layout metadata

**Files:**
- Modify: `src/app/layout.tsx` (lines 28-55)

- [ ] **Step 1: Replace the metadata block**

Replace the entire `export const metadata: Metadata = { ... };` block with:

```ts
export const metadata: Metadata = {
  title: "FreddyBeach — AI tools that grow Atlantic Canada small businesses",
  description:
    "Turn happy customers into 5-star Google reviews, generate marketing images and social posts, and reply to reviews — all in one place. Free trial. Trusted by Atlantic Canada small businesses.",
  metadataBase: new URL("https://freddybeach.com"),
  openGraph: {
    title: "FreddyBeach — AI tools that grow Atlantic Canada small businesses",
    description:
      "Turn happy customers into 5-star Google reviews, generate marketing images and social posts, and reply to reviews — all in one place. Free trial. Trusted by Atlantic Canada small businesses.",
    url: "https://freddybeach.com",
    siteName: "FreddyBeach",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FreddyBeach — AI tools that grow Atlantic Canada small businesses",
    description:
      "Turn happy customers into 5-star Google reviews and grow your Atlantic Canada small business.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
};
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

### Task 2.9: Update ConsultationCTA copy

**Files:**
- Modify: `src/components/home/consultation-cta.tsx`

- [ ] **Step 1: Replace the H2 + sub + remove the fake stat**

Find:

```tsx
<h2 className="text-3xl font-black tracking-tight md:text-4xl lg:text-5xl uppercase text-black">
  Ready to Transform Your Business with AI?
</h2>

<p className="mt-6 text-lg text-black/80 font-medium md:text-xl max-w-2xl mx-auto">
  Book a free 30-minute consultation with our team. We&apos;ll show you
  how AI tools can save you time and grow your business.
</p>
```

Replace with:

```tsx
<h2 className="text-3xl font-black tracking-tight md:text-4xl lg:text-5xl uppercase text-black">
  Want this set up FOR you?
</h2>

<p className="mt-6 text-lg text-black/80 font-medium md:text-xl max-w-2xl mx-auto">
  We do the integration, the email writing, and the first 30 days of monitoring — starting at $5K. Book a 15-minute call.
</p>
```

Also find the trust-signal row (currently 3 pills) and remove the fabricated middle stat ("50+ local businesses helped"). Replace:

```tsx
<div className="flex items-center gap-2 border-2 border-black bg-white/90 px-4 py-2">
  <Users className="h-4 w-4 text-black" />
  <span className="font-bold text-black">50+ local businesses helped</span>
</div>
```

With:

```tsx
<div className="flex items-center gap-2 border-2 border-black bg-white/90 px-4 py-2">
  <Users className="h-4 w-4 text-black" />
  <span className="font-bold text-black">Atlantic Canada small business</span>
</div>
```

Also update the button label from "Book a Free Consultation" to "Book a 15-min call":

Find `Book a Free Consultation` → replace with `Book a 15-min call`.

- [ ] **Step 2: Verify**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

### Task 2.10: Phase 2 verification gate

- [ ] **Step 1: Run static gates**

```bash
pnpm lint && pnpm typecheck
```

Expected: PASS.

- [ ] **Step 2: Manual browser walkthrough**

Run: `pnpm dev`
Open: http://localhost:3000

Verify:
1. Hero has new H1 "Turn happy customers into 5★ Google reviews." (no "AI Images" wording anywhere)
2. Hero right column: the demo widget renders + 5-star branching works
3. "See it in 60 seconds" secondary CTA smooth-scrolls to / highlights the demo widget
4. Trust strip below the hero shows business-name pills, each linking into the directory
5. How-it-works 3-card grid renders
6. Outcome + compliance two-up renders
7. "More tools as you grow" grid shows 3 tools
8. Consultation CTA shows new H2 + sub + button label, no "50+ local businesses helped"
9. FAQ accordion expands/collapses
10. View page source: `application/ld+json` script contains `Organization` + `WebSite` + `SoftwareApplication` + `FAQPage` blocks
11. No console errors

- [ ] **Step 3: Validate JSON-LD**

Open the deployed homepage source. Copy the JSON inside `<script type="application/ld+json">`. Paste into https://search.google.com/test/rich-results — confirm all four schema entries parse without errors.

(For local-only validation: paste the rendered JSON into https://validator.schema.org/.)

- [ ] **Step 4: Stage + ask for commit approval**

```bash
git add src/components/home/trust-strip.tsx \
        src/components/home/how-it-works.tsx \
        src/components/home/outcome-compliance.tsx \
        src/components/home/lighter-tools-grid.tsx \
        src/components/home/homepage-faq.tsx \
        src/components/home/consultation-cta.tsx \
        src/lib/seo/json-ld.ts \
        src/app/page.tsx \
        src/app/layout.tsx
git status
```

Show staged file list to user. **Wait for "ok to commit" before running:**

```bash
git commit -m "feat: homepage AI-pivot to Review Collector hero" -m "Replaces the 'Create Stunning AI Images' hero with an outcome-led hero
('Turn happy customers into 5-star Google reviews.') and the new interactive
demo widget. Adds trust strip, how-it-works, outcome+compliance,
lighter tools grid, and FAQ accordion (FAQ also emits FAQPage JSON-LD).
Broadens generateHomepageSchema areaServed to all four Atlantic provinces
and adds SoftwareApplication for Review Collector. Fixes metadataBase
from fbeach.vercel.app to freddybeach.com. ConsultationCTA copy rewritten
and a fabricated stat removed.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 3 · Commit 3: `/ai-tools` single-funnel refactor

### Task 3.1: Logged-out hero rewrite + logged-in H1 tweak

**Files:**
- Modify: `src/app/ai-tools/page.tsx`

- [ ] **Step 1: Update the logged-out `SectionHero`**

Find the existing `SectionHero` usage (lines ~220-231) and replace with:

```tsx
<SectionHero
  title="Your AI toolkit for Atlantic Canada small business."
  subtitle="Start with the Review Collector — turn happy customers into 5★ Google reviews. Then add image generation, social posts, and review replies as you grow."
  badges={["Free Tools Available", "No Credit Card Required"]}
  gradient
  primaryCTA={{
    text: "Try Review Collector free",
    href: "/ai-tools/review-collector",
  }}
  secondaryCTA={{
    text: "See all 5 tools",
    href: "#all-tools",
  }}
/>
```

- [ ] **Step 2: Update the logged-in H1 + sub**

Find (around line 137):

```tsx
<h1 className="text-2xl font-bold uppercase">AI Tools</h1>
<p className="text-muted-foreground">
  Powerful AI-powered tools to grow your business
</p>
```

Replace with:

```tsx
<h1 className="text-2xl font-bold uppercase">Your toolkit</h1>
<p className="text-muted-foreground">
  Pick up where you left off, or try something new.
</p>
```

- [ ] **Step 3: Update page metadata**

Find the existing `export const metadata: Metadata = { ... };` block (lines 21-30). Replace with:

```ts
export const metadata: Metadata = {
  title: "AI Tools for Atlantic Canada Small Business | FreddyBeach",
  description:
    "Five AI-powered tools built for Atlantic Canada small businesses. Start with the Review Collector — turn happy customers into 5-star Google reviews. Free to try.",
  openGraph: {
    title: "AI Tools for Atlantic Canada Small Business | FreddyBeach",
    description:
      "Five AI-powered tools built for Atlantic Canada small businesses. Free to try.",
  },
};
```

- [ ] **Step 4: Verify**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

### Task 3.2: Prepend Review Collector demo + reorder pricing

**Files:**
- Modify: `src/app/ai-tools/page.tsx`
- Modify: `src/app/ai-tools/ai-tools-showcase.tsx`

- [ ] **Step 1: In `page.tsx`, move the pricing block below `AIToolsShowcase`**

Currently the order is:
1. `{isAuthenticated && ...}` dashboard
2. `{!isAuthenticated && <SectionHero />}`
3. `<section id="pricing">` ... `<AIPricingSection />`
4. `<AIToolsShowcase />`

Change to:
1. `{isAuthenticated && ...}` dashboard
2. `{!isAuthenticated && <SectionHero />}`
3. `<AIToolsShowcase />` — now includes the RC demo at the top (Step 2)
4. `<section id="pricing">` ... `<AIPricingSection />` — moved here

Move the `<section id="pricing">` JSX block (currently lines ~234-248) so it appears AFTER the `<AIToolsShowcase />` call. The id="pricing" anchor must stay so existing in-page hash links keep working.

- [ ] **Step 2: In `ai-tools-showcase.tsx`, prepend the RC demo section**

At the top of the JSX returned by `AIToolsShowcase()` (inside the existing fragment, before the first `<section>`), add:

```tsx
{/* Review Collector demo — single funnel anchor */}
<section className="py-16 md:py-24 border-b-2 border-nb-border">
  <div className="container mx-auto px-4">
    <div className="mx-auto mb-8 max-w-2xl text-center">
      <div className="h-2 bg-nb-yellow border-2 border-nb-border mb-6 mx-auto max-w-xs" />
      <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl uppercase">
        Try the Review Collector
      </h2>
      <p className="text-muted-foreground">
        Tap a star — see what your customers will see. No sign-up required.
      </p>
    </div>
    <div className="mx-auto max-w-md">
      <ReviewCollectorDemoWidget />
    </div>
  </div>
</section>
```

Add the import at the top of `ai-tools-showcase.tsx`:

```tsx
import { ReviewCollectorDemoWidget } from "@/components/home/review-collector-demo-widget";
```

- [ ] **Step 3: Add `id="all-tools"` to the existing "All AI Tools" section**

In `ai-tools-showcase.tsx`, find:

```tsx
{/* All Tools Grid Section */}
<section className="py-16 md:py-24">
```

Change to:

```tsx
{/* All Tools Grid Section */}
<section id="all-tools" className="py-16 md:py-24">
```

(This is the anchor target for the hero's "See all 5 tools" secondary CTA.)

- [ ] **Step 4: Verify**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

### Task 3.3: Remove fabricated bottom-CTA stats + rewrite headline

**Files:**
- Modify: `src/app/ai-tools/ai-tools-showcase.tsx`

- [ ] **Step 1: Update the bottom `CTASection` props**

Find the existing `<CTASection>` block (lines ~86-102) and replace with:

```tsx
<CTASection
  headline="Ready to put AI to work?"
  subheadline="Start free with the Review Collector. Add other tools as you grow."
  primaryCTA={{
    text: "Try it free",
    href: "/claim",
  }}
  secondaryCTA={{
    text: "Book a Consultation",
    href: "/consultation",
  }}
/>
```

(The `stats` prop is already optional in `cta-section.tsx:25` and the JSX already guards with `{stats && stats.length > 0 && ...}` at line 74, so omitting it just removes the trust-signals row.)

- [ ] **Step 2: Verify**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

### Task 3.4: Refresh stale pricing copy

**Files:**
- Modify: `src/lib/data/packages.ts` (lines ~92-153)

- [ ] **Step 1: Update the Enhanced tier features**

Find:

```ts
features: [
  "Enhanced business listing",
  "Priority placement in search",
  "All 4 AI tools unlocked",
  "100 AI generations per month",
  "Business Description Writer",
  "Email Template Generator",
  "Analytics dashboard",
  "Email support",
],
```

Replace with:

```ts
features: [
  "Enhanced business listing",
  "Priority placement in search",
  "All current AI tools unlocked",
  "100 AI generations per month",
  "Business Description Writer (coming soon)",
  "Email Template Generator (coming soon)",
  "Analytics dashboard",
  "Email support",
],
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

### Task 3.5: Phase 3 verification gate

- [ ] **Step 1: Run static gates**

```bash
pnpm lint && pnpm typecheck
```

Expected: PASS.

- [ ] **Step 2: Manual browser walkthrough**

Run: `pnpm dev`

**Logged-out `/ai-tools`:** http://localhost:3000/ai-tools
1. Hero shows new H1 "Your AI toolkit for Atlantic Canada small business."
2. Hero primary CTA "Try Review Collector free" → `/ai-tools/review-collector`
3. Hero secondary CTA "See all 5 tools" → smooth-scrolls to `#all-tools`
4. Below hero: Review Collector demo widget (Phase 1 component, reused). Tap stars to verify both branches work.
5. Then: existing two interactive demos (Review Responder + Social Post)
6. Then: All AI Tools grid (with `id="all-tools"`)
7. Then: Pricing section (moved below the demos)
8. Bottom CTA: "Ready to put AI to work?" — no "500+ Businesses Helped / 2,000+ Hours Saved" stats

**Logged-in `/ai-tools`:** sign in, then visit the same URL
1. Top dashboard section: H1 says "Your toolkit", sub says "Pick up where you left off, or try something new."
2. Usage card + Quick Access grid render unchanged
3. Scroll below: same logged-out experience appears in the page tail (this is intentional — the existing layout)

- [ ] **Step 3: Stage + ask for commit approval**

```bash
git add src/app/ai-tools/page.tsx \
        src/app/ai-tools/ai-tools-showcase.tsx \
        src/lib/data/packages.ts
git status
```

Show staged file list to user. **Wait for "ok to commit" before running:**

```bash
git commit -m "refactor: /ai-tools single-funnel page" -m "Logged-out hero rewritten to a toolkit framing that funnels into Review
Collector. RC demo prepended at the top of the showcase. Pricing moved
below the demos (classic funnel order). All fabricated stats removed
from the bottom CTA. Logged-in H1 + sub tightened. Stale 'All 4 AI tools'
copy in packages.ts refreshed.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase 4 · Commit 4: AI crawlers, llms.txt, cleanup

### Task 4.1: Create `robots.txt`

**Files:**
- Create: `public/robots.txt`

- [ ] **Step 1: Write the file**

```
# FreddyBeach robots.txt

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/

# Explicitly allow AI/LLM crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://freddybeach.com/sitemap.xml
```

- [ ] **Step 2: Verify**

Run: `pnpm dev`
Open: http://localhost:3000/robots.txt
Expected: the file contents render verbatim.

### Task 4.2: Create `llms.txt`

**Files:**
- Create: `public/llms.txt`

- [ ] **Step 1: Write the file**

```
# FreddyBeach

> AI tools and automation for Atlantic Canada small business. Turn happy customers into 5-star Google reviews, generate marketing images and social posts, and reply to reviews — all in one place. Also home to a Fredericton, NB business directory.

## Primary pages

- [Homepage](https://freddybeach.com/): Product overview, hero tool (Review Collector), and how it works.
- [Review Collector](https://freddybeach.com/ai-tools/review-collector): The hero tool — sends customers a one-tap review request and branches happy vs. unhappy responses.
- [AI Tools overview](https://freddybeach.com/ai-tools): Full toolkit listing — review responder, social posts, image generator, business description writer, email templates.

## Directory

- [Fredericton business directory](https://freddybeach.com/businesses): Browse all listed Fredericton, NB businesses.
- [Restaurants](https://freddybeach.com/restaurants)
- [Services](https://freddybeach.com/services)
- [Retail](https://freddybeach.com/retail)
```

- [ ] **Step 2: Verify the directory category slugs match real routes**

Run: `ls src/app/\[category\]/ 2>/dev/null; grep -rn "categorySlug:" src/lib/data/categories.ts 2>/dev/null | head -10`

Expected: a list of category slugs. If any of `restaurants`, `services`, `retail` aren't real category slugs in the data, substitute the three top categories from `categories.ts`.

- [ ] **Step 3: Verify the file is served**

Run: `pnpm dev`
Open: http://localhost:3000/llms.txt
Expected: the file contents render verbatim.

### Task 4.3: Delete the four unused homepage components

**Files:**
- Delete: `src/components/home/ai-hero-section.tsx`
- Delete: `src/components/home/ai-tools-grid.tsx`
- Delete: `src/components/home/testimonials-slider.tsx`
- Delete: `src/components/home/featured-businesses-section.tsx`

- [ ] **Step 1: Re-confirm no consumers remain after Phase 2**

Run:

```bash
grep -rn "AIHeroSection\|AIToolsGrid\|TestimonialsSlider\|FeaturedBusinessesSection" \
  src/ --include="*.tsx" --include="*.ts"
```

Expected: no matches (or only matches inside the four files themselves).

If any external file still imports one of these, STOP and report it — Phase 2 missed a reference.

- [ ] **Step 2: Delete the files**

```bash
rm src/components/home/ai-hero-section.tsx \
   src/components/home/ai-tools-grid.tsx \
   src/components/home/testimonials-slider.tsx \
   src/components/home/featured-businesses-section.tsx
```

- [ ] **Step 3: Verify**

```bash
pnpm lint && pnpm typecheck
```

Expected: PASS.

### Task 4.4: Phase 4 verification gate + final smoke

- [ ] **Step 1: Final static gates**

```bash
pnpm lint && pnpm typecheck
```

Expected: PASS.

- [ ] **Step 2: Final manual walkthrough**

Run: `pnpm dev`
Open and click through:
1. `/` — homepage renders cleanly, all 7 sections present
2. `/robots.txt` — renders the new file
3. `/llms.txt` — renders the new file
4. `/ai-tools` — logged-out funnel works
5. `/ai-tools/review-collector` — unchanged, still works (regression check)
6. `/businesses` and one `/[category]/[slug]` page — directory regression check (no UI changes expected)
7. `/dashboard` (logged in) — regression check (no UI changes expected)

- [ ] **Step 3: Stage + ask for commit approval**

```bash
git add public/robots.txt public/llms.txt
git rm src/components/home/ai-hero-section.tsx \
       src/components/home/ai-tools-grid.tsx \
       src/components/home/testimonials-slider.tsx \
       src/components/home/featured-businesses-section.tsx
git status
```

Show staged file list to user. **Wait for "ok to commit" before running:**

```bash
git commit -m "chore: AI crawler, llms.txt, cleanup" -m "Adds public/robots.txt (allow GPTBot, ClaudeBot, PerplexityBot,
Google-Extended) and public/llms.txt (LLM-readable index pointing
at homepage, Review Collector, /ai-tools, and the directory).
Deletes four homepage components that no longer have any consumers
after the AI-pivot rewrite: ai-hero-section, ai-tools-grid,
testimonials-slider, featured-businesses-section.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Post-implementation checklist

- [ ] All four commits land on `master` (or wherever the user wants them)
- [ ] Vercel deploy succeeds
- [ ] Spot-check `https://freddybeach.com` after deploy — same manual walkthrough as Phase 2 Step 2 + Phase 3 Step 2
- [ ] Paste production homepage source into https://search.google.com/test/rich-results — confirm all four schemas validate
- [ ] Note the date in a calendar reminder for 2026-06-20: pull GSC data to check for cannibalization per Section 4 of the spec
