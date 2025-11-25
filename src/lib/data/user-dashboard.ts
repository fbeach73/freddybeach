import type {
  MockUser,
  MockDashboardStats,
  MockClaimedBusiness,
  MockToolUsage,
} from "@/lib/types/dashboard";

// Mock user data simulating a signed-in user
export const mockUser: MockUser = {
  id: "user-1",
  name: "Sarah Mitchell",
  email: "sarah@example.com",
  tier: "free",
  joinedAt: new Date("2024-06-15"),
  image: "https://picsum.photos/seed/sarah/100/100",
};

export const mockDashboardStats: MockDashboardStats = {
  businessesClaimed: 2,
  aiToolsUsed: 47,
  hoursSaved: 12,
  currentPlan: "Free",
};

export const mockClaimedBusinesses: MockClaimedBusiness[] = [
  {
    id: "claim-1",
    businessId: "read-beans",
    name: "Read's Beans Coffee",
    slug: "reads-beans",
    category: "Cafes & Bakeries",
    categorySlug: "cafes-bakeries",
    image: "https://picsum.photos/seed/readsbeans1/400/300",
    status: "active",
    claimedAt: new Date("2024-08-01"),
    tier: "featured",
    metrics: {
      viewsThisMonth: 1247,
      clicksThisMonth: 89,
      viewsTrend: 12,
      clicksTrend: 8,
    },
  },
  {
    id: "claim-2",
    businessId: "sweet-willow",
    name: "Sweet Willow Bakery",
    slug: "sweet-willow",
    category: "Cafes & Bakeries",
    categorySlug: "cafes-bakeries",
    image: "https://picsum.photos/seed/sweetwillow1/400/300",
    status: "pending",
    claimedAt: new Date("2024-10-15"),
    tier: "enhanced",
    metrics: {
      viewsThisMonth: 423,
      clicksThisMonth: 31,
      viewsTrend: -3,
      clicksTrend: 5,
    },
  },
];

export const mockToolUsage: MockToolUsage[] = [
  {
    toolId: "review-responder",
    toolSlug: "review-responder",
    toolName: "Review Response Assistant",
    usageCount: 23,
    lastUsed: new Date("2024-11-24"),
  },
  {
    toolId: "social-post-generator",
    toolSlug: "social-post-generator",
    toolName: "Social Post Generator",
    usageCount: 18,
    lastUsed: new Date("2024-11-23"),
  },
  {
    toolId: "business-description-writer",
    toolSlug: "business-description-writer",
    toolName: "Business Description Writer",
    usageCount: 4,
    lastUsed: new Date("2024-11-20"),
  },
  {
    toolId: "email-template-generator",
    toolSlug: "email-template-generator",
    toolName: "Email Template Generator",
    usageCount: 2,
    lastUsed: new Date("2024-11-18"),
  },
];

// Helper functions
export function getMockUser(): MockUser {
  return mockUser;
}

export function getMockStats(): MockDashboardStats {
  return mockDashboardStats;
}

export function getMockClaimedBusinesses(): MockClaimedBusiness[] {
  return mockClaimedBusinesses;
}

export function getMockToolUsage(): MockToolUsage[] {
  return mockToolUsage;
}

export function getTotalToolUsage(): number {
  return mockToolUsage.reduce((total, tool) => total + tool.usageCount, 0);
}
