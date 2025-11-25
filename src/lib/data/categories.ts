import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "restaurants",
    name: "Restaurants",
    slug: "restaurants",
    icon: "UtensilsCrossed",
    description: "Fine dining, casual eateries, and family restaurants in Fredericton",
    businessCount: 3,
  },
  {
    id: "cafes",
    name: "Cafes & Bakeries",
    slug: "cafes-bakeries",
    icon: "Coffee",
    description: "Coffee shops, bakeries, and cozy cafes throughout the city",
    businessCount: 3,
  },
  {
    id: "retail",
    name: "Retail & Shopping",
    slug: "retail-shopping",
    icon: "ShoppingBag",
    description: "Local boutiques, shops, and retail stores",
    businessCount: 2,
  },
  {
    id: "services",
    name: "Professional Services",
    slug: "professional-services",
    icon: "Briefcase",
    description: "Legal, accounting, consulting, and business services",
    businessCount: 2,
  },
  {
    id: "healthcare",
    name: "Healthcare & Wellness",
    slug: "healthcare-wellness",
    icon: "Heart",
    description: "Medical clinics, wellness centers, and healthcare providers",
    businessCount: 2,
  },
  {
    id: "home-services",
    name: "Home Services",
    slug: "home-services",
    icon: "Home",
    description: "Contractors, plumbers, electricians, and home improvement",
    businessCount: 2,
  },
  {
    id: "arts",
    name: "Arts & Entertainment",
    slug: "arts-entertainment",
    icon: "Palette",
    description: "Galleries, theaters, music venues, and entertainment",
    businessCount: 2,
  },
  {
    id: "automotive",
    name: "Automotive",
    slug: "automotive",
    icon: "Car",
    description: "Auto repair, dealerships, and automotive services",
    businessCount: 2,
  },
  {
    id: "beauty",
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    icon: "Sparkles",
    description: "Salons, spas, and personal care services",
    businessCount: 2,
  },
  {
    id: "fitness",
    name: "Fitness & Sports",
    slug: "fitness-sports",
    icon: "Dumbbell",
    description: "Gyms, fitness centers, and sports facilities",
    businessCount: 2,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((cat) => cat.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((cat) => cat.id === id);
}
