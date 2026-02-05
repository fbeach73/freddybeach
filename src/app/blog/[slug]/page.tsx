import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPostSlugs, getRelatedPosts } from "@/lib/blog/get-posts";
import { extractTableOfContents } from "@/lib/blog/mdx";
import { getBusinessesBySlugs, getFeaturedBusinessesFromDb } from "@/lib/data/businesses-db";
import { BlogPostHeader } from "@/components/blog/blog-post-header";
import { BlogContent } from "@/components/blog/blog-content";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { ShareButtons } from "@/components/blog/share-buttons";
import { RelatedPosts } from "@/components/blog/related-posts";
import { generateBlogPostJsonLd } from "@/lib/seo/json-ld";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all published blog posts
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://freddybeach.com";
  const url = `${baseUrl}/blog/${slug}`;
  const ogImageUrl = `${baseUrl}/api/blog/og/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      authors: [post.author.name],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.featuredImageAlt || post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Extract table of contents from content
  const tocItems = extractTableOfContents(post.content);

  // Build the full URL for sharing
  const postUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://freddybeach.com"}/blog/${slug}`;

  // Generate JSON-LD structured data
  const jsonLd = generateBlogPostJsonLd(post);

  // Fetch featured businesses
  // Use frontmatter slugs if provided, otherwise fetch featured businesses
  let featuredBusinesses;
  if (post.featuredBusinessSlugs && post.featuredBusinessSlugs.length > 0) {
    featuredBusinesses = await getBusinessesBySlugs(post.featuredBusinessSlugs);
  } else {
    // Fall back to featured businesses from the directory (limit to 3)
    const allFeatured = await getFeaturedBusinessesFromDb();
    featuredBusinesses = allFeatured.slice(0, 3);
  }

  // Fetch related posts
  const relatedPosts = await getRelatedPosts(slug, post.categoryId, 3);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-8">
            <BlogPostHeader post={post} />
            <BlogContent content={post.content} />

            {/* Share Section */}
            <div className="border-b-2 border-nb-border/10 my-8" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <ShareButtons title={post.title} url={postUrl} />
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <>
                <div className="border-b-2 border-nb-border/10 my-8" />
                <RelatedPosts posts={relatedPosts} />
              </>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <BlogSidebar
              tocItems={tocItems}
              author={post.author}
              featuredBusinesses={featuredBusinesses}
            />
          </aside>
        </div>
      </div>
    </>
  );
}
