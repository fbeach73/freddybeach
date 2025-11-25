"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AITool } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Mail,
  MessageSquareText,
  PenLine,
  Share2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, LucideIcon> = {
  MessageSquareText,
  Share2,
  PenLine,
  Mail,
  Sparkles,
};

interface ToolPreviewCardProps {
  tool: AITool;
  className?: string;
}

export function ToolPreviewCard({ tool, className }: ToolPreviewCardProps) {
  const Icon = iconMap[tool.icon] || Sparkles;
  const isFree = tool.tier === "free";
  const tierLabel = isFree ? "Free" : "Premium";
  const tierVariant = isFree ? "secondary" : "default";

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <div className="mb-2 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <Badge variant={tierVariant}>{tierLabel}</Badge>
        </div>
        <CardTitle className="text-lg">{tool.name}</CardTitle>
        <CardDescription>{tool.shortDescription}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="text-xs text-muted-foreground">
          {tool.usageCount.toLocaleString()} uses
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild variant={isFree ? "default" : "outline"} className="w-full">
          <Link href={isFree ? `/ai-tools/${tool.slug}` : "/pricing"}>
            {isFree ? "Try It Free" : "Unlock with Premium"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
