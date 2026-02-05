"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BlogOptimizerError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Blog Optimizer Error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 rounded-none border-2 border-nb-border bg-nb-pink p-3 w-fit">
            <AlertTriangle className="h-6 w-6 text-black" />
          </div>
          <CardTitle className="font-bold uppercase tracking-tight">Optimizer Error</CardTitle>
          <CardDescription>
            Something went wrong with the blog optimizer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-none border-2 border-nb-border bg-muted p-3 text-sm">
              <code className="text-destructive break-all">{error.message}</code>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={reset} className="flex-1 nb-btn">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild variant="outline" className="flex-1 nb-btn">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
