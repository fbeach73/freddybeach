"use client";

import { useState, memo, useCallback } from "react";
import Link from "next/link";
import { Copy, RefreshCw, Lock, CheckCircle2, AlertCircle, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { AITool } from "@/lib/types";

interface AIToolInterfaceProps {
  tool: AITool;
  userTier?: "free" | "enhanced" | "featured";
  initialCredits?: number;
  onCreditsUpdate?: (newCredits: number) => void;
}

// Tool-specific control options
const toolControls: Record<
  string,
  { label: string; options: { value: string; label: string }[] }
> = {
  "review-responder": {
    label: "Response Tone",
    options: [
      { value: "professional", label: "Professional" },
      { value: "friendly", label: "Friendly" },
      { value: "apologetic", label: "Apologetic" },
      { value: "grateful", label: "Grateful" },
    ],
  },
  "social-post-generator": {
    label: "Platform",
    options: [
      { value: "instagram", label: "Instagram" },
      { value: "facebook", label: "Facebook" },
      { value: "twitter", label: "Twitter/X" },
      { value: "linkedin", label: "LinkedIn" },
    ],
  },
  "business-description-writer": {
    label: "Length",
    options: [
      { value: "short", label: "Short (50-100 words)" },
      { value: "medium", label: "Medium (150-250 words)" },
      { value: "long", label: "Long (300-500 words)" },
    ],
  },
  "email-template-generator": {
    label: "Email Type",
    options: [
      { value: "reminder", label: "Appointment Reminder" },
      { value: "confirmation", label: "Booking Confirmation" },
      { value: "promotional", label: "Promotional" },
      { value: "follow-up", label: "Follow-up" },
    ],
  },
};

export const AIToolInterface = memo(function AIToolInterface({
  tool,
  userTier = "free",
  initialCredits,
  onCreditsUpdate,
}: AIToolInterfaceProps) {
  const [input, setInput] = useState(tool.exampleInput);
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [controlValue, setControlValue] = useState(
    toolControls[tool.slug]?.options[0]?.value || ""
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | undefined>(initialCredits);
  const [usageCount, setUsageCount] = useState(0);

  const isLocked = tool.tier !== "free" && userTier === "free";
  const controls = toolControls[tool.slug];

  const handleGenerate = useCallback(async () => {
    if (isLocked || !input.trim()) return;

    setIsGenerating(true);
    setOutput("");
    setError(null);

    try {
      const response = await fetch("/api/ai-tools/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolSlug: tool.slug,
          input: input.trim(),
          option: controlValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setError("You've run out of credits. Purchase more or upgrade to continue using AI tools.");
        } else if (response.status === 401) {
          setError("Please sign in to use AI tools.");
        } else {
          setError(data.error || "Failed to generate content. Please try again.");
        }
        return;
      }

      setOutput(data.output);
      setUsageCount((prev) => prev + 1);

      // Update credits
      if (typeof data.creditsRemaining === "number") {
        setCredits(data.creditsRemaining);
        onCreditsUpdate?.(data.creditsRemaining);
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [isLocked, input, tool.slug, controlValue, onCreditsUpdate]);

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input Panel */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Input</CardTitle>
            <div className="flex items-center gap-2">
              {credits !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  <Coins className="mr-1 h-3 w-3" />
                  {credits} credits
                </Badge>
              )}
              {usageCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  Used {usageCount} {usageCount === 1 ? "time" : "times"}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="input-textarea">
              {tool.slug === "review-responder" && "Customer Review"}
              {tool.slug === "social-post-generator" && "What do you want to post about?"}
              {tool.slug === "business-description-writer" &&
                "Tell us about your business"}
              {tool.slug === "email-template-generator" && "Email Details"}
              {!["review-responder", "social-post-generator", "business-description-writer", "email-template-generator"].includes(tool.slug) && "Your Input"}
            </Label>
            <Textarea
              id="input-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your text here..."
              className="min-h-[200px] resize-none"
              disabled={isLocked}
            />
            <p className="text-xs text-muted-foreground text-right">
              {input.length} characters
            </p>
          </div>

          {/* Tool-specific control */}
          {controls && (
            <div className="space-y-2">
              <Label htmlFor="tool-control">{controls.label}</Label>
              <Select
                value={controlValue}
                onValueChange={setControlValue}
                disabled={isLocked}
              >
                <SelectTrigger id="tool-control">
                  <SelectValue placeholder={`Select ${controls.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {controls.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || isLocked || !input.trim() || credits === 0}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : credits === 0 ? (
              "No Credits Remaining"
            ) : (
              "Generate (1 credit)"
            )}
          </Button>

          {credits === 0 && (
            <div className="text-center">
              <Button variant="link" asChild className="text-sm">
                <Link href="/ai-tools#pricing">Get more credits</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Panel */}
      <Card className="relative">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Output</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Premium Tool Gate Overlay */}
          {isLocked && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
              <div className="text-center p-6 max-w-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Premium Tool</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upgrade to Enhanced or Featured to unlock this tool and generate
                  unlimited content.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/ai-tools#pricing">Upgrade Now</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!output && !isGenerating && !isLocked && (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
              <p className="text-sm text-muted-foreground">
                Your generated content will appear here
              </p>
            </div>
          )}

          {/* Loading skeleton */}
          {isGenerating && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[95%]" />
              <Skeleton className="h-4 w-[85%]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[92%]" />
              <Skeleton className="h-4 w-[88%]" />
            </div>
          )}

          {/* Output content */}
          {output && !isGenerating && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <pre className="whitespace-pre-wrap text-sm font-sans">{output}</pre>
              </div>

              {/* Character count */}
              <p className="text-xs text-muted-foreground">
                {output.length} characters
              </p>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

AIToolInterface.displayName = "AIToolInterface";
