import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Lock } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { PageHeader } from "@/components/shared/page-header";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export const metadata = {
  title: "Analytics | Dashboard",
  description: "Track your business performance and engagement metrics",
};

export default async function AnalyticsPage() {
  // Server-side session validation
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Show sign-in prompt for unauthenticated users
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Protected Page</h1>
        <p className="mt-2 text-muted-foreground">
          You need to sign in to access Analytics
        </p>
        <div className="mt-6">
          <UserProfile />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section>
        <PageHeader
          title="Analytics Dashboard"
          description="Track your business performance and engagement metrics"
        />
      </section>

      {/* Coming Soon Content */}
      <section>
        <ComingSoon
          title="Analytics Dashboard"
          description="Get detailed insights into how your business listings are performing. Track views, clicks, and engagement trends over time."
          features={[
            "Real-time view and click tracking",
            "Engagement trend analysis",
            "Geographic visitor insights",
            "Competitor benchmarking",
            "Custom date range reports",
            "Exportable data and charts",
          ]}
          showNotify={true}
        />
      </section>
    </div>
  );
}
