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
        "prose-headings:font-bold prose-headings:scroll-mt-20",
        "prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4",
        "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3",
        // Links
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        // Lists
        "prose-ul:my-4 prose-ol:my-4",
        "prose-li:my-1",
        // Code
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
        "prose-pre:bg-muted prose-pre:border",
        // Blockquotes
        "prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:not-italic",
        // Images
        "prose-img:rounded-lg prose-img:shadow-md",
        className
      )}
    >
      {mdxContent}
    </article>
  );
}
