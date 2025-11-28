import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PostForm } from "@/components/admin/blog/post-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Blog Post | Admin",
  description: "Create a new blog post",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewPostPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return <PostForm mode="create" />;
}
