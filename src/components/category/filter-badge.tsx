"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterBadgeProps {
  label: string;
  onRemove: () => void;
}

export function FilterBadge({ label, onRemove }: FilterBadgeProps) {
  return (
    <Badge
      className="nb-badge bg-nb-blue text-black gap-1 pl-2.5 pr-1.5 py-1"
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 p-0.5 hover:bg-black/10 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
