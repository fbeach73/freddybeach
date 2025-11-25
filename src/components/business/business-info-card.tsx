"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Globe, Mail, Clock } from "lucide-react";
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
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Address</p>
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

        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Phone</p>
            <a
              href={phoneUrl}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {business.phone}
            </a>
          </div>
        </div>

        {business.website && (
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Website</p>
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
        )}

        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Email</p>
            <a
              href={`mailto:${business.email}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {business.email}
            </a>
          </div>
        </div>

        {todayHours && (
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Today&apos;s Hours</p>
              <p className="text-sm text-muted-foreground">
                {formatHours(todayHours)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
