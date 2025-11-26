"use client";

import Link from "next/link";
import Image from "next/image";
import { Pencil, ExternalLink, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { business } from "@/lib/schema";
import type { InferSelectModel } from "drizzle-orm";
import { getCategoryById } from "@/lib/data/categories";

type Business = InferSelectModel<typeof business>;

interface OwnedBusinessCardProps {
  business: Business;
}

export function OwnedBusinessCard({ business }: OwnedBusinessCardProps) {
  const category = business.categoryId ? getCategoryById(business.categoryId) : null;

  const statusConfig = {
    published: {
      label: "Published",
      className: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    draft: {
      label: "Draft",
      className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    },
    archived: {
      label: "Archived",
      className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    },
  };

  const { label: statusLabel, className: statusClassName } =
    statusConfig[business.status];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4 md:p-6">
          {/* Business Image */}
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            {business.imageUrl ? (
              <Image
                src={business.imageUrl}
                alt={business.name}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized={business.imageUrl.startsWith("/api")}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Building2 className="h-8 w-8" />
              </div>
            )}
          </div>

          {/* Business Info */}
          <div className="flex flex-1 flex-col min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{business.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category?.name || "Uncategorized"}
                </p>
                {business.address && (
                  <p className="text-sm text-muted-foreground truncate">
                    {business.address}
                  </p>
                )}
              </div>
              <Badge variant="secondary" className={statusClassName}>
                {statusLabel}
              </Badge>
            </div>

            {/* Actions */}
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/my-businesses/${business.id}/edit`}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
              {category && (
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href={`/${category.slug}/${business.slug}`}
                    target="_blank"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    View
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
