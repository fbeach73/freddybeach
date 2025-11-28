import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { BusinessCreateForm } from "@/components/dashboard/business-create-form";

export const metadata = {
  title: "Add New Business | FreddyBeach Directory",
  description:
    "Submit a new business listing to the FreddyBeach Directory for review",
};

export default async function NewBusinessPage() {
  // Server-side session validation
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/my-businesses">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Businesses
        </Link>
      </Button>

      {/* Page Header */}
      <PageHeader
        title="Add New Business"
        description="Submit your business to be listed in the FreddyBeach Directory. All submissions are reviewed before being published."
      />

      {/* Business Create Form */}
      <BusinessCreateForm />
    </div>
  );
}
