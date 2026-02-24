"use client";

import {
  MapPin,
  Phone,
  Globe,
  Mail,
  Clock,
  UtensilsCrossed,
  Truck,
  TreePine,
  Accessibility,
  CreditCard,
  Coffee,
  Dog,
  ParkingCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFullAddress, getPhoneUrl, getTodayHours, formatHours } from "@/lib/utils/business";
import type { Business } from "@/lib/types";

interface BusinessInfoCardProps {
  business: Business;
  className?: string;
}

export function BusinessInfoCard({ business, className }: BusinessInfoCardProps) {
  const fullAddress = getFullAddress(business);
  const todayHours = getTodayHours(business.hours);
  const phoneUrl = getPhoneUrl(business.phone);

  return (
    <div className={cn("nb-card bg-card", className)}>
      {/* Accent bar */}
      <div className="h-2 bg-nb-blue border-b-2 border-nb-border" />
      <div className="p-5">
        <h3 className="text-lg font-bold uppercase tracking-tight mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-nb-blue border-2 border-nb-border">
              <MapPin className="h-4 w-4 text-black" />
            </div>
            <div>
              <p className="font-bold text-sm uppercase">Address</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {fullAddress}
              </a>
            </div>
          </div>

          <div className="border-b-2 border-nb-border/10" />

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-nb-green border-2 border-nb-border">
              <Phone className="h-4 w-4 text-black" />
            </div>
            <div>
              <p className="font-bold text-sm uppercase">Phone</p>
              <a
                href={phoneUrl}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {business.phone}
              </a>
            </div>
          </div>

          {business.website && (
            <>
              <div className="border-b-2 border-nb-border/10" />
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-nb-orange border-2 border-nb-border">
                  <Globe className="h-4 w-4 text-black" />
                </div>
                <div>
                  <p className="font-bold text-sm uppercase">Website</p>
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {business.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </div>
            </>
          )}

          <div className="border-b-2 border-nb-border/10" />

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-nb-pink border-2 border-nb-border">
              <Mail className="h-4 w-4 text-black" />
            </div>
            <div>
              <p className="font-bold text-sm uppercase">Email</p>
              <a
                href={`mailto:${business.email}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {business.email}
              </a>
            </div>
          </div>

          {todayHours && (
            <>
              <div className="border-b-2 border-nb-border/10" />
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-nb-yellow border-2 border-nb-border">
                  <Clock className="h-4 w-4 text-black" />
                </div>
                <div>
                  <p className="font-bold text-sm uppercase">Today&apos;s Hours</p>
                  <p className="text-sm text-muted-foreground">
                    {formatHours(todayHours)}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Quick Features Badges */}
          {(() => {
            const badges: Array<{ key: string; label: string; icon: typeof UtensilsCrossed }> = [];
            const a = business.amenities;
            if (!a) return null;

            if (a.dineIn) badges.push({ key: "dineIn", label: "Dine-In", icon: UtensilsCrossed });
            if (a.delivery) badges.push({ key: "delivery", label: "Delivery", icon: Truck });
            if (a.outdoorSeating) badges.push({ key: "outdoor", label: "Outdoor", icon: TreePine });
            if (a.servesCoffee) badges.push({ key: "coffee", label: "Coffee", icon: Coffee });
            if (a.allowsDogs) badges.push({ key: "dogs", label: "Dog-Friendly", icon: Dog });
            if (a.wheelchairAccessibleEntrance) badges.push({ key: "accessible", label: "Accessible", icon: Accessibility });
            if (a.freeParkingLot || a.freeStreetParking) badges.push({ key: "parking", label: "Free Parking", icon: ParkingCircle });
            if (a.acceptsCreditCards) badges.push({ key: "cards", label: "Cards", icon: CreditCard });

            if (badges.length === 0) return null;

            return (
              <>
                <div className="border-b-2 border-nb-border/10" />
                <div>
                  <p className="font-bold text-sm uppercase mb-2">Quick Features</p>
                  <div className="flex flex-wrap gap-2">
                    {badges.slice(0, 8).map((badge) => {
                      const Icon = badge.icon;
                      return (
                        <span
                          key={badge.key}
                          className="nb-badge inline-flex items-center gap-1 text-xs px-2 py-1"
                        >
                          <Icon className="h-3 w-3" />
                          {badge.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
