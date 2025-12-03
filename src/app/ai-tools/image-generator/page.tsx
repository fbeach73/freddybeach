import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserTierData } from "@/lib/services/token-system";
import { ImageGeneratorClient } from "./client";

export default async function PublicImageGeneratorPage() {
  // Fetch session on server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect authenticated users to the dashboard version (canonical path)
  if (session?.user) {
    redirect("/dashboard/ai-tools/image-generator");
  }

  // For unauthenticated users, show public generator with limited features
  // No tier data available for unauthenticated users
  return (
    <ImageGeneratorClient
      backLink="/ai-tools"
      backLinkText="Back to AI Tools"
      containerClassName="container mx-auto px-4 py-8 space-y-6"
      tabsListClassName="inline-flex h-auto w-auto flex-wrap gap-1"
      upgradeLink="/ai-tools#pricing"
      userTierData={undefined}
    />
  );
}
