import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { VerifyEmailClient } from "./verify-email-client";

export const metadata = {
  title: "Verify Your Email | FreddyBeach",
  description: "Please verify your email address to access your dashboard",
};

export default async function VerifyEmailPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // If not logged in, redirect to home
  if (!session) {
    redirect("/");
  }

  // If already verified, redirect to dashboard
  if (session.user.emailVerified) {
    redirect("/dashboard");
  }

  return (
    <VerifyEmailClient
      email={session.user.email}
      name={session.user.name || session.user.email}
    />
  );
}
