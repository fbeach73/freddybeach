import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { BlogOptimizerClient } from "./client";

export const metadata: Metadata = {
  title: "Blog Optimizer | Admin",
  description: "AI-powered SEO analysis and content optimization",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BlogOptimizerPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return <BlogOptimizerClient />;
}
