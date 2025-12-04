import Link from "next/link";
import {
  MessageSquareText,
  Share2,
  PenLine,
  Mail,
  LucideIcon,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/shared/tier-badge";
import type { AITool } from "@/lib/types";

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  MessageSquareText,
  Share2,
  PenLine,
  Mail,
};

interface DashboardToolCardProps {
  tool: AITool;
  usageCount?: number;
  userTier?: "free" | "enhanced" | "featured";
}

export function DashboardToolCard({
  tool,
  usageCount = 0,
  userTier = "free",
}: DashboardToolCardProps) {
  const Icon = iconMap[tool.icon] || MessageSquareText;
  const isLocked = tool.tier !== "free" && userTier === "free";

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{tool.name}</h3>
              <TierBadge tier={tool.tier} size="sm" showLabel={false} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {tool.shortDescription}
            </p>

            {/* Usage stats */}
            <p className="mt-2 text-xs text-muted-foreground">
              Used {usageCount} {usageCount === 1 ? "time" : "times"}
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="mt-4">
          {isLocked ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              asChild
            >
              <Link href="/ai-tools#pricing">
                <Lock className="mr-1.5 h-3.5 w-3.5" />
                Unlock
              </Link>
            </Button>
          ) : (
            <Button size="sm" className="w-full" asChild>
              <Link href={`/ai-tools/${tool.slug}`}>Launch</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
