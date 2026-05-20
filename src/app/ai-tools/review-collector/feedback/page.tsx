import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { listFeedbackForBusiness } from "@/lib/services/review-collector";

import { BusinessPicker } from "../business-picker";
import { resolveActiveBusiness } from "../_resolve";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private Feedback | Review Collector",
};

export default async function FeedbackInboxPage({
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
  const items = await listFeedbackForBusiness(active.id, 50);

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/ai-tools/review-collector?businessId=${active.id}`}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Review Collector
        </Link>
      </Button>

      <PageHeader
        title="Private feedback"
        description={`Messages submitted directly to ${active.name} — never published anywhere.`}
      >
        <BusinessPicker businesses={businesses} selectedId={active.id} />
      </PageHeader>

      {items.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No private feedback yet"
          description="When customers rate 1–3 stars and submit a message, it shows up here. Owner notifications also go to the email in your settings."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium">{item.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.submittedAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge variant="outline">{item.rating} ★</Badge>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm">{item.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
