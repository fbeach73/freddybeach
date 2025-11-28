import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { desc, eq, sql } from "drizzle-orm";
import { BusinessListClient } from "@/components/admin/businesses/business-list-client";
import { StatusFilter } from "@/components/admin/businesses/status-filter";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function BusinessesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusFilter = params.status || "all";

  // Build query based on status filter
  const whereClause = statusFilter !== "all"
    ? eq(business.status, statusFilter as "draft" | "pending_review" | "published" | "archived")
    : undefined;

  // Fetch businesses from database
  const businesses = await db
    .select()
    .from(business)
    .where(whereClause)
    .orderBy(desc(business.createdAt));

  // Get counts for stats
  const [counts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pendingReview: sql<number>`count(*) filter (where ${business.status} = 'pending_review')::int`,
      draft: sql<number>`count(*) filter (where ${business.status} = 'draft')::int`,
      published: sql<number>`count(*) filter (where ${business.status} = 'published')::int`,
      withImages: sql<number>`count(*) filter (where ${business.imageUrl} is not null)::int`,
    })
    .from(business);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business Management</h1>
        <p className="text-muted-foreground">
          View all businesses, manage status, and review imported listings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts?.total || 0}</div>
          </CardContent>
        </Card>
        <Card className={counts?.pendingReview ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{counts?.pendingReview || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{counts?.published || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{counts?.draft || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{counts?.withImages || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Business List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Businesses</CardTitle>
              <CardDescription>
                Manage business listings imported from Google Places.
              </CardDescription>
            </div>
            <StatusFilter currentStatus={statusFilter} />
          </div>
        </CardHeader>
        <CardContent>
          {businesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No businesses found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {statusFilter !== "all"
                  ? `No ${statusFilter} businesses yet. Try a different filter.`
                  : "Import businesses from Google Places to get started."}
              </p>
            </div>
          ) : (
            <BusinessListClient businesses={businesses} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
