import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
  real,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";

// User role enum
export const userRoleEnum = pgEnum("user_role", ["user", "client", "admin"]);

// Business status enum
export const businessStatusEnum = pgEnum("business_status", [
  "draft",
  "pending_review",
  "published",
  "archived",
]);

// Claim status enum
export const claimStatusEnum = pgEnum("claim_status", [
  "pending",
  "approved",
  "rejected",
]);

// Blog post status enum
export const blogPostStatusEnum = pgEnum("blog_post_status", [
  "draft",
  "published",
  "archived",
]);

// Claim role enum (claimant's role at the business)
export const claimRoleEnum = pgEnum("claim_role", [
  "owner",
  "manager",
  "authorized_representative",
]);

// Type for business hours
export interface BusinessHours {
  day: number; // 0-6 (Sunday-Saturday)
  open: string; // "09:00"
  close: string; // "17:00"
}

// Type for Google Place data (raw API response)
export interface GooglePlaceData {
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  types?: string[];
  primaryType?: string;
  photos?: Array<{ name: string; widthPx?: number; heightPx?: number }>;
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
    periods?: Array<{
      open: { day: number; hour: number; minute: number };
      close?: { day: number; hour: number; minute: number };
    }>;
  };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  [key: string]: unknown;
}

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: userRoleEnum("role").default("user").notNull(),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    // Index on userId for efficient session queries
    index("session_user_id_idx").on(table.userId),
  ]
);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Badge type for business listings
export type BusinessBadge = "new" | "featured" | "favourite" | "popular" | "verified" | "top-rated";

// Businesses table for directory listings
export const business = pgTable(
  "business",
  {
    id: text("id").primaryKey(),
    // Core business info
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    // Category (references the 10 FreddyBeach categories)
    categoryId: text("category_id"),
    // Contact info
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    // Address
    address: text("address"),
    city: text("city").default("Fredericton"),
    province: text("province").default("NB"),
    postalCode: text("postal_code"),
    // Location coordinates
    latitude: real("latitude"),
    longitude: real("longitude"),
    // Status
    status: businessStatusEnum("status").default("draft").notNull(),
    // Featured & display settings
    isFeatured: boolean("is_featured").default(false).notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    badges: jsonb("badges").$type<BusinessBadge[]>().default([]),
    // Google Places integration
    googlePlaceId: text("google_place_id").unique(),
    googlePlaceData: jsonb("google_place_data").$type<GooglePlaceData>(),
    // Business hours (stored as JSON array)
    hours: jsonb("hours").$type<BusinessHours[]>(),
    // Ratings
    rating: real("rating"),
    reviewCount: integer("review_count"),
    // Images
    imageUrl: text("image_url"),
    images: jsonb("images").$type<string[]>(),
    // Ownership - set when a business is claimed
    ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
    claimedAt: timestamp("claimed_at"),
    // Submission tracking - set when a user submits a new business for review
    submittedById: text("submitted_by_id").references(() => user.id, { onDelete: "set null" }),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Index on status for filtering published businesses
    index("business_status_idx").on(table.status),
    // Index on category for filtering by category
    index("business_category_idx").on(table.categoryId),
    // Index on google_place_id for duplicate detection
    index("business_google_place_id_idx").on(table.googlePlaceId),
    // Index on slug for URL lookups
    index("business_slug_idx").on(table.slug),
    // Index on owner for fetching user's claimed businesses
    index("business_owner_idx").on(table.ownerId),
    // Index on isFeatured for homepage featured section
    index("business_featured_idx").on(table.isFeatured),
  ]
);

// Reviews table - user reviews for businesses
export const review = pgTable(
  "review",
  {
    id: text("id").primaryKey(),
    // Business being reviewed
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "cascade" }),
    // User who wrote the review
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Rating (1-5 stars)
    rating: integer("rating").notNull(),
    // Review text
    title: text("title"),
    content: text("content").notNull(),
    // Owner response
    ownerResponse: text("owner_response"),
    ownerRespondedAt: timestamp("owner_responded_at"),
    // Moderation
    isApproved: boolean("is_approved").default(true).notNull(),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Index for finding reviews by business
    index("review_business_idx").on(table.businessId),
    // Index for finding reviews by user
    index("review_user_idx").on(table.userId),
    // Composite unique index to prevent duplicate reviews
    index("review_business_user_idx").on(table.businessId, table.userId),
  ]
);

// Business claims table - tracks ownership claim requests
export const claim = pgTable(
  "claim",
  {
    id: text("id").primaryKey(),
    // Business being claimed
    businessId: text("business_id")
      .notNull()
      .references(() => business.id, { onDelete: "cascade" }),
    // User making the claim
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Claimant's role at the business
    role: claimRoleEnum("role").notNull(),
    // Contact phone for verification
    phone: text("phone").notNull(),
    // Description of connection to business
    description: text("description").notNull(),
    // Claim status
    status: claimStatusEnum("status").default("pending").notNull(),
    // Rejection reason (required when status = rejected)
    rejectionReason: text("rejection_reason"),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // Review info
    reviewedAt: timestamp("reviewed_at"),
    reviewedBy: text("reviewed_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    // Index for finding claims by status
    index("claim_status_idx").on(table.status),
    // Index for finding claims by business
    index("claim_business_idx").on(table.businessId),
    // Index for finding claims by user
    index("claim_user_idx").on(table.userId),
  ]
);

// Blog posts table - stores draft posts in database
export const blogPost = pgTable(
  "blog_post",
  {
    id: text("id").primaryKey(),
    // Core content
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull(), // HTML content from editor
    excerpt: text("excerpt"), // SEO meta description
    // Category (reuses directory categories)
    categoryId: text("category_id"),
    // Featured image
    featuredImageUrl: text("featured_image_url"),
    featuredImageAlt: text("featured_image_alt"),
    // SEO fields
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    // Author (for now, hardcoded but stored for flexibility)
    authorName: text("author_name").default("FreddyBeach Team").notNull(),
    authorImage: text("author_image"),
    // Status
    status: blogPostStatusEnum("status").default("draft").notNull(),
    // Optional: Featured businesses to show in sidebar
    featuredBusinessSlugs: jsonb("featured_business_slugs").$type<string[]>(),
    // Timestamps
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Index on status for filtering
    index("blog_post_status_idx").on(table.status),
    // Index on slug for URL lookups
    index("blog_post_slug_idx").on(table.slug),
    // Index on category for filtering
    index("blog_post_category_idx").on(table.categoryId),
    // Index on published date for sorting
    index("blog_post_published_at_idx").on(table.publishedAt),
  ]
);

// Blog images table - tracks uploaded images for the media library
export const blogImage = pgTable(
  "blog_image",
  {
    id: text("id").primaryKey(),
    // File info
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    altText: text("alt_text").notNull(), // Required for accessibility/SEO
    // Optional: link to a specific blog post
    blogPostId: text("blog_post_id").references(() => blogPost.id, {
      onDelete: "set null",
    }),
    // File metadata
    fileSize: integer("file_size"), // bytes
    mimeType: text("mime_type"),
    width: integer("width"),
    height: integer("height"),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Index on blog post for finding images by post
    index("blog_image_post_idx").on(table.blogPostId),
    // Index on created date for sorting
    index("blog_image_created_idx").on(table.createdAt),
  ]
);
