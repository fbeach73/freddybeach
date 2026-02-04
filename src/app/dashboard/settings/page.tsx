import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Lock, Mail, HelpCircle } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { PageHeader } from "@/components/shared/page-header";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Settings | Dashboard",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  // Server-side session validation
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Show sign-in prompt for unauthenticated users
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center bg-nb-pink/20 border-2 border-nb-border">
          <Lock className="h-8 w-8 text-nb-pink" />
        </div>
        <h1 className="mt-4 text-2xl font-bold uppercase tracking-tight">Protected Page</h1>
        <p className="mt-2 text-muted-foreground">
          You need to sign in to access Settings
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
          title="Account Settings"
          description="Manage your profile, notifications, and security preferences"
        />
      </section>

      {/* Coming Soon Content */}
      <section>
        <ComingSoon
          title="Account Settings"
          description="Full account management is coming soon. You'll be able to customize your profile, notification preferences, and security settings."
          features={[
            "Profile customization",
            "Email notification preferences",
            "Security settings & 2FA",
            "Connected accounts management",
            "Privacy preferences",
            "Data export options",
          ]}
          showNotify={true}
        />
      </section>

      {/* Support Section */}
      <section>
        <div className="nb-card bg-card">
          <div className="h-2 bg-nb-green border-b-2 border-nb-border" />
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-nb-green/20 border-2 border-nb-border">
              <HelpCircle className="h-6 w-6 text-nb-green" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Need Help?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Have questions about your account or need assistance? Our
                support team is here to help.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="mailto:support@freddybeach.com">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
          </CardContent>
        </div>
      </section>
    </div>
  );
}
