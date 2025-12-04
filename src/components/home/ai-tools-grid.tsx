import { SectionHeader } from "@/components/shared/page-header";
import { ToolPreviewCard } from "@/components/marketing/tool-preview-card";
import { getSortedTools } from "@/lib/data/ai-tools";

export function AIToolsGrid() {
  const tools = getSortedTools();

  return (
    <section id="ai-tools-section" className="py-16">
      <SectionHeader
        title="AI Tools for Your Business"
        description="Free to sign up. Start creating professional content in minutes."
      />

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => (
          <ToolPreviewCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
