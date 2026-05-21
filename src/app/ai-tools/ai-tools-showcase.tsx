"use client";

import { ReviewCollectorDemoWidget } from "@/components/home/review-collector-demo-widget";
import { AIToolDemo } from "@/components/marketing/ai-tool-demo";
import { CTASection } from "@/components/marketing/cta-section";
import { ToolPreviewCard } from "@/components/marketing/tool-preview-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getToolById, getSortedTools } from "@/lib/data/ai-tools";

export function AIToolsShowcase() {
  const reviewResponder = getToolById("review-responder");
  const socialPostGenerator = getToolById("social-post-generator");

  return (
    <>
      {/* Review Collector demo — single funnel anchor */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <div className="h-2 bg-nb-yellow border-2 border-nb-border mb-6 mx-auto max-w-xs" />
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl uppercase">
              Try the Review Collector
            </h2>
            <p className="text-muted-foreground">
              Tap a star — see what your customers will see. No sign-up required.
            </p>
          </div>
          <div className="mx-auto max-w-md">
            <ReviewCollectorDemoWidget />
          </div>
        </div>
      </section>

      {/* Interactive Demos Section */}
      <section className="bg-muted/30 py-16 md:py-24 border-y-2 border-nb-border">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <div className="h-2 bg-nb-blue border-2 border-nb-border mb-6 mx-auto max-w-xs" />
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl uppercase">
              See AI Tools in Action
            </h2>
            <p className="text-muted-foreground">
              Try our most popular tools right here. Enter your content and
              watch the AI generate professional responses instantly.
            </p>
          </div>

          {/* Desktop: Side by side, Mobile: Tabs */}
          <div className="mx-auto max-w-6xl">
            {/* Mobile Tabs View */}
            <div className="md:hidden">
              <Tabs defaultValue="review-responder" className="w-full">
                <TabsList className="mb-6 w-full border-2 border-nb-border rounded-none">
                  <TabsTrigger value="review-responder" className="flex-1 rounded-none font-bold">
                    Review Assistant
                  </TabsTrigger>
                  <TabsTrigger value="social-post" className="flex-1 rounded-none font-bold">
                    Social Posts
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="review-responder">
                  {reviewResponder && <AIToolDemo tool={reviewResponder} />}
                </TabsContent>
                <TabsContent value="social-post">
                  {socialPostGenerator && (
                    <AIToolDemo tool={socialPostGenerator} />
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop Grid View */}
            <div className="hidden gap-8 md:grid md:grid-cols-1 lg:grid-cols-2">
              {reviewResponder && <AIToolDemo tool={reviewResponder} />}
              {socialPostGenerator && <AIToolDemo tool={socialPostGenerator} />}
            </div>
          </div>
        </div>
      </section>

      {/* All Tools Grid Section */}
      <section id="all-tools" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <div className="h-2 bg-nb-green border-2 border-nb-border mb-6 mx-auto max-w-xs" />
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl uppercase">
              All AI Tools
            </h2>
            <p className="text-muted-foreground">
              Explore our complete suite of AI-powered tools. Free tools are
              available to all users, premium tools unlock with an Enhanced or
              Premium listing.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {getSortedTools().map((tool) => (
              <ToolPreviewCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <CTASection
        headline="Ready to put AI to work?"
        subheadline="Start free with the Review Collector. Add other tools as you grow."
        primaryCTA={{
          text: "Try it free",
          href: "/claim",
        }}
        secondaryCTA={{
          text: "Book a Consultation",
          href: "/consultation",
        }}
      />
    </>
  );
}
