"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Wand2,
  Check,
  X,
  ArrowRight,
  Loader2,
  TrendingUp,
  Plus,
  Minus,
  RefreshCw,
} from "lucide-react";
import type { SEOAnalysis } from "@/types/blog";

interface RewriteChange {
  type: "added" | "removed" | "modified";
  description: string;
}

interface RewriteResult {
  rewrittenContent: string;
  changes: RewriteChange[];
  newScore: number;
}

interface AIRewritePanelProps {
  content: string;
  title?: string;
  analysis?: SEOAnalysis;
  onApply: (newContent: string) => void;
}

export function AIRewritePanel({
  content,
  title,
  analysis,
  onApply,
}: AIRewritePanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle rewrite request
  const handleRewrite = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/blog/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          title,
          analysis,
          instructions: instructions.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to rewrite content");
      }

      const data: RewriteResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Get change icon
  const getChangeIcon = (type: RewriteChange["type"]) => {
    switch (type) {
      case "added":
        return <Plus className="h-3 w-3 text-green-500" />;
      case "removed":
        return <Minus className="h-3 w-3 text-red-500" />;
      case "modified":
        return <RefreshCw className="h-3 w-3 text-blue-500" />;
    }
  };

  // Get change badge color
  const getChangeBadge = (type: RewriteChange["type"]) => {
    switch (type) {
      case "added":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "removed":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "modified":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Rewrite
          </CardTitle>
          <CardDescription>
            Let AI optimize your content for better SEO while maintaining your voice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Special Instructions (optional)
            </label>
            <Textarea
              placeholder="E.g., Focus on mentioning coffee shops, keep it casual, add more local flavor..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>

          {analysis && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Current SEO Score: {analysis.score}/100</span>
            </div>
          )}

          <Button
            onClick={handleRewrite}
            disabled={isLoading || !content.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rewriting...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate SEO-Optimized Version
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Score Comparison */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Score Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">
                    {analysis?.score ?? "?"}
                  </div>
                  <div className="text-xs text-muted-foreground">Before</div>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {result.newScore}
                  </div>
                  <div className="text-xs text-muted-foreground">After</div>
                </div>
                {analysis && result.newScore > analysis.score && (
                  <Badge className="bg-green-600 ml-2">
                    +{result.newScore - analysis.score}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Changes Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Changes Made</CardTitle>
              <CardDescription>
                Summary of optimizations applied
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.changes.map((change, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-sm"
                  >
                    <Badge
                      variant="secondary"
                      className={`${getChangeBadge(change.type)} flex items-center gap-1 shrink-0`}
                    >
                      {getChangeIcon(change.type)}
                      {change.type}
                    </Badge>
                    <span>{change.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rewritten Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rewritten Content</CardTitle>
              <CardDescription>
                Preview the optimized version below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] rounded-lg border p-4 bg-muted/30">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: result.rewrittenContent }}
                />
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => onApply(result.rewrittenContent)}
              className="flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              Apply Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => setResult(null)}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Discard
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
