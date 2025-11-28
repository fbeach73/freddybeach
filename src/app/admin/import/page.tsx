"use client";

import { useState, useCallback, useMemo } from "react";
import { Download, Search, Zap } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SearchForm } from "@/components/admin/import/search-form";
import { ResultsList } from "@/components/admin/import/results-list";
import { ImportConfirmationDialog } from "@/components/admin/import/import-confirmation-dialog";
import { BulkImportTab } from "@/components/admin/import/bulk-import-tab";
import type { PlaceType, FormattedPlace } from "@/lib/services/google-places";
import type { SearchResponse } from "@/app/api/admin/google-places/search/route";
import type { ImportSummary } from "@/app/api/admin/google-places/import/route";

interface SearchResultWithDuplicate extends FormattedPlace {
  isDuplicate: boolean;
  existingBusinessId?: string;
}

export default function ImportPage() {
  // Search state
  const [places, setPlaces] = useState<SearchResultWithDuplicate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();

  // Last search params (for pagination)
  const [lastSearchParams, setLastSearchParams] = useState<{
    query: string;
    type?: PlaceType;
    radius: number;
  } | null>(null);

  // Selection state
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [categoryAssignments, setCategoryAssignments] = useState<Map<string, string>>(new Map());

  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Track imported place IDs (from search results that are already in DB)
  const importedPlaceIds = useMemo(
    () => new Set(places.filter((p) => p.isDuplicate).map((p) => p.googlePlaceId)),
    [places]
  );

  // Search handler
  const handleSearch = useCallback(async (params: {
    query: string;
    type?: PlaceType;
    radius: number;
  }) => {
    setIsSearching(true);
    setHasSearched(true);
    setLastSearchParams(params);

    // Reset selections and results
    setPlaces([]);
    setSelectedPlaces(new Set());
    setCategoryAssignments(new Map());
    setNextPageToken(undefined);

    try {
      const response = await fetch("/api/admin/google-places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: params.query,
          type: params.type,
          radius: params.radius,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Search failed");
      }

      const data: SearchResponse = await response.json();
      setPlaces(data.places);
      setNextPageToken(data.nextPageToken);

      if (data.places.length === 0) {
        toast.info("No results found", {
          description: "Try adjusting your search query or expanding the radius.",
        });
      } else {
        const duplicateCount = data.places.filter((p) => p.isDuplicate).length;
        toast.success(`Found ${data.places.length} result${data.places.length !== 1 ? "s" : ""}`, {
          description: duplicateCount > 0
            ? `${duplicateCount} already imported`
            : undefined,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Load more handler
  const handleLoadMore = useCallback(async () => {
    if (!nextPageToken || !lastSearchParams) return;

    setIsLoadingMore(true);

    try {
      const response = await fetch("/api/admin/google-places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: lastSearchParams.query,
          type: lastSearchParams.type,
          radius: lastSearchParams.radius,
          pageToken: nextPageToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load more results");
      }

      const data: SearchResponse = await response.json();
      setPlaces((prev) => [...prev, ...data.places]);
      setNextPageToken(data.nextPageToken);
    } catch (error) {
      console.error("Load more error:", error);
      toast.error("Failed to load more results", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPageToken, lastSearchParams]);

  // Selection handlers
  const handleToggleSelect = useCallback((placeId: string) => {
    setSelectedPlaces((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) {
        next.delete(placeId);
      } else {
        next.add(placeId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const selectableIds = places
      .filter((p) => !p.isDuplicate)
      .map((p) => p.id);
    setSelectedPlaces(new Set(selectableIds));
  }, [places]);

  const handleDeselectAll = useCallback(() => {
    setSelectedPlaces(new Set());
  }, []);

  const handleCategoryChange = useCallback((placeId: string, categoryId: string) => {
    setCategoryAssignments((prev) => {
      const next = new Map(prev);
      next.set(placeId, categoryId);
      return next;
    });
  }, []);

  // Import handlers
  const handleImportClick = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  const handleConfirmImport = useCallback(async () => {
    setIsImporting(true);

    // Get selected places that are not already imported
    const placesToImport = places
      .filter((p) => selectedPlaces.has(p.id) && !importedPlaceIds.has(p.googlePlaceId))
      .map((p) => ({
        placeData: p as FormattedPlace,
        categoryId: categoryAssignments.get(p.id)!,
      }));

    if (placesToImport.length === 0) {
      toast.error("No businesses to import", {
        description: "All selected businesses have already been imported.",
      });
      setIsImporting(false);
      setShowConfirmDialog(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/google-places/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ places: placesToImport }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Import failed");
      }

      const summary: ImportSummary = await response.json();

      // Update the places list to mark newly imported ones as duplicates
      const newlyImportedIds = new Set(
        summary.importedBusinesses.map((b) => b.googlePlaceId)
      );

      setPlaces((prev) =>
        prev.map((p) =>
          newlyImportedIds.has(p.googlePlaceId)
            ? { ...p, isDuplicate: true }
            : p
        )
      );

      // Clear selections
      setSelectedPlaces(new Set());

      // Show success toast
      if (summary.imported > 0) {
        toast.success(`${summary.imported} business${summary.imported !== 1 ? "es" : ""} imported`, {
          description: summary.skipped > 0
            ? `${summary.skipped} skipped (already imported)`
            : "Saved as drafts. Review them in Business Management.",
        });
      } else if (summary.skipped > 0) {
        toast.info("No new businesses imported", {
          description: `${summary.skipped} were already in the database.`,
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Import failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsImporting(false);
      setShowConfirmDialog(false);
    }
  }, [places, selectedPlaces, categoryAssignments, importedPlaceIds]);

  // Get places for confirmation dialog (selected and not already imported)
  const selectedPlacesForImport = places.filter(
    (p) => selectedPlaces.has(p.id) && !importedPlaceIds.has(p.googlePlaceId)
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
          <Download className="h-5 w-5 sm:h-6 sm:w-6" />
          Import Businesses
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Search Google Places to find and import businesses to your directory.
        </p>
      </div>

      {/* Tabs for Manual Search vs Bulk Import */}
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Manual Search
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Bulk Import
          </TabsTrigger>
        </TabsList>

        {/* Manual Search Tab */}
        <TabsContent value="search" className="mt-4 sm:mt-6">
          {/* Two-column layout on desktop */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[350px_1fr]">
            {/* Search Form */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">Search Google Places</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Search for businesses in the Fredericton area
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <SearchForm onSearch={handleSearch} isLoading={isSearching} />
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div>
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">Search Results</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Select businesses to import and assign categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ErrorBoundary name="Search Results">
                    <ResultsList
                      places={places}
                      selectedPlaces={selectedPlaces}
                      categoryAssignments={categoryAssignments}
                      importedPlaceIds={importedPlaceIds}
                      onToggleSelect={handleToggleSelect}
                      onCategoryChange={handleCategoryChange}
                      onSelectAll={handleSelectAll}
                      onDeselectAll={handleDeselectAll}
                      onImport={handleImportClick}
                      onLoadMore={handleLoadMore}
                      hasMoreResults={!!nextPageToken}
                      isLoading={isSearching}
                      isLoadingMore={isLoadingMore}
                      isImporting={isImporting}
                      hasSearched={hasSearched}
                    />
                  </ErrorBoundary>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Bulk Import Tab */}
        <TabsContent value="bulk" className="mt-4 sm:mt-6">
          <BulkImportTab />
        </TabsContent>
      </Tabs>

      {/* Import Confirmation Dialog */}
      <ImportConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        places={selectedPlacesForImport}
        categoryAssignments={categoryAssignments}
        onConfirm={handleConfirmImport}
        isImporting={isImporting}
      />
    </div>
  );
}
