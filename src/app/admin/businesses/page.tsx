import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Star, ImageIcon } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getCategoryById } from "@/lib/data/categories";
import { BusinessActions } from "@/components/admin/businesses/business-actions";
import { StatusFilter } from "@/components/admin/businesses/status-filter";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function BusinessesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusFilter = params.status || "all";

  // Build query based on status filter
  const whereClause = statusFilter !== "all"
    ? eq(business.status, statusFilter as "draft" | "published")
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts?.total || 0}</div>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.map((biz) => {
                  const category = biz.categoryId ? getCategoryById(biz.categoryId) : null;
                  return (
                    <TableRow key={biz.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                            {biz.imageUrl ? (
                              <Image
                                src={biz.imageUrl}
                                alt={biz.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                                unoptimized={biz.imageUrl.startsWith("/api")}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <Building2 className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">{biz.name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {biz.address}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {category ? (
                          <Badge variant="outline">{category.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={biz.status === "published" ? "default" : "secondary"}
                          className={biz.status === "published" ? "bg-green-600" : ""}
                        >
                          {biz.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {biz.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span>{biz.rating.toFixed(1)}</span>
                            {biz.reviewCount && (
                              <span className="text-muted-foreground text-xs">
                                ({biz.reviewCount})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{biz.images?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <BusinessActions business={biz} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
