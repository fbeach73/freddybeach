"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { AITool } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { DemoResponseCard } from "./demo-response-card";

interface AIToolDemoProps {
  tool: AITool;
  className?: string;
}

export function AIToolDemo({ tool, className }: AIToolDemoProps) {
  const [input, setInput] = useState(tool.exampleInput);
  const [output, setOutput] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setOutput(null);

    // Mock response flow: show skeleton for 1.5s then show output
    setTimeout(() => {
      setOutput(tool.exampleOutput);
      setIsGenerating(false);
    }, 1500);
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const tierLabel = tool.tier === "free" ? "Free" : "Premium";
  const tierVariant = tool.tier === "free" ? "secondary" : "default";

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{tool.name}</CardTitle>
          <Badge variant={tierVariant}>{tierLabel}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{tool.shortDescription}</p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid md:grid-cols-2">
          {/* Input Panel */}
          <div className="border-b p-4 md:border-b-0 md:border-r">
            <label className="mb-2 block text-sm font-medium">
              Your Input
            </label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your content here..."
              className="min-h-[180px] resize-none"
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !input.trim()}
              className="mt-4 w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Response
                </>
              )}
            </Button>
          </div>

          {/* Output Panel */}
          <div className="p-4">
            <label className="mb-2 block text-sm font-medium">
              AI-Generated Response
            </label>

            {isGenerating ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[92%]" />
                <Skeleton className="h-4 w-[88%]" />
              </div>
            ) : output ? (
              <DemoResponseCard
                response={output}
                onRegenerate={handleRegenerate}
              />
            ) : (
              <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
                Click &quot;Generate Response&quot; to see the AI in action
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
