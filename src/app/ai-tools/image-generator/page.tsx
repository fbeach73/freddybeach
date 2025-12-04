import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserTierData } from "@/lib/services/token-system";
import { ImageGeneratorClient } from "./client";

export default async function ImageGeneratorPage() {
  // Fetch session on server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // For authenticated users, fetch their tier data
  const userTierData = session?.user?.id
    ? await getUserTierData(session.user.id)
    : undefined;

  return (
    <ImageGeneratorClient
      backLink="/ai-tools"
      backLinkText="Back to AI Tools"
      containerClassName="container mx-auto px-4 py-8 space-y-6"
      tabsListClassName="inline-flex h-auto w-auto flex-wrap gap-1"
      upgradeLink="/ai-tools#pricing"
      userTierData={userTierData}
    />
  );
}
