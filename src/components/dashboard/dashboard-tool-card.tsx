import Link from "next/link";
import {
  MessageSquareText,
  Share2,
  PenLine,
  Mail,
  Star,
  Image as ImageIcon,
  LucideIcon,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToolCostBadge } from "@/components/shared/tier-badge";
import type { AITool } from "@/lib/types";

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  MessageSquareText,
  Share2,
  PenLine,
  Mail,
  Star,
  Image: ImageIcon,
};

interface DashboardToolCardProps {
  tool: AITool;
  usageCount?: number;
}

export function DashboardToolCard({
  tool,
  usageCount = 0,
}: DashboardToolCardProps) {
  const Icon = iconMap[tool.icon] || MessageSquareText;
  const isComingSoon = tool.status === "coming-soon";

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
              <ToolCostBadge costLabel={tool.costLabel} size="sm" />
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
          {isComingSoon ? (
            <Button variant="outline" size="sm" className="w-full" disabled>
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              Coming Soon
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
