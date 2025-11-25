import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/profile/profile-client";

export default async function ProfilePage() {
  // Server-side session validation
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Server-side redirect if not authenticated
  if (!session) {
    redirect("/");
  }

  // Pass validated user data to client component
  return <ProfileClient user={session.user} />;
}
