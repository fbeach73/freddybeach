import {
  UtensilsCrossed,
  Truck,
  ShoppingBag,
  CalendarCheck,
  CarFront,
  Beer,
  Wine,
  Sunrise,
  Coffee,
  Salad,
  Sun,
  TreePine,
  Music,
  Users,
  Baby,
  Tv,
  BookOpen,
  Bath,
  Dog,
  Accessibility,
  ParkingCircle,
  CreditCard,
  Smartphone,
  Banknote,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessAmenities as BusinessAmenitiesType } from "@/lib/types";

const ACCENT_COLORS = [
  "bg-nb-yellow",
  "bg-nb-blue",
  "bg-nb-pink",
  "bg-nb-green",
  "bg-nb-orange",
];

interface AmenityItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface AmenityGroup {
  title: string;
  items: AmenityItem[];
}

const AMENITY_GROUPS: AmenityGroup[] = [
  {
    title: "Dining",
    items: [
      { key: "dineIn", label: "Dine-In", icon: UtensilsCrossed },
      { key: "delivery", label: "Delivery", icon: Truck },
      { key: "takeout", label: "Takeout", icon: ShoppingBag },
      { key: "reservable", label: "Reservations", icon: CalendarCheck },
      { key: "curbsidePickup", label: "Curbside Pickup", icon: CarFront },
    ],
  },
  {
    title: "Food & Drink",
    items: [
      { key: "servesBeer", label: "Beer", icon: Beer },
      { key: "servesWine", label: "Wine", icon: Wine },
      { key: "servesBreakfast", label: "Breakfast", icon: Sunrise },
      { key: "servesBrunch", label: "Brunch", icon: Sun },
      { key: "servesLunch", label: "Lunch", icon: UtensilsCrossed },
      { key: "servesDinner", label: "Dinner", icon: UtensilsCrossed },
      { key: "servesCoffee", label: "Coffee", icon: Coffee },
      { key: "servesVegetarianFood", label: "Vegetarian", icon: Salad },
    ],
  },
  {
    title: "Atmosphere",
    items: [
      { key: "outdoorSeating", label: "Outdoor Seating", icon: TreePine },
      { key: "liveMusic", label: "Live Music", icon: Music },
      { key: "goodForGroups", label: "Good for Groups", icon: Users },
      { key: "goodForChildren", label: "Kid-Friendly", icon: Baby },
      { key: "goodForWatchingSports", label: "Sports Viewing", icon: Tv },
      { key: "menuForChildren", label: "Children's Menu", icon: BookOpen },
      { key: "restroom", label: "Restroom", icon: Bath },
      { key: "allowsDogs", label: "Dog-Friendly", icon: Dog },
    ],
  },
  {
    title: "Accessibility",
    items: [
      { key: "wheelchairAccessibleEntrance", label: "Accessible Entrance", icon: Accessibility },
      { key: "wheelchairAccessibleParking", label: "Accessible Parking", icon: Accessibility },
      { key: "wheelchairAccessibleRestroom", label: "Accessible Restroom", icon: Accessibility },
      { key: "wheelchairAccessibleSeating", label: "Accessible Seating", icon: Accessibility },
    ],
  },
  {
    title: "Parking",
    items: [
      { key: "freeParkingLot", label: "Free Parking Lot", icon: ParkingCircle },
      { key: "paidParkingLot", label: "Paid Parking Lot", icon: ParkingCircle },
      { key: "freeStreetParking", label: "Free Street Parking", icon: ParkingCircle },
      { key: "valetParking", label: "Valet Parking", icon: ParkingCircle },
    ],
  },
  {
    title: "Payment",
    items: [
      { key: "acceptsCreditCards", label: "Credit Cards", icon: CreditCard },
      { key: "acceptsDebitCards", label: "Debit Cards", icon: CreditCard },
      { key: "acceptsNfc", label: "Contactless / NFC", icon: Smartphone },
      { key: "acceptsCashOnly", label: "Cash Only", icon: Banknote },
    ],
  },
];

interface BusinessAmenitiesProps {
  amenities?: BusinessAmenitiesType;
  className?: string;
}

export function BusinessAmenities({ amenities, className }: BusinessAmenitiesProps) {
  if (!amenities) return null;

  // Filter groups to only those with at least one true value
  const activeGroups = AMENITY_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => (amenities as Record<string, unknown>)[item.key] === true
    ),
  })).filter((group) => group.items.length > 0);

  if (activeGroups.length === 0) return null;

  let colorIndex = 0;

  return (
    <div className={cn("nb-card bg-card", className)}>
      {/* Accent bar */}
      <div className="h-2 bg-nb-orange border-b-2 border-nb-border" />
      <div className="p-5">
        <h3 className="text-lg font-bold uppercase tracking-tight mb-5">
          Features & Amenities
        </h3>

        <div className="space-y-5">
          {activeGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {group.title}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {group.items.map((item) => {
                  const accent = ACCENT_COLORS[colorIndex % ACCENT_COLORS.length];
                  colorIndex++;
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center border-2 border-nb-border",
                          accent
                        )}
                      >
                        <Icon className="h-4 w-4 text-black" />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
