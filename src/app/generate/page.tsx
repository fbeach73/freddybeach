import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import {
  Sparkles,
  Wand2,
  Users,
  RefreshCw,
  Key,
  Infinity,
  ArrowRight,
  Check,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { UserProfile } from "@/components/auth/user-profile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerateClientSection } from "./generate-client";
import { GenerationErrorBoundary } from "@/components/generate";

export const metadata: Metadata = {
  title: "AI Image Generator | FreddyBeach Directory",
  description:
    "Create stunning AI-generated images for your business. Generate professional marketing visuals, social media graphics, and more with Google Gemini.",
  openGraph: {
    title: "AI Image Generator | FreddyBeach Directory",
    description:
      "Create stunning AI-generated images for your business with AI.",
  },
};

const features = [
  {
    icon: Wand2,
    title: "Powerful Generation",
    description: "Create images from text descriptions using Google's Gemini AI",
  },
  {
    icon: Users,
    title: "Avatar Consistency",
    description:
      "Upload reference images to maintain consistent characters across generations",
  },
  {
    icon: RefreshCw,
    title: "Iterative Refinement",
    description: "Refine your images with natural language instructions",
  },
  {
    icon: Key,
    title: "Bring Your Own Key",
    description: "Use your own Google API key for unlimited generations",
  },
];

const benefits = [
  "High-resolution output up to 4K",
  "Multiple aspect ratios for any platform",
  "Save presets for quick access",
  "Share to community gallery",
  "Full generation history",
  "No watermarks",
];

export default async function GeneratePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badges */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <Sparkles className="h-3 w-3" />
                Powered by Google Gemini
              </Badge>
              <Badge variant="outline">Free Tier Available</Badge>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Create Stunning Images with{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Generate professional marketing visuals, social media graphics, and
              creative assets for your business. No design skills required.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {session ? (
                <Button size="lg" asChild>
                  <Link href="/dashboard/ai-tools/image-generator">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Go to Generator
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <UserProfile />
                  <p className="text-sm text-muted-foreground">
                    Sign in to start generating images
                  </p>
                </div>
              )}
              <Button variant="outline" size="lg" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
              Everything You Need to Create
            </h2>
            <p className="text-muted-foreground">
              Powerful features designed to help you create professional images
              quickly and easily.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2 border-transparent hover:border-primary/20 transition-colors">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-y bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
            {/* Text Content */}
            <div>
              <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
                Professional Results, Zero Complexity
              </h2>
              <p className="mb-6 text-muted-foreground">
                Whether you need product photos, social media graphics, or
                marketing materials, our AI image generator delivers
                professional-quality results in seconds.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing Preview */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Infinity className="h-5 w-5 text-primary" />
                  Unlimited with Your Own Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Get unlimited image generations by using your own Google AI
                  Studio API key. It&apos;s free to create and easy to set up.
                </p>
                <div className="rounded-lg border bg-background/50 p-4">
                  <div className="mb-2 font-medium">Free Tier Includes:</div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 10 generations per month</li>
                    <li>• All features included</li>
                    <li>• No credit card required</li>
                  </ul>
                </div>
                <div className="rounded-lg border bg-background/50 p-4">
                  <div className="mb-2 font-medium">With Your Own Key:</div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Unlimited generations</li>
                    <li>• Priority processing</li>
                    <li>• API key stays encrypted</li>
                  </ul>
                </div>
                {session ? (
                  <Button className="w-full" asChild>
                    <Link href="/dashboard/ai-tools/image-generator">
                      Start Generating
                    </Link>
                  </Button>
                ) : (
                  <div className="text-center">
                    <UserProfile />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Demo / Generator Section */}
      <GenerationErrorBoundary>
        <GenerateClientSection isAuthenticated={!!session} />
      </GenerationErrorBoundary>

      {/* Gallery Preview Section */}
      <section className="border-t py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
              Community Gallery
            </h2>
            <p className="mb-8 text-muted-foreground">
              See what others are creating and share your own work with the
              community.
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link href="/gallery">
                Browse Gallery
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
