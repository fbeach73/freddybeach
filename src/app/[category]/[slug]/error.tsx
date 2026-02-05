"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function BusinessDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Business detail page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        <div className="mx-auto w-fit rounded-none border-2 border-nb-border bg-nb-pink p-3 mb-4">
          <AlertCircle className="h-12 w-12 text-black" />
        </div>
        <h2 className="mt-4 text-2xl font-bold uppercase tracking-tight">Something went wrong</h2>
        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t load this business listing. Please try again.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <Button onClick={reset} className="nb-btn">Try again</Button>
          <Button variant="outline" asChild className="nb-btn">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
