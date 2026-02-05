"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FileText,
  TrendingUp,
  Wand2,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react";
import { SEOAnalyzer } from "@/components/admin/blog/seo-analyzer";
import { AIRewritePanel } from "@/components/admin/blog/ai-rewrite-panel";
import { MediaLibrary } from "@/components/admin/blog/media-library";
import type { SEOAnalysis } from "@/types/blog";

export function BlogOptimizerClient() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState("content");
  const [error, setError] = useState<string | null>(null);

  // Handle content analysis
  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError("Please enter some content to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/blog/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze content");
      }

      const result: SEOAnalysis = await response.json();
      setAnalysis(result);
      setActiveTab("analysis");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle applying rewritten content
  const handleApplyRewrite = (newContent: string) => {
    setContent(newContent);
    setAnalysis(null); // Clear old analysis
    setActiveTab("content");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          Blog Optimizer
        </h1>
        <p className="text-muted-foreground">
          AI-powered SEO analysis and content optimization for your blog posts
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className="flex items-center gap-2"
            disabled={!analysis}
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Analysis</span>
          </TabsTrigger>
          <TabsTrigger
            value="rewrite"
            className="flex items-center gap-2"
            disabled={!content.trim()}
          >
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">AI Rewrite</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Media</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Input Tab */}
        <TabsContent value="content" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Input</CardTitle>
              <CardDescription>
                Paste your blog content below for SEO analysis and optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Post Title</Label>
                <Input
                  id="title"
                  placeholder="Enter your blog post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your blog content here (HTML or plain text)..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {content.length.toLocaleString()} characters
                  {content.trim() && ` • ~${Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)} min read`}
                </p>
              </div>

              {error && (
                <div className="nb-error-box">
                  {error}
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !content.trim()}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analyze Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="mt-6">
          {analysis ? (
            <SEOAnalyzer analysis={analysis} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-bold">No analysis yet</p>
                <p className="text-sm mt-1">
                  Enter content and click &quot;Analyze&quot; to see SEO insights
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Rewrite Tab */}
        <TabsContent value="rewrite" className="mt-6">
          {content.trim() ? (
            <AIRewritePanel
              content={content}
              title={title}
              analysis={analysis || undefined}
              onApply={handleApplyRewrite}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-bold">No content to rewrite</p>
                <p className="text-sm mt-1">
                  Enter content in the Content tab first
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Media Library Tab */}
        <TabsContent value="media" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>
                Upload and manage images for your blog posts. Click to copy markdown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaLibrary />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
