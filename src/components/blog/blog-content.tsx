import { compileBlogMDX } from "@/lib/blog/mdx";
import { cn } from "@/lib/utils";

interface BlogContentProps {
  content: string;
  className?: string;
}

export async function BlogContent({ content, className }: BlogContentProps) {
  // Compile MDX to React components
  const { content: mdxContent } = await compileBlogMDX(content);

  return (
    <article
      className={cn(
        "prose prose-lg dark:prose-invert max-w-none",
        // Headings
        "prose-headings:font-bold prose-headings:scroll-mt-20 prose-headings:uppercase prose-headings:tracking-tight",
        "prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4",
        "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3",
        // Links
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-bold",
        // Lists
        "prose-ul:my-4 prose-ol:my-4",
        "prose-li:my-1",
        // Code
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-none prose-code:text-sm prose-code:border prose-code:border-nb-border/20",
        "prose-pre:bg-muted prose-pre:border-2 prose-pre:border-nb-border prose-pre:rounded-none",
        // Blockquotes
        "prose-blockquote:border-l-4 prose-blockquote:border-l-nb-yellow prose-blockquote:bg-nb-yellow/10 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:font-medium",
        // Images
        "prose-img:border-4 prose-img:border-nb-border prose-img:shadow-nb-md prose-img:rounded-none",
        // HR
        "prose-hr:border-2 prose-hr:border-nb-border/20",
        className
      )}
    >
      {mdxContent}
    </article>
  );
}
