import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getToolById } from "@/lib/data/ai-tools";
import type { CaseStudy } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Quote } from "lucide-react";
import Image from "next/image";
import { ResultMetric } from "./result-metric";

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  className?: string;
  variant?: "default" | "compact";
}

export function CaseStudyCard({
  caseStudy,
  className,
  variant = "default",
}: CaseStudyCardProps) {
  const isCompact = variant === "compact";

  // Get tool names from IDs
  const tools = caseStudy.toolsUsed
    .map((toolId) => getToolById(toolId))
    .filter(Boolean);

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Hero Image and Header */}
      <div className="relative">
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          <Image
            src={caseStudy.heroImage}
            alt={caseStudy.businessName}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <Badge variant="secondary" className="mb-2">
            {caseStudy.category}
          </Badge>
          <h3 className="text-xl font-bold text-white md:text-2xl">
            {caseStudy.businessName}
          </h3>
          <p className="text-sm text-white/80">
            {caseStudy.ownerName}, {caseStudy.ownerTitle}
          </p>
        </div>
      </div>

      <CardHeader className={cn(isCompact ? "pb-2" : "pb-4")}>
        {/* Results Section - Highlighted at top */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {caseStudy.results.map((result) => (
            <ResultMetric
              key={result.metric}
              result={result}
              variant={isCompact ? "compact" : "default"}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* The Challenge */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-xs text-destructive">
                !
              </span>
              The Challenge
            </h4>
            <ul className="space-y-2">
              {caseStudy.challenge.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* The Solution */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              The Solution
            </h4>
            <ul className="space-y-2">
              {caseStudy.solution.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-600/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tools Used */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            Tools Used:
          </h4>
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <Badge key={tool!.id} variant="outline" className="text-xs">
                {tool!.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="rounded-lg bg-muted/50 p-4">
          <Quote className="mb-2 h-6 w-6 text-primary/40" />
          <blockquote className="mb-3 text-sm italic text-foreground/90 md:text-base">
            &ldquo;{caseStudy.testimonial}&rdquo;
          </blockquote>
          <p className="text-sm font-medium text-muted-foreground">
            — {caseStudy.ownerName}, {caseStudy.ownerTitle}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
