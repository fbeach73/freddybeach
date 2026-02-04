"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/lib/data/categories";
import { DynamicIcon } from "@/lib/utils/icons";
import type { BulkImportSummary } from "@/app/api/admin/google-places/bulk-import/route";

export function BulkImportTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportSummary | null>(null);

  const handleImport = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const response = await fetch("/api/admin/google-places/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: selectedCategory }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Import failed");
      }

      const result: BulkImportSummary = await response.json();
      setImportResult(result);

      if (result.imported > 0) {
        toast.success(
          `Imported ${result.imported} listing${result.imported !== 1 ? "s" : ""}`,
          {
            description:
              result.skipped > 0
                ? `${result.skipped} duplicate${result.skipped !== 1 ? "s" : ""} skipped`
                : "Saved as drafts. Review them in Business Management.",
          }
        );
      } else if (result.skipped > 0) {
        toast.info("No new businesses imported", {
          description: `${result.skipped} were already in the database.`,
        });
      } else {
        toast.info("No businesses found", {
          description: "No businesses matched the quality criteria (rating >= 4.0, reviews >= 10).",
        });
      }
    } catch (error) {
      console.error("Bulk import error:", error);
      toast.error("Import failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Select Category</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Choose a category to import top-rated businesses from Google Places
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <DynamicIcon name={category.icon} className="h-4 w-4" />
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCategoryData && (
            <div className="border-2 border-nb-border bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-nb-blue/20 border-2 border-nb-border">
                  <DynamicIcon
                    name={selectedCategoryData.icon}
                    className="h-5 w-5 text-nb-blue"
                  />
                </div>
                <div>
                  <p className="font-bold">{selectedCategoryData.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategoryData.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-2 border-nb-orange bg-nb-orange/10 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-nb-orange" />
              <div className="space-y-1 text-sm">
                <p className="font-bold">
                  Import Criteria
                </p>
                <ul className="list-inside list-disc text-muted-foreground">
                  <li>Rating: 4.0 stars or higher</li>
                  <li>Reviews: 10+ user ratings</li>
                  <li>Location: Fredericton, NB area</li>
                  <li>Sorted by: Popularity</li>
                  <li>Limit: Up to 20 businesses</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={handleImport}
            disabled={!selectedCategory || isImporting}
            className="w-full"
            size="lg"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Import Top 20 Businesses
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Import Complete
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Summary of the bulk import operation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-nb-border bg-nb-green/10 p-4">
                <p className="text-2xl font-bold text-nb-green">
                  {importResult.imported}
                </p>
                <p className="text-sm font-bold">
                  Imported
                </p>
              </div>
              <div className="border-2 border-nb-border bg-nb-orange/10 p-4">
                <p className="text-2xl font-bold text-nb-orange">
                  {importResult.skipped}
                </p>
                <p className="text-sm font-bold">
                  Skipped
                </p>
              </div>
            </div>

            {/* Imported Businesses */}
            {importResult.importedBusinesses.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-bold">
                  <CheckCircle className="h-4 w-4 text-nb-green" />
                  Imported Businesses
                </h4>
                <ScrollArea className="h-[200px] rounded-md border">
                  <div className="p-4 space-y-2">
                    {importResult.importedBusinesses.map((biz) => (
                      <div
                        key={biz.id}
                        className="flex items-center justify-between border-2 border-nb-border/20 bg-muted/50 px-3 py-2"
                      >
                        <span className="text-sm font-bold">{biz.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Draft
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Skipped Businesses */}
            {importResult.skippedPlaces.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-bold">
                  <XCircle className="h-4 w-4 text-nb-orange" />
                  Skipped Businesses
                </h4>
                <ScrollArea className="h-[200px] rounded-md border">
                  <div className="p-4 space-y-2">
                    {importResult.skippedPlaces.map((place) => (
                      <div
                        key={place.googlePlaceId || `skipped-${place.name}`}
                        className="flex items-center justify-between border-2 border-nb-border/20 bg-muted/50 px-3 py-2"
                      >
                        <span className="text-sm">{place.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {place.reason === "duplicate_google_id"
                            ? "Duplicate (ID)"
                            : place.reason === "duplicate_name_address"
                              ? "Duplicate (Name/Address)"
                              : place.reason}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Empty State */}
            {importResult.imported === 0 && importResult.skipped === 0 && (
              <div className="border-2 border-dashed border-nb-border/30 p-8 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No businesses found matching the quality criteria.
                </p>
                <p className="text-xs text-muted-foreground">
                  Try a different category or adjust your search criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
