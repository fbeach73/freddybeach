import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { business } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { BusinessEditForm } from "@/components/admin/businesses/business-edit-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBusinessPage({ params }: PageProps) {
  // Check admin authentication
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const { id } = await params;

  // Fetch the business
  const [biz] = await db
    .select()
    .from(business)
    .where(eq(business.id, id));

  if (!biz) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/businesses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Business</h1>
          <p className="text-muted-foreground">
            Update listing details for {biz.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
          <CardDescription>
            Edit the business information below. Changes will be saved immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BusinessEditForm business={biz} />
        </CardContent>
      </Card>
    </div>
  );
}
