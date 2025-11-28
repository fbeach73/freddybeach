// JSON-LD Schema Generators for Blog SEO
// Generates structured data for Google Rich Results

import type { BlogPost } from "@/types/blog";
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
  const articleUrl = `${SITE_URL}/blog/${post.slug}`;

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
      item: `${SITE_URL}/blog/${post.slug}`,
    });
  } else {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: post.title,
      item: `${SITE_URL}/blog/${post.slug}`,
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
