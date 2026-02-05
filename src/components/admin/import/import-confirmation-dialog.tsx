"use client";

import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { categories, getCategoryById } from "@/lib/data/categories";
import type { FormattedPlace } from "@/lib/services/google-places";

interface ImportConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  places: FormattedPlace[];
  categoryAssignments: Map<string, string>;
  onConfirm: () => void;
  isImporting: boolean;
}

export function ImportConfirmationDialog({
  open,
  onOpenChange,
  places,
  categoryAssignments,
  onConfirm,
  isImporting,
}: ImportConfirmationDialogProps) {
  // Group places by category for summary
  const placesByCategory = new Map<string, FormattedPlace[]>();
  places.forEach((place) => {
    const categoryId = categoryAssignments.get(place.id);
    if (categoryId) {
      const existing = placesByCategory.get(categoryId) || [];
      placesByCategory.set(categoryId, [...existing, place]);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm Import</DialogTitle>
          <DialogDescription>
            You are about to import {places.length} business
            {places.length !== 1 ? "es" : ""} as drafts. Review the details
            below.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            {/* Summary by Category */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">By Category</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(placesByCategory.entries()).map(([catId, catPlaces]) => {
                  const category = getCategoryById(catId);
                  return (
                    <Badge key={catId} variant="secondary">
                      {category?.name || catId}: {catPlaces.length}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Detailed List */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Businesses to Import</h4>
              <div className="divide-y-2 divide-nb-border/10 rounded-none border-2 border-nb-border">
                {places.map((place) => {
                  const categoryId = categoryAssignments.get(place.id);
                  const category = categoryId
                    ? getCategoryById(categoryId)
                    : undefined;

                  return (
                    <div
                      key={place.id}
                      className="flex items-center justify-between gap-2 p-3 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{place.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {place.shortAddress || place.address}
                        </p>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0 text-xs">
                        {category?.name || "Uncategorized"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <p className="text-xs text-muted-foreground">
              All imported businesses will be saved as drafts. You can review
              and publish them from the Businesses management page.
            </p>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isImporting} className="bg-nb-green text-black hover:bg-nb-green">
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>Import {places.length} Business{places.length !== 1 ? "es" : ""}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
