"use client";

import { cn } from "@/lib/utils";

interface BusinessMapProps {
  address: string;
  name: string;
  latitude?: number;
  longitude?: number;
  className?: string;
}

export function BusinessMap({
  address,
  name,
  latitude,
  longitude,
  className,
}: BusinessMapProps) {
  // Build Google Maps embed URL
  // If we have coordinates, use them; otherwise, use the address
  const query = latitude && longitude
    ? `${latitude},${longitude}`
    : encodeURIComponent(`${name}, ${address}`);

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${query}&zoom=15`;

  // Fallback to a static map link if no API key
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    const staticMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(`${name}, ${address}`)}&output=embed`;

    return (
      <div className={cn("nb-card overflow-hidden", className)}>
        <div className="h-2 bg-nb-orange border-b-2 border-nb-border" />
        <iframe
          src={staticMapUrl}
          width="100%"
          height="250"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map showing ${name}`}
          className="w-full border-b-0"
        />
      </div>
    );
  }

  return (
    <div className={cn("nb-card overflow-hidden", className)}>
      <div className="h-2 bg-nb-orange border-b-2 border-nb-border" />
      <iframe
        src={mapUrl}
        width="100%"
        height="250"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map showing ${name}`}
        className="w-full"
      />
    </div>
  );
}
