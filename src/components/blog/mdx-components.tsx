// Custom MDX Components for Blog Posts
// These components override default HTML elements in MDX content

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Custom link component that handles internal/external links
 */
function CustomLink({
  href,
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isInternalLink = href?.startsWith("/") || href?.startsWith("#");
  const isAnchorLink = href?.startsWith("#");

  if (isAnchorLink) {
    return (
      <a
        href={href}
        className={cn(
          "text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }

  if (isInternalLink) {
    return (
      <Link
        href={href || "#"}
        className={cn(
          "text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </Link>
    );
  }

  // External link - open in new tab with security attributes
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}

/**
 * Custom image component with Next.js Image optimization
 */
function CustomImage({
  src,
  alt,
  width,
  height,
  className,
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  // Only handle string src (not Blob)
  if (!src || typeof src !== "string") return null;

  // If width and height are provided, use them
  // Otherwise use a responsive layout
  const numWidth = typeof width === "string" ? parseInt(width, 10) : width;
  const numHeight = typeof height === "string" ? parseInt(height, 10) : height;

  if (numWidth && numHeight) {
    return (
      <Image
        src={src}
        alt={alt || ""}
        width={numWidth}
        height={numHeight}
        className={cn("rounded-lg my-6", className)}
      />
    );
  }

  // Responsive image without explicit dimensions
  return (
    <span className="block relative w-full aspect-video my-6">
      <Image
        src={src}
        alt={alt || ""}
        fill
        className={cn("rounded-lg object-cover", className)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
      />
    </span>
  );
}

/**
 * Custom heading components with anchor links
 */
function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Tag = `h${level}` as const;

  return function Heading({
    children,
    id,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) {
    const headingClasses: Record<number, string> = {
      1: "text-4xl font-bold mt-10 mb-4",
      2: "text-3xl font-bold mt-8 mb-3",
      3: "text-2xl font-semibold mt-6 mb-2",
      4: "text-xl font-semibold mt-4 mb-2",
      5: "text-lg font-medium mt-3 mb-1",
      6: "text-base font-medium mt-2 mb-1",
    };

    return (
      <Tag
        id={id}
        className={cn(
          headingClasses[level],
          "scroll-mt-20",
          className
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  };
}

/**
 * Custom paragraph component
 */
function CustomParagraph({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "leading-7 [&:not(:first-child)]:mt-4 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

/**
 * Custom blockquote component
 */
function CustomBlockquote({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className={cn(
        "mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  );
}

/**
 * Custom code block component
 */
function CustomCode({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}

/**
 * Custom pre (code block wrapper) component
 */
function CustomPre({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLPreElement>) {
  return (
    <pre
      className={cn(
        "mt-6 mb-4 overflow-x-auto rounded-lg border bg-muted p-4",
        className
      )}
      {...props}
    >
      {children}
    </pre>
  );
}

/**
 * Custom unordered list component
 */
function CustomUl({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn("my-4 ml-6 list-disc [&>li]:mt-2", className)}
      {...props}
    >
      {children}
    </ul>
  );
}

/**
 * Custom ordered list component
 */
function CustomOl({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className={cn("my-4 ml-6 list-decimal [&>li]:mt-2", className)}
      {...props}
    >
      {children}
    </ol>
  );
}

/**
 * Custom horizontal rule component
 */
function CustomHr({
  className,
  ...props
}: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={cn("my-8 border-t border-border", className)}
      {...props}
    />
  );
}

/**
 * Custom table components
 */
function CustomTable({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="my-6 w-full overflow-x-auto">
      <table
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

function CustomTh({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border border-border px-4 py-2 text-left font-bold bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

function CustomTd({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("border border-border px-4 py-2", className)}
      {...props}
    >
      {children}
    </td>
  );
}

/**
 * Export all MDX components
 */
export const mdxComponents = {
  a: CustomLink,
  img: CustomImage,
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  p: CustomParagraph,
  blockquote: CustomBlockquote,
  code: CustomCode,
  pre: CustomPre,
  ul: CustomUl,
  ol: CustomOl,
  hr: CustomHr,
  table: CustomTable,
  th: CustomTh,
  td: CustomTd,
};
