"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function MyBusinessesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("My businesses page error:", error);
  }, [error]);

  return (
    <div className="space-y-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-none border-2 border-nb-border bg-nb-pink p-2">
              <AlertTriangle className="h-5 w-5 text-black" />
            </div>
            <CardTitle className="font-bold uppercase tracking-tight">Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We encountered an error while loading your businesses. This could be
            a temporary issue.
          </p>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline" className="flex-1 nb-btn">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button asChild className="flex-1 nb-btn">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
