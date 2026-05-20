import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Lock, Mail, MessageSquare, Send, Settings, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/components/auth/user-profile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  getStatsForBusiness,
  getSettings,
  listRecentRequests,
} from "@/lib/services/review-collector";

import { BusinessPicker } from "./business-picker";
import { resolveActiveBusiness } from "./_resolve";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Review Collector | FreddyBeach",
};

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function ReviewCollectorHomePage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string }>;
}) {
  const { businessId } = await searchParams;
  const result = await resolveActiveBusiness(businessId);

  // Direct visits while unauthenticated render the same Sign-In Required card
  // used by /ai-tools/[slug] so the experience matches every other tool.
  if (result.kind === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="nb-card bg-card max-w-md mx-auto">
          <div className="h-2 bg-nb-pink border-b-2 border-nb-border" />
          <div className="p-8 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center bg-nb-pink border-2 border-nb-border">
              <Lock className="h-8 w-8 text-black" />
            </div>
            <h1 className="mt-4 text-2xl font-black uppercase">Sign In Required</h1>
            <p className="mt-2 text-muted-foreground">
              You need to sign in to access this AI tool
            </p>
            <div className="mt-6">
              <UserProfile />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (result.kind === "no-businesses") {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          icon={Star}
          title="Claim a business first"
          description="Review Collector is a per-business tool. Once you own or manage a listing on FreddyBeach, you can unlock it here."
          action={{ label: "Browse Directory", href: "/" }}
        />
      </div>
    );
  }

  if (result.kind === "no-access") {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12 space-y-6">
        <PageHeader
          title="Review Collector"
          description={`Not yet unlocked for ${result.active.name}.`}
        >
          <BusinessPicker
            businesses={result.businesses}
            selectedId={result.active.id}
          />
        </PageHeader>

        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-muted p-3">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Request access</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              We&rsquo;re piloting Review Collector with a handful of Fredericton
              businesses. Want in? Reach out and we&rsquo;ll get you set up.
            </p>
            <Button asChild>
              <Link href="/consultation">Talk to us</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { active, businesses, accessType } = result;
  const [stats, settings, recent] = await Promise.all([
    getStatsForBusiness(active.id),
    getSettings(active.id),
    listRecentRequests(active.id, 25),
  ]);

  const needsSettings = !settings?.googleReviewUrl;
  const avg = stats.avgRating != null ? stats.avgRating.toFixed(1) : "—";

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
      <PageHeader
        title="Review Collector"
        description={`Send requests, route ratings, and keep an eye on private feedback for ${active.name}.`}
      >
        <Badge variant={accessType === "gifted" ? "secondary" : "outline"}>
          {accessType === "gifted" ? "Gifted access" : formatStatus(accessType)}
        </Badge>
        <BusinessPicker businesses={businesses} selectedId={active.id} />
      </PageHeader>

      {needsSettings && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              Add your Google review URL before sending any requests. Without it,
              4–5 star ratings have nowhere to go.
            </p>
            <Button asChild size="sm">
              <Link href={`/ai-tools/review-collector/settings?businessId=${active.id}`}>
                Configure settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Requests sent" value={stats.sent} icon={<Send className="h-4 w-4" />} />
        <StatCard label="Opened" value={stats.opened} icon={<Mail className="h-4 w-4" />} />
        <StatCard label="Avg rating" value={avg} icon={<Star className="h-4 w-4" />} />
        <StatCard
          label="Google clicks"
          value={stats.googleClicks}
          icon={<Star className="h-4 w-4" />}
        />
        <StatCard
          label="Private feedback"
          value={stats.privateCount}
          icon={<MessageSquare className="h-4 w-4" />}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/ai-tools/review-collector/send?businessId=${active.id}`}>
            <Send className="mr-1.5 h-4 w-4" />
            Send a request
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/ai-tools/review-collector/feedback?businessId=${active.id}`}>
            <MessageSquare className="mr-1.5 h-4 w-4" />
            View private feedback
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={`/ai-tools/review-collector/settings?businessId=${active.id}`}>
            <Settings className="mr-1.5 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent requests</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No requests yet. Send your first one to see results here.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.customerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.sentAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.rating ? `${r.rating} ★` : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div>
        <Button asChild variant="link" size="sm">
          <Link href="/ai-tools">
            Back to AI Tools
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-muted-foreground">{icon}</span>
        </div>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
