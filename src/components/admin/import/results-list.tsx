"use client";

import { FileSearch, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaceResultCard, PlaceResultCardSkeleton } from "./place-result-card";
import type { FormattedPlace } from "@/lib/services/google-places";

interface ResultsListProps {
  places: FormattedPlace[];
  selectedPlaces: Set<string>;
  categoryAssignments: Map<string, string>;
  importedPlaceIds: Set<string>;
  onToggleSelect: (placeId: string) => void;
  onCategoryChange: (placeId: string, categoryId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onImport: () => void;
  onLoadMore: () => void;
  hasMoreResults: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isImporting: boolean;
  hasSearched: boolean;
}

export function ResultsList({
  places,
  selectedPlaces,
  categoryAssignments,
  importedPlaceIds,
  onToggleSelect,
  onCategoryChange,
  onSelectAll,
  onDeselectAll,
  onImport,
  onLoadMore,
  hasMoreResults,
  isLoading,
  isLoadingMore,
  isImporting,
  hasSearched,
}: ResultsListProps) {
  // Count how many selected places have categories assigned
  const selectedWithCategories = Array.from(selectedPlaces).filter(
    (id) => categoryAssignments.has(id) && !importedPlaceIds.has(id)
  ).length;

  // Count importable selections (not already imported)
  const importableSelected = Array.from(selectedPlaces).filter(
    (id) => !importedPlaceIds.has(id)
  ).length;

  // Show loading skeleton
  if (isLoading && places.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded bg-muted" />
            <div className="h-9 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <PlaceResultCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  // Show empty state when no search has been performed
  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <FileSearch className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Search for Businesses</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the search form to find businesses from Google Places
        </p>
      </div>
    );
  }

  // Show empty state when search returned no results
  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <FileSearch className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No Results Found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search query or expanding the radius
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <div className="text-sm text-muted-foreground">
          {places.length} result{places.length !== 1 ? "s" : ""} found
          {selectedPlaces.size > 0 && (
            <span className="ml-2 font-medium text-foreground">
              ({importableSelected} selected)
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            disabled={isImporting}
            className="flex-1 sm:flex-none"
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDeselectAll}
            disabled={selectedPlaces.size === 0 || isImporting}
            className="flex-1 sm:flex-none"
          >
            Deselect All
          </Button>
          <Button
            size="sm"
            onClick={onImport}
            disabled={
              importableSelected === 0 ||
              selectedWithCategories !== importableSelected ||
              isImporting
            }
            className="w-full sm:w-auto"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                Import Selected
                {importableSelected > 0 && ` (${importableSelected})`}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Category Warning */}
      {importableSelected > 0 && selectedWithCategories !== importableSelected && (
        <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          Please assign a category to all selected businesses before importing.
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {places.map((place) => (
          <PlaceResultCard
            key={place.id}
            place={place}
            isSelected={selectedPlaces.has(place.id)}
            onToggleSelect={onToggleSelect}
            categoryId={categoryAssignments.get(place.id)}
            onCategoryChange={onCategoryChange}
            isAlreadyImported={importedPlaceIds.has(place.googlePlaceId)}
          />
        ))}
      </div>

      {/* Loading More */}
      {isLoadingMore && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <PlaceResultCardSkeleton key={`loading-${i}`} />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMoreResults && !isLoadingMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onLoadMore} disabled={isImporting}>
            Load More Results
          </Button>
        </div>
      )}
    </div>
  );
}
