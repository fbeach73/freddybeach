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

        {/* Stars + branch state */}
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
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(n)}
            onBlur={() => onHover(null)}
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
      <div className="inline-block nb-btn bg-white text-black px-3 py-2 text-xs font-bold">
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
        aria-label="Feedback (demo only)"
        className="w-full border-2 border-nb-border bg-muted/30 p-2 text-xs"
        rows={3}
      />
      <p className="text-xs text-muted-foreground">
        Or still leave a public review:{" "}
        <button type="button" className="underline">★★★★★ Open Google →</button>
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
