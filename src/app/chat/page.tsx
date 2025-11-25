import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserProfile } from "@/components/auth/user-profile";
import { ChatClient } from "@/components/chat/chat-client";

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

  // Pass validated user data to client component
  return <ChatClient user={session.user} />;
}
