import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserTierData } from "@/lib/services/token-system";
import { ImageGeneratorClient } from "./client";

export default async function DashboardImageGeneratorPage() {
  // Fetch session on server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/ai-tools/image-generator");
  }

  // Fetch tier data for authenticated user
  const userTierData = await getUserTierData(session.user.id);

  return (
    <ImageGeneratorClient
      backLink="/dashboard/ai-tools"
      backLinkText="Back to AI Tools"
      containerClassName="space-y-6"
      tabsListClassName="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none"
      upgradeLink="/ai-tools#pricing"
      userTierData={userTierData}
    />
  );
}
