import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, ClipboardCheck, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock stats - replace with real data later
const stats = [
  {
    title: "Total Users",
    value: "156",
    description: "+12 this week",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Pending Claims",
    value: "8",
    description: "Awaiting approval",
    icon: ClipboardCheck,
    href: "/admin/claims",
  },
  {
    title: "Total Businesses",
    value: "20",
    description: "15 verified",
    icon: Building2,
    href: "/admin/businesses",
  },
  {
    title: "Active Clients",
    value: "12",
    description: "Paying customers",
    icon: TrendingUp,
    href: "/admin/users",
  },
];

export default function AdminPage() {
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Read&apos;s Beans Coffee</p>
                  <p className="text-sm text-muted-foreground">
                    Claimed by john@example.com
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/admin/claims">Review</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sweet Willow Bakery</p>
                  <p className="text-sm text-muted-foreground">
                    Claimed by jane@example.com
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/admin/claims">Review</Link>
                </Button>
              </div>
            </div>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sarah Mitchell</p>
                  <p className="text-sm text-muted-foreground">client</p>
                </div>
                <span className="text-xs text-muted-foreground">2 days ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">John Smith</p>
                  <p className="text-sm text-muted-foreground">user</p>
                </div>
                <span className="text-xs text-muted-foreground">5 days ago</span>
              </div>
            </div>
            <Button variant="link" className="px-0 mt-4" asChild>
              <Link href="/admin/users">View all users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
