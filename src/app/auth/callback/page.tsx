import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    // Not logged in, redirect to home
    redirect("/");
  }

  // Check user role and redirect accordingly
  if (session.user.role === "admin") {
    redirect("/admin");
  }

  // Default redirect for all other users
  redirect("/dashboard");
}
