"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";

interface DemoResponseCardProps {
  response: string;
  onRegenerate?: () => void;
  className?: string;
}

export function DemoResponseCard({
  response,
  onRegenerate,
  className,
}: DemoResponseCardProps) {
  const [copied, setCopied] = useState(false);

  const wordCount = response.trim().split(/\s+/).length;
  const charCount = response.length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn("bg-muted/50", className)}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {wordCount} words &middot; {charCount} characters
          </span>
          <div className="flex gap-2">
            {onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                className="h-8 gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="whitespace-pre-wrap text-sm">{response}</div>
      </CardContent>
    </Card>
  );
}
