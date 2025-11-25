import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { UserProfile } from "@/components/auth/user-profile";
import { Lock } from "lucide-react";

export default async function DashboardPage() {
  // Server-side session validation
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Show sign-in prompt for unauthenticated users
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Protected Page</h1>
            <p className="text-muted-foreground mb-6">
              You need to sign in to access the dashboard
            </p>
          </div>
          <UserProfile />
        </div>
      </div>
    );
  }

  // Pass validated user data to client component
  return <DashboardClient user={session.user} />;
}
