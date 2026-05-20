import { asc, desc, eq, sql } from "drizzle-orm";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { db } from "@/lib/db";
import { business, businessTool, user } from "@/lib/schema";
import { aiTools } from "@/lib/data/ai-tools";

import { GrantForm } from "./grant-form";
import { RevokeButton } from "./revoke-button";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Tool Access | Admin",
};

export default async function AdminToolsPage() {
  const [grants, allBusinesses] = await Promise.all([
    db
      .select({
        id: businessTool.id,
        businessId: businessTool.businessId,
        businessName: business.name,
        businessSlug: business.slug,
        toolSlug: businessTool.toolSlug,
        accessType: businessTool.accessType,
        grantedAt: businessTool.grantedAt,
        expiresAt: businessTool.expiresAt,
        expired: sql<boolean>`${businessTool.expiresAt} is not null and ${businessTool.expiresAt} < now()`,
        grantedByEmail: user.email,
      })
      .from(businessTool)
      .innerJoin(business, eq(businessTool.businessId, business.id))
      .leftJoin(user, eq(businessTool.grantedBy, user.id))
      .orderBy(desc(businessTool.grantedAt)),
    db
      .select({ id: business.id, name: business.name, slug: business.slug })
      .from(business)
      .orderBy(asc(business.name)),
  ]);

  const tools = aiTools
    .filter((t) => t.accessModel === "per-business")
    .map((t) => ({ slug: t.slug, name: t.name }));

  // Default to review-collector if no per-business tools matched (defensive).
  const toolOptions =
    tools.length > 0 ? tools : [{ slug: "review-collector", name: "Review Collector" }];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tool Access"
        description="Grant, revoke, and audit per-business access to FreddyBeach tools."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grant access</CardTitle>
        </CardHeader>
        <CardContent>
          <GrantForm businesses={allBusinesses} tools={toolOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active grants</CardTitle>
        </CardHeader>
        <CardContent>
          {grants.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No grants yet. Use the form above to give a pilot business access.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Granted</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grants.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>
                        <div className="font-medium">{g.businessName}</div>
                        <div className="text-xs text-muted-foreground">{g.businessSlug}</div>
                      </TableCell>
                      <TableCell className="text-sm">{g.toolSlug}</TableCell>
                      <TableCell>
                        <Badge variant={g.expired ? "destructive" : "secondary"} className="capitalize">
                          {g.expired ? "expired" : g.accessType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {g.grantedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {g.expiresAt
                          ? g.expiresAt.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {g.grantedByEmail ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <RevokeButton grantId={g.id} businessName={g.businessName} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
