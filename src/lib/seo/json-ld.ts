// JSON-LD Schema Generators for SEO
// Generates structured data for Google Rich Results

import type { BlogPost } from "@/types/blog";
import type { Business } from "@/lib/types";
import { getCategoryById } from "@/lib/data/categories";

const SITE_NAME = "FreddyBeach";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://freddybeach.com";
const PUBLISHER_LOGO = `${SITE_URL}/images/freddybeach-logo.png`;

/**
 * Generate Article schema for blog posts
 * @see https://developers.google.com/search/docs/appearance/structured-data/article
 */
export function generateArticleSchema(post: BlogPost) {
  const category = getCategoryById(post.categoryId);
  const articleUrl = `${SITE_URL}/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: {
      "@type": "ImageObject",
      url: post.featuredImage.startsWith("http")
        ? post.featuredImage
        : `${SITE_URL}${post.featuredImage}`,
      caption: post.featuredImageAlt,
    },
    datePublished: post.publishedAt.toISOString(),
    dateModified: (post.updatedAt || post.publishedAt).toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name,
      ...(post.author.image && {
        image: post.author.image.startsWith("http")
          ? post.author.image
          : `${SITE_URL}${post.author.image}`,
      }),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: PUBLISHER_LOGO,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    url: articleUrl,
    ...(category && {
      articleSection: category.name,
    }),
    wordCount: Math.round(post.readingTime * 200), // Estimate based on reading time
    inLanguage: "en-CA",
  };
}

/**
 * Generate BreadcrumbList schema for navigation
 * @see https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */
export function generateBreadcrumbSchema(post: BlogPost) {
  const category = getCategoryById(post.categoryId);

  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: `${SITE_URL}/blog`,
    },
  ];

  // Add category if available
  if (category) {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: category.name,
      item: `${SITE_URL}/blog?category=${category.id}`,
    });
    items.push({
      "@type": "ListItem",
      position: 4,
      name: post.title,
      item: `${SITE_URL}/${post.slug}`,
    });
  } else {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: post.title,
      item: `${SITE_URL}/${post.slug}`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

/**
 * Generate combined JSON-LD script content for a blog post
 * Returns a string that can be used in a <script> tag
 */
export function generateBlogPostJsonLd(post: BlogPost): string {
  const schemas = [
    generateArticleSchema(post),
    generateBreadcrumbSchema(post),
  ];

  return JSON.stringify(schemas);
}

/**
 * Generate WebSite schema for the blog home page
 * @see https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
 */
export function generateBlogHomeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    description: "Local insights, community news, and tips for exploring Fredericton's best businesses and attractions.",
    url: `${SITE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: PUBLISHER_LOGO,
      },
    },
    inLanguage: "en-CA",
  };
}

// ──────────────────────────────────────────────
// Business / Local SEO Schemas
// ──────────────────────────────────────────────

const DAY_MAP: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

/**
 * Generate LocalBusiness schema for business detail pages
 * @see https://developers.google.com/search/docs/appearance/structured-data/local-business
 */
export function generateLocalBusinessSchema(business: Business, categoryName: string) {
  const businessUrl = `${SITE_URL}/${business.categorySlug}/${business.slug}`;

  const openingHours = business.hours
    .filter((h) => !h.closed)
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_MAP[h.day],
      opens: h.open,
      closes: h.close,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": businessUrl,
    name: business.name,
    description: business.description,
    url: businessUrl,
    ...(business.website && { sameAs: business.website }),
    telephone: business.phone || undefined,
    email: business.email || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.province,
      postalCode: business.postalCode,
      addressCountry: "CA",
    },
    ...(business.latitude && business.longitude && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: business.latitude,
        longitude: business.longitude,
      },
    }),
    ...(business.heroImage && {
      image: business.heroImage,
    }),
    ...(openingHours.length > 0 && {
      openingHoursSpecification: openingHours,
    }),
    ...(business.rating > 0 && business.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: business.rating.toFixed(1),
        reviewCount: business.reviewCount,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    areaServed: {
      "@type": "City",
      name: "Fredericton",
      "@id": "https://en.wikipedia.org/wiki/Fredericton",
    },
    isAccessibleForFree: true,
    currenciesAccepted: "CAD",
    paymentAccepted: "Cash, Credit Card, Debit Card",
    priceRange: "$$",
    ...(categoryName && {
      additionalType: categoryName,
    }),
  };
}

/**
 * Generate BreadcrumbList schema for business detail pages
 */
export function generateBusinessBreadcrumbSchema(
  business: Business,
  categoryName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: `${SITE_URL}/${business.categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: business.name,
        item: `${SITE_URL}/${business.categorySlug}/${business.slug}`,
      },
    ],
  };
}

/**
 * Generate combined JSON-LD for a business detail page
 */
export function generateBusinessPageJsonLd(
  business: Business,
  categoryName: string
): string {
  return JSON.stringify([
    generateLocalBusinessSchema(business, categoryName),
    generateBusinessBreadcrumbSchema(business, categoryName),
  ]);
}

/**
 * Generate Organization + WebSite schema for the homepage
 * @see https://developers.google.com/search/docs/appearance/structured-data/organization
 */
export function generateHomepageSchema() {
  return JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: PUBLISHER_LOGO,
      description:
        "Fredericton's local business directory. Discover restaurants, shops, services, and more in Freddy Beach, New Brunswick, Canada.",
      areaServed: {
        "@type": "City",
        name: "Fredericton",
        "@id": "https://en.wikipedia.org/wiki/Fredericton",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Fredericton",
        addressRegion: "NB",
        addressCountry: "CA",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ]);
}
