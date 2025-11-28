import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, ClipboardCheck, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { user, business, claim } from "@/lib/schema";
import { sql, eq, desc } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";

export default async function AdminPage() {
  // Fetch real stats from database
  const [{ userCount }] = await db
    .select({ userCount: sql<number>`count(*)::int` })
    .from(user);

  const [{ pendingClaimCount }] = await db
    .select({ pendingClaimCount: sql<number>`count(*)::int` })
    .from(claim)
    .where(eq(claim.status, "pending"));

  const [businessCounts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      published: sql<number>`count(*) filter (where ${business.status} = 'published')::int`,
      pendingReview: sql<number>`count(*) filter (where ${business.status} = 'pending_review')::int`,
    })
    .from(business);

  // Fetch recent pending claims with business and user info
  const recentClaims = await db
    .select({
      id: claim.id,
      businessName: business.name,
      userEmail: user.email,
      createdAt: claim.createdAt,
    })
    .from(claim)
    .innerJoin(business, eq(claim.businessId, business.id))
    .innerJoin(user, eq(claim.userId, user.id))
    .where(eq(claim.status, "pending"))
    .orderBy(desc(claim.createdAt))
    .limit(3);

  // Fetch recent users
  const recentUsers = await db
    .select({
      id: user.id,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(3);

  const stats = [
    {
      title: "Total Users",
      value: userCount.toString(),
      description: "Registered accounts",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Pending Claims",
      value: pendingClaimCount.toString(),
      description: "Awaiting approval",
      icon: ClipboardCheck,
      href: "/admin/claims",
    },
    {
      title: "Total Businesses",
      value: businessCounts?.total.toString() || "0",
      description: `${businessCounts?.published || 0} published`,
      icon: Building2,
      href: "/admin/businesses",
    },
    {
      title: "Pending Review",
      value: businessCounts?.pendingReview.toString() || "0",
      description: "New submissions",
      icon: Clock,
      href: "/admin/businesses?status=pending_review",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">
          Manage users, approve claims, and moderate business listings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <Button variant="link" className="px-0 mt-2" asChild>
                <Link href={stat.href}>View all</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
            <CardDescription>Pending business claim requests</CardDescription>
          </CardHeader>
          <CardContent>
            {recentClaims.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No pending claims</p>
            ) : (
              <div className="space-y-4">
                {recentClaims.map((claimItem) => (
                  <div key={claimItem.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{claimItem.businessName}</p>
                      <p className="text-sm text-muted-foreground">
                        Claimed by {claimItem.userEmail}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/claims`}>Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button variant="link" className="px-0 mt-4" asChild>
              <Link href="/admin/claims">View all claims</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No users yet</p>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((userItem) => (
                  <div key={userItem.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{userItem.name}</p>
                      <p className="text-sm text-muted-foreground">{userItem.role}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(userItem.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Button variant="link" className="px-0 mt-4" asChild>
              <Link href="/admin/users">View all users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
