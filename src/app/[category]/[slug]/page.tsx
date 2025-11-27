import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getBusinessBySlugFromDb } from "@/lib/data/businesses-db";
import { getCategoryBySlug } from "@/lib/data/categories";
import { auth } from "@/lib/auth";
import {
  BusinessBreadcrumb,
  BusinessHero,
  BusinessInfoCard,
  BusinessHoursTable,
  BusinessMapPlaceholder,
  BusinessPhotoGallery,
  BusinessDescription,
  ClaimBusinessCta,
  ContactOwnerButton,
} from "@/components/business";

// Dynamic rendering - fetch fresh data from database
export const dynamic = "force-dynamic";

interface BusinessPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BusinessPageProps) {
  const { category, slug } = await params;
  const business = await getBusinessBySlugFromDb(slug);

  if (!business || business.categorySlug !== category) {
    return {
      title: "Business Not Found",
    };
  }

  return {
    title: `${business.name} | Freddy Beach Directory`,
    description: business.shortDescription,
  };
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { category, slug } = await params;

  const [business, categoryData, session] = await Promise.all([
    getBusinessBySlugFromDb(slug),
    Promise.resolve(getCategoryBySlug(category)),
    auth.api.getSession({ headers: await headers() }),
  ]);

  // Return 404 if business doesn't exist or category mismatch
  if (!business || !categoryData || business.categorySlug !== category) {
    notFound();
  }

  const isLoggedIn = !!session;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <BusinessBreadcrumb
          categoryName={categoryData.name}
          categorySlug={categoryData.slug}
          businessName={business.name}
        />
      </div>

      {/* Hero Section */}
      <BusinessHero business={business} className="mb-8" />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column - Info Card & Hours */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <BusinessDescription
            name={business.name}
            description={business.description}
          />

          {/* Photo Gallery */}
          {business.images.length > 0 && (
            <BusinessPhotoGallery
              images={business.images}
              businessName={business.name}
            />
          )}
        </div>

        {/* Right Column - Contact Info, Map, Hours */}
        <div className="space-y-6">
          <BusinessInfoCard business={business} />
          <BusinessHoursTable hours={business.hours} />
          <BusinessMapPlaceholder />

          {/* Claim CTA or Contact Button */}
          {business.isClaimed ? (
            <ContactOwnerButton businessName={business.name} />
          ) : (
            <ClaimBusinessCta
              businessId={business.id}
              businessName={business.name}
              isLoggedIn={isLoggedIn}
            />
          )}
        </div>
      </div>
    </div>
  );
}
