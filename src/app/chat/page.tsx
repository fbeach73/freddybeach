import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Sparkles } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";
import { ChatClient } from "@/components/chat/chat-client";
import { ChatErrorFallback } from "@/components/chat/chat-error-fallback";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default async function ChatPage() {
  // Server-side session validation
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Show sign-in prompt for unauthenticated users
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-black uppercase">AI Chat</h1>
          <p className="text-muted-foreground">
            Ask anything, get answers in seconds. Create a free account — you
            get 10 free credits every month.
          </p>
          <AuthDialog defaultTab="sign-up">
            <Button className="nb-btn bg-nb-yellow text-black hover:bg-nb-yellow gap-2">
              <Sparkles className="h-4 w-4" />
              Start free
            </Button>
          </AuthDialog>
        </div>
      </div>
    );
  }

  // Pass validated user data to client component wrapped in error boundary
  return (
    <ErrorBoundary fallback={<ChatErrorFallback />} name="AI Chat">
      <ChatClient user={session.user} />
    </ErrorBoundary>
  );
}
