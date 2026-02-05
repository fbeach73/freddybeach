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
            ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(250,204,21,0.25) 0%, transparent 50%)`
            : `radial-gradient(circle at 50% 50%, rgba(250,204,21,0.25) 0%, transparent 50%)`,
        }}
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
        {/* Left Column - Content */}
        <div className="space-y-6">
          <Badge className="nb-badge bg-nb-yellow text-black gap-1.5">
            <Sparkles className="h-3 w-3" />
            Fredericton&apos;s Local Directory
          </Badge>

          <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl uppercase">
            Freddy Beach — Discover Local Businesses in Fredericton
          </h1>

          <p className="mt-2 text-lg text-foreground font-medium md:text-xl">
            Freddy Beach is your guide to the best restaurants, shops, and
            services in Fredericton, NB. Explore local businesses, read reviews,
            and support the Freddy Beach community.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <AuthDialog defaultTab="sign-up">
              <Button size="lg" className="nb-btn bg-nb-yellow text-black px-8 py-6 gap-2 hover:bg-nb-yellow">
                <Sparkles className="h-4 w-4" />
                Browse Directory
              </Button>
            </AuthDialog>

            <Button
              variant="outline"
              size="lg"
              className="nb-btn bg-background px-8 py-6 gap-2"
              onClick={scrollToTools}
            >
              Explore AI Tools
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right Column - Hero Visual */}
        <div className="relative">
          <div className="relative aspect-square max-w-md mx-auto lg:max-w-none">
            {/* Hero visual */}
            <div className="relative rounded-none overflow-hidden border-4 border-nb-border shadow-nb-lg aspect-square">
              <Image
                src="/images/hero-beach.webp"
                alt="Freddy Beach - Fredericton local business directory"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Floating badges for social proof */}
            <div className="relative mt-4 sm:absolute sm:mt-0 sm:-bottom-4 sm:-left-4 rounded-none bg-nb-yellow border-2 border-nb-border shadow-nb-md px-4 py-3 block">
              <p className="text-sm font-bold text-black">2,000+ images generated</p>
              <p className="text-xs text-black">by local businesses</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
