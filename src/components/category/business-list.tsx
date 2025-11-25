import { BusinessCard } from "@/components/home/business-card";
import { NoBusinesses } from "@/components/shared/empty-state";
import type { Business } from "@/lib/types";

interface BusinessListProps {
  businesses: Business[];
  categorySlug: string;
  categoryName?: string;
}

export function BusinessList({
  businesses,
  categorySlug,
  categoryName,
}: BusinessListProps) {
  if (businesses.length === 0) {
    return <NoBusinesses categoryName={categoryName} />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {businesses.map((business) => (
        <BusinessCard
          key={business.id}
          business={business}
          categorySlug={categorySlug}
        />
      ))}
    </div>
  );
}
