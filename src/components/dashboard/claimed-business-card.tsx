import Link from "next/link";
import Image from "next/image";
import { Eye, MousePointer, Pencil, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/shared/tier-badge";
import type { MockClaimedBusiness } from "@/lib/types/dashboard";
import { cn } from "@/lib/utils";

interface ClaimedBusinessCardProps {
  business: MockClaimedBusiness;
  compact?: boolean;
}

export function ClaimedBusinessCard({
  business,
  compact = false,
}: ClaimedBusinessCardProps) {
  const statusConfig = {
    active: {
      label: "Active",
      className: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    pending: {
      label: "Pending",
      className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
  };

  const { label: statusLabel, className: statusClassName } =
    statusConfig[business.status];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className={cn("flex gap-4", compact ? "p-4" : "p-4 md:p-6")}>
          {/* Business Image */}
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={business.image}
              alt={business.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Business Info */}
          <div className="flex flex-1 flex-col min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{business.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {business.category}
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <Badge variant="secondary" className={statusClassName}>
                  {statusLabel}
                </Badge>
                <TierBadge tier={business.tier} size="sm" showLabel={false} />
              </div>
            </div>

            {/* Metrics */}
            {!compact && (
              <div className="mt-3 flex gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {business.metrics.viewsThisMonth.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">views</span>
                  <span
                    className={cn(
                      "flex items-center text-xs",
                      business.metrics.viewsTrend >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {business.metrics.viewsTrend >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(business.metrics.viewsTrend)}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {business.metrics.clicksThisMonth}
                  </span>
                  <span className="text-muted-foreground">clicks</span>
                  <span
                    className={cn(
                      "flex items-center text-xs",
                      business.metrics.clicksTrend >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {business.metrics.clicksTrend >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(business.metrics.clicksTrend)}%
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/dashboard/my-businesses/${business.businessId}/edit`}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href={`/category/${business.categorySlug}/${business.slug}`}
                  target="_blank"
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  View
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
