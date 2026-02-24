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

// Booking status enum
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
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

// AI Image Generation enums
export const generationStatusEnum = pgEnum("generation_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const avatarTypeEnum = pgEnum("avatar_type", ["human", "object"]);

// AI Image Generation TypeScript interfaces for JSONB columns
// Re-export from centralized types file for backwards compatibility
import type { PresetSettings, GenerationSettings } from "@/lib/types/image-generation";
export type { PresetSettings, GenerationSettings };

// Type for business hours
export interface BusinessHours {
  day: number; // 0-6 (Sunday-Saturday)
  open: string; // "09:00"
  close: string; // "17:00"
  closed?: boolean;
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
  // Amenity fields
  dineIn?: boolean;
  delivery?: boolean;
  takeout?: boolean;
  reservable?: boolean;
  servesBeer?: boolean;
  servesWine?: boolean;
  servesBreakfast?: boolean;
  servesBrunch?: boolean;
  servesLunch?: boolean;
  servesDinner?: boolean;
  servesCoffee?: boolean;
  servesVegetarianFood?: boolean;
  outdoorSeating?: boolean;
  liveMusic?: boolean;
  menuForChildren?: boolean;
  goodForGroups?: boolean;
  goodForChildren?: boolean;
  goodForWatchingSports?: boolean;
  restroom?: boolean;
  allowsDogs?: boolean;
  curbsidePickup?: boolean;
  accessibilityOptions?: {
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
  };
  parkingOptions?: {
    freeParkingLot?: boolean;
    paidParkingLot?: boolean;
    freeStreetParking?: boolean;
    paidStreetParking?: boolean;
    valetParking?: boolean;
    freeGarageParking?: boolean;
    paidGarageParking?: boolean;
  };
  paymentOptions?: {
    acceptsCreditCards?: boolean;
    acceptsDebitCards?: boolean;
    acceptsCashOnly?: boolean;
    acceptsNfc?: boolean;
  };
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
  // Credit and subscription fields
  creditBalance: integer("credit_balance").default(0).notNull(),
  subscriptionTier: text("subscription_tier"), // "monthly" | "yearly" | null
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  subscriptionStartedAt: timestamp("subscription_started_at"),
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

// Consultation bookings table - stores form submissions
export const booking = pgTable(
  "booking",
  {
    id: text("id").primaryKey(),
    // Contact info
    name: text("name").notNull(),
    email: text("email").notNull(),
    businessName: text("business_name").notNull(),
    // Consultation details
    primaryNeed: text("primary_need").notNull(),
    challenge: text("challenge").notNull(),
    // Scheduled time
    selectedDate: text("selected_date").notNull(), // YYYY-MM-DD
    selectedTime: text("selected_time").notNull(), // HH:MM
    // Status tracking
    status: bookingStatusEnum("status").default("pending").notNull(),
    // Email delivery tracking
    adminEmailSent: boolean("admin_email_sent").default(false).notNull(),
    userEmailSent: boolean("user_email_sent").default(false).notNull(),
    // Notes (for admin use)
    adminNotes: text("admin_notes"),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Index for finding bookings by status
    index("booking_status_idx").on(table.status),
    // Index for finding bookings by email
    index("booking_email_idx").on(table.email),
    // Index for finding bookings by date
    index("booking_date_idx").on(table.selectedDate),
    // Index for recent bookings
    index("booking_created_idx").on(table.createdAt),
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

// =============================================
// AI Image Generation Tables
// =============================================

// User API keys - stores encrypted BYOK (Bring Your Own Key) API keys
export const userApiKey = pgTable(
  "user_api_key",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("google"), // For future expansion
    encryptedKey: text("encrypted_key").notNull(),
    iv: text("iv").notNull(), // Initialization vector for AES-256-GCM
    keyHint: text("key_hint").notNull(), // Last 4 characters for identification
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Unique constraint: one key per provider per user
    index("user_api_key_user_provider_idx").on(table.userId, table.provider),
  ]
);

// Avatars - reference images users can include in generations
export const avatar = pgTable(
  "avatar",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: avatarTypeEnum("type").notNull(),
    imageUrl: text("image_url").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Index for finding avatars by user
    index("avatar_user_idx").on(table.userId),
  ]
);

// Presets - saved generation settings for quick reuse
export const preset = pgTable(
  "preset",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    settings: jsonb("settings").$type<PresetSettings>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Index for finding presets by user
    index("preset_user_idx").on(table.userId),
  ]
);

// Generations - tracks each image generation request
export const generation = pgTable(
  "generation",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    status: generationStatusEnum("status").default("pending").notNull(),
    settings: jsonb("settings").$type<GenerationSettings>().notNull(),
    usedAppKey: boolean("used_app_key").default(true).notNull(), // false = user's BYOK
    errorMessage: text("error_message"), // For failed generations
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Index for finding generations by user
    index("generation_user_idx").on(table.userId),
    // Index for finding generations by status
    index("generation_status_idx").on(table.status),
    // Index for recent generations
    index("generation_created_idx").on(table.createdAt),
  ]
);

// Generated images - individual images produced by a generation
export const generatedImage = pgTable(
  "generated_image",
  {
    id: text("id").primaryKey(),
    generationId: text("generation_id")
      .notNull()
      .references(() => generation.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
    width: integer("width"),
    height: integer("height"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Index for finding images by generation
    index("generated_image_generation_idx").on(table.generationId),
    // Index for finding images by user
    index("generated_image_user_idx").on(table.userId),
    // Index for public gallery
    index("generated_image_public_idx").on(table.isPublic),
  ]
);

// Generation history - conversation history for refinements
export const generationHistory = pgTable(
  "generation_history",
  {
    id: text("id").primaryKey(),
    generationId: text("generation_id")
      .notNull()
      .references(() => generation.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "user" | "assistant"
    content: text("content").notNull(),
    imageUrls: jsonb("image_urls").$type<string[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Index for finding history by generation
    index("generation_history_generation_idx").on(table.generationId),
    // Index for ordering by time
    index("generation_history_created_idx").on(table.createdAt),
  ]
);

// Image likes - tracks user likes on public gallery images
export const imageLike = pgTable(
  "image_like",
  {
    id: text("id").primaryKey(),
    imageId: text("image_id")
      .notNull()
      .references(() => generatedImage.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Unique constraint: one like per user per image
    index("image_like_image_user_idx").on(table.imageId, table.userId),
    // Index for counting likes per image
    index("image_like_image_idx").on(table.imageId),
  ]
);

// User token usage - tracks monthly token consumption
export const userTokenUsage = pgTable(
  "user_token_usage",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    month: text("month").notNull(), // Format: "YYYY-MM"
    tokensUsed: integer("tokens_used").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Unique constraint: one record per user per month
    index("user_token_usage_user_month_idx").on(table.userId, table.month),
  ]
);

// Credit transactions - tracks all credit balance changes
export const creditTransaction = pgTable(
  "credit_transaction",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(), // +100 for purchase, -1 for usage
    type: text("type").notNull(), // "purchase" | "usage" | "refund" | "admin_grant"
    description: text("description"),
    balanceAfter: integer("balance_after").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Index for finding transactions by user
    index("credit_transaction_user_idx").on(table.userId),
    // Index for finding transactions by type
    index("credit_transaction_type_idx").on(table.type),
    // Index for ordering by time
    index("credit_transaction_created_idx").on(table.createdAt),
  ]
);

// =============================================
// Analytics Tables
// =============================================

// Page views - tracks all page requests for analytics
export const pageView = pgTable(
  "page_view",
  {
    id: text("id").primaryKey(),
    // Request info
    path: text("path").notNull(),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    // Visitor identification (hashed IP for privacy)
    visitorHash: text("visitor_hash"),
    // Bot detection
    isBot: boolean("is_bot").default(false).notNull(),
    botName: text("bot_name"), // e.g., "Googlebot", "Bingbot"
    // Session tracking (for return visits)
    sessionId: text("session_id"),
    // Geographic info (from Vercel geo headers)
    country: text("country"),
    region: text("region"), // State/province code
    city: text("city"),
    // Device info
    deviceType: text("device_type"), // "mobile" | "tablet" | "desktop"
    browser: text("browser"),
    os: text("os"),
    // Timestamp
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Index for time-based queries
    index("page_view_created_idx").on(table.createdAt),
    // Index for path-based analytics
    index("page_view_path_idx").on(table.path),
    // Index for bot filtering
    index("page_view_is_bot_idx").on(table.isBot),
    // Index for session-based queries
    index("page_view_session_idx").on(table.sessionId),
    // Index for referrer analysis
    index("page_view_referrer_idx").on(table.referrer),
  ]
);
