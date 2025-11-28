"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatErrorFallback() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center min-h-[50vh]">
          <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold text-foreground">Chat Unavailable</h2>
          <p className="mt-2 text-muted-foreground max-w-md">
            We encountered an error loading the AI chat. This could be a temporary issue.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-6"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}
