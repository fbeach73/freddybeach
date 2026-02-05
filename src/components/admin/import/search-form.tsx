"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLACE_TYPES, type PlaceType } from "@/lib/services/google-places";

interface SearchFormProps {
  onSearch: (params: {
    query: string;
    type?: PlaceType;
    radius: number;
  }) => Promise<void>;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [placeType, setPlaceType] = useState<PlaceType | "all">("all");
  const [radius, setRadius] = useState(10); // km

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    await onSearch({
      query: query.trim(),
      type: placeType === "all" ? undefined : placeType,
      radius: radius * 1000, // Convert km to meters
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Keyword Input */}
      <div className="space-y-2">
        <Label htmlFor="query" className="uppercase tracking-wide text-sm">Search Keyword</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="query"
            placeholder="e.g., pizza, coffee shop, gym..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Place Type Selector */}
      <div className="space-y-2">
        <Label htmlFor="place-type" className="uppercase tracking-wide text-sm">Google Place Type (Optional)</Label>
        <Select
          value={placeType}
          onValueChange={(value) => setPlaceType(value as PlaceType | "all")}
          disabled={isLoading}
        >
          <SelectTrigger id="place-type" className="w-full">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {PLACE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Radius Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="uppercase tracking-wide text-sm">Search Radius</Label>
          <span className="text-sm text-muted-foreground">{radius} km</span>
        </div>
        <Slider
          value={[radius]}
          onValueChange={(value) => setRadius(value[0])}
          min={1}
          max={50}
          step={1}
          disabled={isLoading}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 km</span>
          <span>50 km</span>
        </div>
      </div>

      {/* Search Button */}
      <Button type="submit" className="w-full bg-nb-blue text-black hover:bg-nb-blue" disabled={isLoading || !query.trim()}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Search Google Places
          </>
        )}
      </Button>
    </form>
  );
}
