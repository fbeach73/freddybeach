import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ClaimedBusinessCard } from "@/components/dashboard/claimed-business-card";
import { getMockClaimedBusinesses } from "@/lib/data/user-dashboard";

export const metadata = {
  title: "My Businesses | FreddyBeach Directory",
  description: "Manage your claimed business listings on FreddyBeach Directory",
};

export default async function MyBusinessesPage() {
  // Server-side session validation
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const claimedBusinesses = getMockClaimedBusinesses();
  const businessCount = claimedBusinesses.length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="My Businesses"
        description="Manage your claimed business listings"
      >
        <Badge variant="secondary" className="text-sm">
          {businessCount} {businessCount === 1 ? "business" : "businesses"}
        </Badge>
        <Button asChild>
          <Link href="/">
            <Plus className="mr-2 h-4 w-4" />
            Claim New Business
          </Link>
        </Button>
      </PageHeader>

      {/* Business Cards Grid or Empty State */}
      {claimedBusinesses.length > 0 ? (
        <div className="space-y-4">
          {claimedBusinesses.map((business) => (
            <ClaimedBusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No businesses claimed yet"
          description="Start by browsing the directory and claiming your business listing. Once claimed, you can manage your business profile, respond to reviews, and access AI tools."
          action={{
            label: "Browse Directory",
            href: "/",
          }}
        />
      )}

      {/* Claim Another Business CTA */}
      {claimedBusinesses.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Claim Another Business</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Own or manage another local business? Claim it on FreddyBeach to
              boost your visibility and access powerful AI tools.
            </p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/">
                <Plus className="mr-2 h-4 w-4" />
                Browse Directory
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
