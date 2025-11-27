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
  "published",
  "archived",
]);

// Claim status enum
export const claimStatusEnum = pgEnum("claim_status", [
  "pending",
  "approved",
  "rejected",
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
