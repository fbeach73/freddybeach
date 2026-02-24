import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getBusinessBySlugFromDb } from "@/lib/data/businesses-db";
import { getCategoryBySlug } from "@/lib/data/categories";
import {
  getReviewsForBusiness,
  getReviewStats,
  hasUserReviewedBusiness,
} from "@/lib/data/reviews";
import { auth } from "@/lib/auth";
import {
  BusinessAmenities,
  BusinessBreadcrumb,
  BusinessHero,
  BusinessInfoCard,
  BusinessHoursTable,
  BusinessMap,
  BusinessPhotoGallery,
  BusinessDescription,
  ClaimBusinessCta,
  ContactOwnerButton,
  ReviewsSection,
} from "@/components/business";
import { generateBusinessPageJsonLd } from "@/lib/seo/json-ld";

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

  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://freddybeach.com"}/${category}/${slug}`;

  return {
    title: `${business.name} | Freddy Beach Directory`,
    description: business.shortDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${business.name} | Freddy Beach Directory`,
      description: business.shortDescription,
      url,
      ...(business.heroImage && { images: [business.heroImage] }),
    },
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

  // Fetch reviews data
  const [reviews, reviewStats, userHasReviewed] = await Promise.all([
    getReviewsForBusiness(business.id),
    getReviewStats(business.id),
    session?.user
      ? hasUserReviewedBusiness(business.id, session.user.id)
      : Promise.resolve(false),
  ]);

  const isLoggedIn = !!session;
  const fullAddress = `${business.address}, ${business.city}, ${business.province} ${business.postalCode}`;

  const jsonLd = generateBusinessPageJsonLd(business, categoryData.name);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
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
        {/* Left Column - Description, Photos, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <BusinessDescription
            name={business.name}
            description={business.description}
          />

          {/* Features & Amenities */}
          <BusinessAmenities amenities={business.amenities} />

          {/* Photo Gallery */}
          {business.images.length > 0 && (
            <BusinessPhotoGallery
              images={business.images}
              businessName={business.name}
            />
          )}

          {/* Reviews Section */}
          <ReviewsSection
            businessId={business.id}
            businessName={business.name}
            reviews={reviews}
            averageRating={reviewStats.averageRating}
            totalReviews={reviewStats.totalReviews}
            userHasReviewed={userHasReviewed}
          />
        </div>

        {/* Right Column - Contact Info, Map, Hours */}
        <div className="space-y-6">
          <BusinessInfoCard business={business} />
          <BusinessHoursTable hours={business.hours} />
          <BusinessMap
            address={fullAddress}
            name={business.name}
            latitude={business.latitude}
            longitude={business.longitude}
          />

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
