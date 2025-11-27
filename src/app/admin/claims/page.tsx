import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { claim, business, user } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { ClaimsPageClient } from "@/components/admin/claims/claims-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Claims | Admin",
  description: "Review and manage business claim requests",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ClaimsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch all claims with business and user info
  const claims = await db
    .select({
      id: claim.id,
      businessId: claim.businessId,
      businessName: business.name,
      businessSlug: business.slug,
      businessCategoryId: business.categoryId,
      userId: claim.userId,
      userName: user.name,
      userEmail: user.email,
      role: claim.role,
      phone: claim.phone,
      description: claim.description,
      status: claim.status,
      rejectionReason: claim.rejectionReason,
      createdAt: claim.createdAt,
      reviewedAt: claim.reviewedAt,
      reviewedBy: claim.reviewedBy,
    })
    .from(claim)
    .innerJoin(business, eq(claim.businessId, business.id))
    .innerJoin(user, eq(claim.userId, user.id))
    .orderBy(desc(claim.createdAt));

  return <ClaimsPageClient claims={claims} />;
}
