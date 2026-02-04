import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Clock, Plus, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { OwnedBusinessCard } from "@/components/dashboard/owned-business-card";
import { db } from "@/lib/db";
import { business, claim } from "@/lib/schema";
import { eq, and, or } from "drizzle-orm";

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

  // Fetch businesses owned by or submitted by this user
  const ownedBusinesses = await db
    .select()
    .from(business)
    .where(
      or(
        eq(business.ownerId, session.user.id),
        eq(business.submittedById, session.user.id)
      )
    );

  // Fetch pending claims by this user (with business names)
  const pendingClaims = await db
    .select({
      id: claim.id,
      businessName: business.name,
      createdAt: claim.createdAt,
    })
    .from(claim)
    .innerJoin(business, eq(claim.businessId, business.id))
    .where(
      and(eq(claim.userId, session.user.id), eq(claim.status, "pending"))
    );

  // Fetch recent rejected claims (last 30 days) to show user why claims were rejected
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const rejectedClaims = await db
    .select({
      id: claim.id,
      businessName: business.name,
      rejectionReason: claim.rejectionReason,
      reviewedAt: claim.reviewedAt,
    })
    .from(claim)
    .innerJoin(business, eq(claim.businessId, business.id))
    .where(
      and(
        eq(claim.userId, session.user.id),
        eq(claim.status, "rejected")
      )
    );

  const businessCount = ownedBusinesses.length;

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

      {/* Pending Claims Alert */}
      {pendingClaims.length > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>
            {pendingClaims.length} Pending Claim
            {pendingClaims.length > 1 ? "s" : ""}
          </AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Your claim request{pendingClaims.length > 1 ? "s are" : " is"}{" "}
              being reviewed by our team. You&apos;ll be notified once a
              decision is made.
            </p>
            <ul className="list-inside list-disc space-y-1">
              {pendingClaims.map((pendingClaim) => (
                <li key={pendingClaim.id}>
                  <span className="font-medium">{pendingClaim.businessName}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — submitted{" "}
                    {pendingClaim.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Rejected Claims Alert */}
      {rejectedClaims.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>
            {rejectedClaims.length} Rejected Claim
            {rejectedClaims.length > 1 ? "s" : ""}
          </AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              The following claim{rejectedClaims.length > 1 ? "s were" : " was"}{" "}
              not approved. You may submit a new claim with additional
              verification information.
            </p>
            <ul className="space-y-3">
              {rejectedClaims.map((rejectedClaim) => (
                <li key={rejectedClaim.id} className="border-l-2 border-destructive/50 pl-3">
                  <span className="font-medium">{rejectedClaim.businessName}</span>
                  {rejectedClaim.reviewedAt && (
                    <span className="text-muted-foreground text-sm">
                      {" "}
                      — rejected{" "}
                      {rejectedClaim.reviewedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {rejectedClaim.rejectionReason && (
                    <p className="text-sm mt-1 text-muted-foreground">
                      Reason: {rejectedClaim.rejectionReason}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Business Cards Grid or Empty State */}
      {ownedBusinesses.length > 0 ? (
        <div className="space-y-4">
          {ownedBusinesses.map((biz) => (
            <OwnedBusinessCard key={biz.id} business={biz} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title={
            pendingClaims.length > 0
              ? "No approved businesses yet"
              : "No businesses claimed yet"
          }
          description={
            pendingClaims.length > 0
              ? "Your claim requests are pending review. Once approved, your businesses will appear here and you'll be able to manage your listings."
              : "Start by browsing the directory and claiming your business listing. Once claimed, you can manage your business profile, respond to reviews, and access AI tools."
          }
          action={{
            label: "Browse Directory",
            href: "/",
          }}
        />
      )}

      {/* Claim Another Business CTA */}
      {ownedBusinesses.length > 0 && (
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
