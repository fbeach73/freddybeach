import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { DynamicIcon } from "@/lib/utils/icons";
import type { AITool } from "@/lib/types";

interface AIToolCardProps {
  tool: AITool;
}

export function AIToolCard({ tool }: AIToolCardProps) {
  const displayFeatures = tool.features.slice(0, 3);

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex-1 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DynamicIcon name={tool.icon} className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{tool.name}</h3>
              {tool.tier === "free" && (
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                >
                  Free
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {tool.shortDescription}
            </p>
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          {displayFeatures.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full">
          <Link href="/ai-tools">Try it free</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
