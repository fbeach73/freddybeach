import { NeoToolCard } from "@/components/home/neo-tool-card";
import { getSortedTools } from "@/lib/data/ai-tools";

export function AIToolsGrid() {
  const tools = getSortedTools();

  return (
    <section id="ai-tools-section" className="py-16">
      <div className="mb-8">
        <div className="w-16 h-2 bg-nb-green mb-4" />
        <h2 className="text-2xl md:text-3xl font-black uppercase">
          AI Tools for Your Business
        </h2>
        <p className="mt-2 text-muted-foreground">
          Free to sign up. Start creating professional content in minutes.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool, index) => (
          <NeoToolCard key={tool.id} tool={tool} index={index} />
        ))}
      </div>
    </section>
  );
}
