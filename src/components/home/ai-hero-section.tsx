"use client";

import { useState, useRef } from "react";
import { Sparkles, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import Image from "next/image";

export function AIHeroSection() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const sectionRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    if (!hasInteracted) setHasInteracted(true);
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const scrollToTools = () => {
    const toolsSection = document.getElementById("ai-tools-section");
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative py-12 md:py-20 overflow-hidden"
    >
      {/* Moving Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 transition-all duration-300 ease-out"
        style={{
          background: hasInteracted
            ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(234,88,12,0.15) 0%, transparent 50%)`
            : `radial-gradient(circle at 50% 50%, rgba(234,88,12,0.15) 0%, transparent 50%)`,
        }}
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
        {/* Left Column - Content */}
        <div className="space-y-6">
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles className="h-3 w-3" />
            AI-Powered Business Tools
          </Badge>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Create Stunning AI Images for Your Business
          </h1>

          <p className="text-lg text-muted-foreground md:text-xl">
            Generate professional marketing images, social media graphics, and
            promotional content with our AI tools. Designed specifically for
            Fredericton businesses.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <AuthDialog defaultTab="sign-up">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Get Started Free
              </Button>
            </AuthDialog>

            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={scrollToTools}
            >
              Explore Tools
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right Column - Hero Visual */}
        <div className="relative">
          <div className="relative aspect-square max-w-md mx-auto lg:max-w-none">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />

            {/* Hero visual */}
            <div className="relative rounded-3xl overflow-hidden border border-border/50 shadow-2xl aspect-square">
              <Image
                src="/images/hero-beach.webp"
                alt="FreddyBeach - Fredericton business directory and AI tools"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Floating badges for social proof */}
            <div className="absolute -bottom-4 -left-4 rounded-xl bg-background border shadow-lg px-4 py-3 hidden sm:block">
              <p className="text-sm font-medium">2,000+ images generated</p>
              <p className="text-xs text-muted-foreground">by local businesses</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
