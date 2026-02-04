"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption =
  | "rating-desc"
  | "rating-asc"
  | "name-asc"
  | "name-desc";

interface BusinessListFiltersProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  openNow: boolean;
  onOpenNowChange: (value: boolean) => void;
}

export function BusinessListFilters({
  sortOption,
  onSortChange,
  openNow,
  onOpenNowChange,
}: BusinessListFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="sort-select" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Sort by:
        </Label>
        <Select
          value={sortOption}
          onValueChange={(value) => onSortChange(value as SortOption)}
        >
          <SelectTrigger id="sort-select" className="w-[180px] border-2 border-nb-border rounded-none font-bold">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent className="border-2 border-nb-border rounded-none">
            <SelectItem value="rating-desc">Rating: High to Low</SelectItem>
            <SelectItem value="rating-asc">Rating: Low to High</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 border-2 border-nb-border px-3 py-1.5 bg-card">
        <Switch
          id="open-now"
          checked={openNow}
          onCheckedChange={onOpenNowChange}
        />
        <Label htmlFor="open-now" className="text-sm font-bold cursor-pointer">
          Open Now
        </Label>
      </div>
    </div>
  );
}
