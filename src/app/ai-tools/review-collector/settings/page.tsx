import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/shared/page-header";
import { getSettings } from "@/lib/services/review-collector";

import { BusinessPicker } from "../business-picker";
import { resolveActiveBusiness } from "../_resolve";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Settings | Review Collector",
};

export default async function ReviewCollectorSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string; needsSetup?: string }>;
}) {
  const { businessId, needsSetup } = await searchParams;
  const result = await resolveActiveBusiness(businessId);

  if (result.kind === "unauthenticated") redirect("/");
  if (result.kind === "no-businesses" || result.kind === "no-access") {
    redirect("/ai-tools/review-collector");
  }

  const { active, businesses } = result;
  const settings = await getSettings(active.id);

  return (
    <div className="container mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/ai-tools/review-collector?businessId=${active.id}`}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Review Collector
        </Link>
      </Button>

      <PageHeader
        title="Settings"
        description={`Configure how Review Collector behaves for ${active.name}.`}
      >
        <BusinessPicker businesses={businesses} selectedId={active.id} />
      </PageHeader>

      {needsSetup === "1" && (
        <Alert>
          <AlertTitle>Add your Google review URL first</AlertTitle>
          <AlertDescription>
            We need to know where to send your happy customers before you can
            send any requests.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <SettingsForm
            businessId={active.id}
            initial={{
              googleReviewUrl: settings?.googleReviewUrl ?? "",
              brandColor: settings?.brandColor ?? "",
              logoUrl: settings?.logoUrl ?? "",
              senderName: settings?.senderName ?? "",
              senderSignature: settings?.senderSignature ?? "",
              notificationEmail: settings?.notificationEmail ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
