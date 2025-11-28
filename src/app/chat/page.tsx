import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserProfile } from "@/components/auth/user-profile";
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
        <div className="max-w-3xl mx-auto">
          <UserProfile />
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
