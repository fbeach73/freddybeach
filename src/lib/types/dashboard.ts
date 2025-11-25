// FreddyBeach.com - Dashboard Types

export interface MockUser {
  id: string;
  name: string;
  email: string;
  tier: "free" | "enhanced" | "featured";
  joinedAt: Date;
  image?: string;
}

export interface MockDashboardStats {
  businessesClaimed: number;
  aiToolsUsed: number;
  hoursSaved: number;
  currentPlan: string;
}

export interface MockClaimedBusiness {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  image: string;
  status: "active" | "pending" | "rejected";
  claimedAt: Date;
  tier: "free" | "enhanced" | "featured";
  metrics: {
    viewsThisMonth: number;
    clicksThisMonth: number;
    viewsTrend: number; // percentage change
    clicksTrend: number;
  };
}

export interface MockToolUsage {
  toolId: string;
  toolSlug: string;
  toolName: string;
  usageCount: number;
  lastUsed: Date;
}
