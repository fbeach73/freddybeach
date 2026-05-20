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
  Clock,
  Image as ImageIcon,
  Mail,
  MessageSquareText,
  PenLine,
  Share2,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, LucideIcon> = {
  MessageSquareText,
  Share2,
  PenLine,
  Mail,
  Sparkles,
  Star,
  Image: ImageIcon,
};

interface ToolPreviewCardProps {
  tool: AITool;
  className?: string;
}

export function ToolPreviewCard({ tool, className }: ToolPreviewCardProps) {
  const Icon = iconMap[tool.icon] || Sparkles;
  const isComingSoon = tool.status === "coming-soon";
  const isAvailable = tool.status === "available";

  return (
    <Card className={cn("flex flex-col", isComingSoon && "opacity-75", className)}>
      <CardHeader>
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            {isComingSoon ? (
              <Badge variant="outline" className="border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <Clock className="mr-1 h-3 w-3" />
                Coming Soon
              </Badge>
            ) : isAvailable ? (
              <Badge variant="default" className="bg-green-600 text-white hover:bg-green-700">
                Live
              </Badge>
            ) : null}
          </div>
        </div>
        <CardTitle className="text-lg">{tool.name}</CardTitle>
        <CardDescription>{tool.shortDescription}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {isAvailable && (
          <div className="text-xs text-muted-foreground">
            {tool.usageCount.toLocaleString()} uses
          </div>
        )}
      </CardContent>

      <CardFooter>
        {isComingSoon ? (
          <Button disabled variant="outline" className="w-full">
            Coming Soon
          </Button>
        ) : (
          <Button asChild variant="default" className="w-full">
            <Link href={`/ai-tools/${tool.slug}`}>
              Try It Now
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
