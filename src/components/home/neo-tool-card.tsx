"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AITool } from "@/lib/types";
import {
  Clock,
  Image as ImageIcon,
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
  Image: ImageIcon,
};

const ACCENT_COLORS = [
  "bg-nb-green",
  "bg-nb-blue",
  "bg-nb-yellow",
  "bg-nb-pink",
  "bg-nb-orange",
];

interface NeoToolCardProps {
  tool: AITool;
  index: number;
}

export function NeoToolCard({ tool, index }: NeoToolCardProps) {
  const Icon = iconMap[tool.icon] || Sparkles;
  const isComingSoon = tool.status === "coming-soon";
  const isAvailable = tool.status === "available";
  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <div className="nb-card bg-card flex flex-col">
      {/* Colored top bar */}
      <div className={`h-2 ${accentColor} border-b-2 border-nb-border`} />

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div
            className={`flex h-12 w-12 items-center justify-center ${accentColor} border-2 border-nb-border`}
          >
            <Icon className="h-6 w-6 text-black" />
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            {isComingSoon ? (
              <Badge className="nb-badge bg-nb-yellow text-black">
                <Clock className="mr-1 h-3 w-3" />
                SOON
              </Badge>
            ) : isAvailable ? (
              <Badge className="nb-badge bg-nb-green text-black">LIVE</Badge>
            ) : null}
          </div>
        </div>

        <h3 className="text-lg font-bold">{tool.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {tool.shortDescription}
        </p>

        {isAvailable && (
          <div className="mt-2 text-xs text-muted-foreground">
            {tool.usageCount.toLocaleString()} uses
          </div>
        )}

        <div className="mt-auto pt-4">
          {isComingSoon ? (
            <Button
              disabled
              className="nb-btn w-full bg-muted text-muted-foreground"
            >
              Coming Soon
            </Button>
          ) : (
            <Button asChild className="nb-btn w-full bg-nb-green text-black hover:bg-nb-green">
              <Link href={`/ai-tools/${tool.slug}`}>Try It Now</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
