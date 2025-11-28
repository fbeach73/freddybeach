import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/page-header";
import { AIToolCard } from "@/components/home/ai-tool-card";
import { getFreeTools } from "@/lib/data";

export function AIToolsTeaser() {
  const freeTools = getFreeTools().slice(0, 2);

  return (
    <section className="py-16">
      <SectionHeader
        title="Free AI Tools for Local Businesses"
        description="Boost your productivity with our AI-powered business tools"
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/ai-tools" className="flex items-center gap-1">
              See all tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {freeTools.map((tool) => (
          <AIToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
