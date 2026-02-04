"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Target,
  Heading,
  Building2,
  Link as LinkIcon,
  Lightbulb,
  TrendingUp,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { SEOAnalysis } from "@/types/blog";

interface SEOAnalyzerProps {
  analysis: SEOAnalysis;
}

export function SEOAnalyzer({ analysis }: SEOAnalyzerProps) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-nb-green";
    if (score >= 70) return "text-nb-yellow";
    if (score >= 50) return "text-nb-orange";
    return "text-nb-pink";
  };

  // Get score progress color
  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-nb-green";
    if (score >= 70) return "bg-nb-yellow";
    if (score >= 50) return "bg-nb-orange";
    return "bg-nb-pink";
  };

  // Get score label
  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Average";
    return "Needs Work";
  };

  // Copy link to clipboard
  const copyLink = async (slug: string) => {
    const link = `/businesses/${slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Score Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  SEO Score
                </CardTitle>
                <CardDescription>
                  Overall content optimization score
                </CardDescription>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}
                </div>
                <Badge
                  variant={analysis.score >= 70 ? "default" : "secondary"}
                  className={analysis.score >= 70 ? "bg-nb-green text-black border-nb-border" : ""}
                >
                  {getScoreLabel(analysis.score)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress
              value={analysis.score}
              className="h-3"
              style={
                { "--progress-background": getProgressColor(analysis.score) } as React.CSSProperties
              }
            />
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Keyword Analysis
            </CardTitle>
            <CardDescription>
              Top keywords found in your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.keywords.length === 0 ? (
              <p className="text-muted-foreground text-sm">No keywords identified.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead className="text-center">Count</TableHead>
                    <TableHead className="text-center">Density</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.keywords.map((kw, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{kw.keyword}</TableCell>
                      <TableCell className="text-center">{kw.count}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{kw.density.toFixed(1)}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Heading Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heading className="h-5 w-5" />
              Heading Structure
            </CardTitle>
            <CardDescription>
              Content hierarchy and heading usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.headings.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No headings found. Consider adding H2 and H3 headings for better structure.
              </p>
            ) : (
              <div className="space-y-2">
                {analysis.headings.map((heading, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2"
                    style={{ paddingLeft: `${(heading.level - 1) * 16}px` }}
                  >
                    <Badge variant="secondary" className="font-mono text-xs">
                      H{heading.level}
                    </Badge>
                    <span className="text-sm truncate">{heading.text}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entity Recognition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Entity Recognition
            </CardTitle>
            <CardDescription>
              Businesses and locations mentioned in your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.entities.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No named entities identified. Consider mentioning local businesses.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analysis.entities.map((entity, idx) => (
                  <Badge
                    key={idx}
                    variant={entity.businessSlug ? "default" : "outline"}
                    className="text-sm"
                  >
                    {entity.name}
                    <span className="ml-1 text-xs opacity-70">({entity.type})</span>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Link Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Link Opportunities
            </CardTitle>
            <CardDescription>
              Local businesses you could link to in your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.linkOpportunities.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No additional linking opportunities identified.
              </p>
            ) : (
              <div className="space-y-3">
                {analysis.linkOpportunities.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-4 p-3 border-2 border-nb-border/20 bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{link.businessName}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => copyLink(link.slug)}
                            >
                              {copiedSlug === link.slug ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {copiedSlug === link.slug ? "Copied!" : "Copy link"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {link.reason}
                      </p>
                      <code className="text-xs text-muted-foreground mt-1 block">
                        /businesses/{link.slug}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Improvement Suggestions
            </CardTitle>
            <CardDescription>
              Specific recommendations to improve your SEO
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.suggestions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No specific suggestions at this time. Great job!
              </p>
            ) : (
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-nb-blue/20 border border-nb-border text-nb-blue text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
