// FreddyBeach.com - Business Directory Types

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Lucide icon name
  description: string;
  businessCount: number;
}

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface BusinessHours {
  day: DayOfWeek;
  open: string; // "09:00"
  close: string; // "17:00"
  closed: boolean;
}

export type BusinessBadge = "new" | "featured" | "favourite" | "popular" | "verified" | "top-rated";

export interface BusinessAmenities {
  // Dining
  dineIn?: boolean;
  delivery?: boolean;
  takeout?: boolean;
  reservable?: boolean;
  curbsidePickup?: boolean;
  // Food & Drink
  servesBeer?: boolean;
  servesWine?: boolean;
  servesBreakfast?: boolean;
  servesBrunch?: boolean;
  servesLunch?: boolean;
  servesDinner?: boolean;
  servesCoffee?: boolean;
  servesVegetarianFood?: boolean;
  // Atmosphere
  outdoorSeating?: boolean;
  liveMusic?: boolean;
  goodForGroups?: boolean;
  goodForChildren?: boolean;
  goodForWatchingSports?: boolean;
  menuForChildren?: boolean;
  restroom?: boolean;
  allowsDogs?: boolean;
  // Accessibility
  wheelchairAccessibleEntrance?: boolean;
  wheelchairAccessibleParking?: boolean;
  wheelchairAccessibleRestroom?: boolean;
  wheelchairAccessibleSeating?: boolean;
  // Parking
  freeParkingLot?: boolean;
  paidParkingLot?: boolean;
  freeStreetParking?: boolean;
  valetParking?: boolean;
  // Payment
  acceptsCreditCards?: boolean;
  acceptsDebitCards?: boolean;
  acceptsCashOnly?: boolean;
  acceptsNfc?: boolean;
  // Meta
  priceLevel?: string;
  types?: string[];
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  description: string;
  shortDescription: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  rating: number; // 1-5
  reviewCount: number;
  hours: BusinessHours[];
  images: string[]; // URLs
  heroImage: string;
  isClaimed: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  badges?: BusinessBadge[];
  displayOrder?: number;
  amenities?: BusinessAmenities;
  tier: "free" | "enhanced" | "featured";
  createdAt: Date;
}

export interface Testimonial {
  id: string;
  businessId?: string;
  businessName: string;
  businessCategory: string;
  personName: string;
  personTitle: string;
  personImage: string;
  quote: string;
  challenge: string;
  solution: string;
  results: string[];
  isFeatured: boolean;
}

export interface AITool {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  icon: string; // Lucide icon name
  tier: "free" | "enhanced" | "featured";
  status: "available" | "coming-soon";
  usageCount: number;
  exampleInput: string;
  exampleOutput: string;
  features: string[];
  // 'credits' = monthly credit/subscription model (existing AI tools)
  // 'per-business' = gated by business_tool grant (Review Collector, future per-biz tools)
  accessModel?: "credits" | "per-business";
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  priceLabel: string;
  pricePerCredit: string;
  description: string;
  features: string[];
  isPopular: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  period: "monthly" | "yearly";
  yearlyEquivalent?: string; // e.g., "$16.58/mo" for yearly plan
  description: string;
  features: string[];
  softCapGenerations: number; // e.g., 500 per month
  isPopular: boolean;
}

export interface BYOKOption {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  requirements: string[];
}

export interface BYOKProPlan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  period: "monthly";
  description: string;
  features: string[];
  requirements: string[];
  isPopular: boolean;
}

export interface ConsultationPackage {
  id: string;
  name: string;
  slug: string;
  price: number;
  priceLabel: string;
  description: string;
  timeline: string;
  features: string[];
  outcomes: string[];
  isPopular: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  isPopular: boolean;
}

// User Dashboard Types
export interface ClaimedBusiness {
  businessId: string;
  claimedAt: Date;
  tier: "free" | "enhanced" | "featured";
  status: "pending" | "verified" | "rejected";
}

export interface ToolUsage {
  toolId: string;
  usageCount: number;
  lastUsed: Date;
}

export interface UserDashboardData {
  claimedBusinesses: ClaimedBusiness[];
  toolUsage: ToolUsage[];
  totalTimeSaved: number; // in minutes
  currentTier: "free" | "enhanced" | "featured";
}

// Search Types
export interface SearchFilters {
  query?: string;
  category?: string;
  rating?: number;
  openNow?: boolean;
  tier?: "free" | "enhanced" | "featured";
}

export interface SearchResult {
  businesses: Business[];
  totalCount: number;
  filters: SearchFilters;
}

// Case Study Types
export interface CaseStudyResult {
  metric: string;
  value: string;
  description?: string;
}

export interface CaseStudy {
  id: string;
  businessName: string;
  businessSlug: string;
  category: string;
  categorySlug: string;
  heroImage: string;
  ownerName: string;
  ownerTitle: string;
  ownerImage?: string;
  challenge: string[];
  solution: string[];
  toolsUsed: string[]; // AI tool IDs
  results: CaseStudyResult[];
  testimonial: string;
  isFeatured: boolean;
}
