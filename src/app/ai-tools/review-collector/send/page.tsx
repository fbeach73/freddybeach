import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { getSettings } from "@/lib/services/review-collector";

import { BusinessPicker } from "../business-picker";
import { resolveActiveBusiness } from "../_resolve";
import { SendForm } from "./send-form";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Send Review Request | Review Collector",
};

export default async function SendReviewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string }>;
}) {
  const { businessId } = await searchParams;
  const result = await resolveActiveBusiness(businessId);

  if (result.kind === "unauthenticated") redirect("/");
  if (result.kind === "no-businesses" || result.kind === "no-access") {
    redirect("/ai-tools/review-collector");
  }

  const { active, businesses } = result;
  const settings = await getSettings(active.id);

  if (!settings?.googleReviewUrl) {
    redirect(`/ai-tools/review-collector/settings?businessId=${active.id}&needsSetup=1`);
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/ai-tools/review-collector?businessId=${active.id}`}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Review Collector
        </Link>
      </Button>

      <PageHeader
        title="Send a review request"
        description={`From ${active.name} to your customer. They'll get a branded email with a 5-star tap.`}
      >
        <BusinessPicker businesses={businesses} selectedId={active.id} />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer details</CardTitle>
        </CardHeader>
        <CardContent>
          <SendForm businessId={active.id} />
        </CardContent>
      </Card>
    </div>
  );
}
