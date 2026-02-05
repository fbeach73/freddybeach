"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BlogPostError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Blog Post Error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="flex flex-col items-center text-center">
        <div className="rounded-none border-2 border-nb-border bg-nb-pink p-6 mb-6">
          <AlertTriangle className="h-12 w-12 text-black" />
        </div>

        <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">Error Loading Post</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          We couldn&apos;t load this blog post. Please try again.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={reset} className="nb-btn">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" className="nb-btn">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
