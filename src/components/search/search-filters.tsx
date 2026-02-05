"use client";

import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export interface FilterState {
  categories: string[];
  minRating: number | null;
  openNow: boolean;
  featured: boolean;
}

interface SearchFiltersProps {
  filters: FilterState;
  categories: Category[];
  onCategoryChange: (categories: string[]) => void;
  onRatingChange: (rating: number | null) => void;
  onOpenNowChange: (openNow: boolean) => void;
  onFeaturedChange: (featured: boolean) => void;
  onClearAll: () => void;
  className?: string;
}

const ratingOptions = [
  { value: null, label: "Any" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 4.5, label: "4.5+" },
];

export function SearchFilters({
  filters,
  categories,
  onCategoryChange,
  onRatingChange,
  onOpenNowChange,
  onFeaturedChange,
  onClearAll,
  className,
}: SearchFiltersProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.minRating !== null ||
    filters.openNow ||
    filters.featured;

  const handleCategoryToggle = (categorySlug: string) => {
    if (filters.categories.includes(categorySlug)) {
      onCategoryChange(filters.categories.filter((c) => c !== categorySlug));
    } else {
      onCategoryChange([...filters.categories, categorySlug]);
    }
  };

  const handleClearCategories = () => {
    onCategoryChange([]);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Category Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold uppercase tracking-wide">Categories</Label>
          {filters.categories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCategories}
              className="h-auto px-2 py-1 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between border-2 border-nb-border rounded-none font-bold"
              role="combobox"
            >
              <span className="truncate">
                {filters.categories.length === 0
                  ? "All categories"
                  : filters.categories.length === 1
                    ? categories.find((c) => c.slug === filters.categories[0])
                        ?.name || "1 selected"
                    : `${filters.categories.length} selected`}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0 border-2 border-nb-border rounded-none" align="start">
            <Command>
              <CommandInput placeholder="Search categories..." />
              <CommandList>
                <CommandEmpty>No categories found.</CommandEmpty>
                <CommandGroup>
                  {categories.map((category) => (
                    <CommandItem
                      key={category.slug}
                      value={category.name}
                      onSelect={() => handleCategoryToggle(category.slug)}
                    >
                      <Checkbox
                        checked={filters.categories.includes(category.slug)}
                        className="mr-2"
                      />
                      <span>{category.name}</span>
                      <Badge className="nb-badge bg-nb-yellow text-black ml-auto text-xs">
                        {category.businessCount}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {filters.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {filters.categories.map((slug) => {
              const category = categories.find((c) => c.slug === slug);
              return category ? (
                <Badge
                  key={slug}
                  className="nb-badge bg-nb-blue text-black gap-1 pr-1"
                >
                  {category.name}
                  <button
                    onClick={() => handleCategoryToggle(slug)}
                    className="ml-1 p-0.5 hover:bg-black/10"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {category.name}</span>
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-bold uppercase tracking-wide">Minimum Rating</Label>
        <div className="flex flex-wrap gap-2">
          {ratingOptions.map((option) => (
            <Button
              key={option.label}
              size="sm"
              onClick={() => onRatingChange(option.value)}
              className={cn(
                "min-w-[48px] border-2 border-nb-border rounded-none font-bold transition-all duration-150",
                filters.minRating === option.value
                  ? "bg-nb-yellow text-black shadow-none translate-x-[2px] translate-y-[2px]"
                  : "bg-card text-foreground shadow-nb-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Open Now Toggle */}
      <div className="flex items-center justify-between border-2 border-nb-border px-3 py-2 bg-card">
        <Label htmlFor="open-now" className="text-sm font-bold">
          Open Now
        </Label>
        <Switch
          id="open-now"
          checked={filters.openNow}
          onCheckedChange={onOpenNowChange}
        />
      </div>

      {/* Featured Toggle */}
      <div className="flex items-center justify-between border-2 border-nb-border px-3 py-2 bg-card">
        <Label htmlFor="featured" className="text-sm font-bold">
          Featured Only
        </Label>
        <Switch
          id="featured"
          checked={filters.featured}
          onCheckedChange={onFeaturedChange}
        />
      </div>

      {/* Clear All Button */}
      {hasActiveFilters && (
        <Button
          onClick={onClearAll}
          className="nb-btn w-full bg-nb-pink text-black hover:bg-nb-pink"
        >
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
}

export function getActiveFilterCount(filters: FilterState): number {
  let count = 0;
  if (filters.categories.length > 0) count++;
  if (filters.minRating !== null) count++;
  if (filters.openNow) count++;
  if (filters.featured) count++;
  return count;
}
