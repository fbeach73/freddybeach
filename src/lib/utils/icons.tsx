import {
  type LucideIcon,
  type LucideProps,
  UtensilsCrossed,
  Coffee,
  ShoppingBag,
  Briefcase,
  Heart,
  Home,
  Palette,
  Car,
  Sparkles,
  Dumbbell,
  MessageSquareText,
  Share2,
  HelpCircle,
  // Home services icons
  Wrench,
  Zap,
  Thermometer,
  HardHat,
  TreeDeciduous,
  Bug,
  // New category icons
  Bed,
  Wine,
  PawPrint,
  Building2,
  MoreHorizontal,
} from "lucide-react";

/**
 * Map of icon names to Lucide React components
 * Used to dynamically render icons from string references in data files
 */
const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Coffee,
  ShoppingBag,
  Briefcase,
  Heart,
  Home,
  Palette,
  Car,
  Sparkles,
  Dumbbell,
  MessageSquareText,
  Share2,
  HelpCircle,
  // Home services icons
  Wrench,
  Zap,
  Thermometer,
  HardHat,
  TreeDeciduous,
  Bug,
  // New category icons
  Bed,
  Wine,
  PawPrint,
  Building2,
  MoreHorizontal,
};

/**
 * Get a Lucide icon component by name
 * @param name - The name of the icon (e.g., "UtensilsCrossed", "Coffee")
 * @returns The Lucide icon component, or HelpCircle as fallback
 */
export function getIconByName(name: string): LucideIcon {
  return iconMap[name] || HelpCircle;
}

/**
 * Dynamic icon component that renders an icon by name
 * Use this instead of getIconByName when you need to render an icon in JSX
 */
interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent {...props} />;
}
