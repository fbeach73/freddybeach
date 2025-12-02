"use client";

import * as React from "react";
import { Search, Circle, CheckCircle2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { ScenePreset } from "@/lib/types/image-generation";

interface SceneSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  presets: ScenePreset[];
  value?: ScenePreset | string;
  onSelect: (value: ScenePreset | string | undefined) => void;
}

export function SceneSelectorModal({
  open,
  onOpenChange,
  title,
  description,
  presets,
  value,
  onSelect,
}: SceneSelectorModalProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [customValue, setCustomValue] = React.useState("");
  const [localSelection, setLocalSelection] = React.useState<
    ScenePreset | string | undefined
  >(value);

  // Reset local state when modal opens
  React.useEffect(() => {
    if (open) {
      setSearchQuery("");
      setLocalSelection(value);
      // If current value is a custom string, populate the custom input
      if (typeof value === "string") {
        setCustomValue(value);
      } else {
        setCustomValue("");
      }
    }
  }, [open, value]);

  // Filter presets based on search query
  const filteredPresets = React.useMemo(() => {
    if (!searchQuery.trim()) return presets;

    const normalizedQuery = searchQuery.toLowerCase().trim();
    return presets.filter(
      (preset) =>
        preset.name.toLowerCase().includes(normalizedQuery) ||
        preset.description.toLowerCase().includes(normalizedQuery) ||
        preset.promptText.toLowerCase().includes(normalizedQuery)
    );
  }, [presets, searchQuery]);

  // Check if a preset is selected
  const isPresetSelected = (preset: ScenePreset) => {
    if (!localSelection) return false;
    if (typeof localSelection === "string") return false;
    return localSelection.id === preset.id;
  };

  // Check if custom value is selected
  const isCustomSelected =
    typeof localSelection === "string" && localSelection.length > 0;

  // Handle preset selection
  const handlePresetSelect = (preset: ScenePreset) => {
    setLocalSelection(preset);
    setCustomValue(""); // Clear custom when selecting preset
  };

  // Handle custom value submission
  const handleUseCustom = () => {
    if (customValue.trim()) {
      setLocalSelection(customValue.trim());
    }
  };

  // Handle confirm
  const handleConfirm = () => {
    onSelect(localSelection);
    onOpenChange(false);
  };

  // Handle clear selection
  const handleClearSelection = () => {
    setLocalSelection(undefined);
    setCustomValue("");
  };

  // Handle cancel
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Custom Value Section */}
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Custom Value</span>
            {isCustomSelected && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Type your own value..."
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customValue.trim()) {
                  handleUseCustom();
                }
              }}
              className="flex-1"
            />
            <Button
              variant={isCustomSelected ? "default" : "secondary"}
              size="sm"
              onClick={handleUseCustom}
              disabled={!customValue.trim()}
            >
              Use Custom
            </Button>
          </div>
        </div>

        {/* Preset Count */}
        <div className="text-sm text-muted-foreground">
          {filteredPresets.length} preset{filteredPresets.length !== 1 && "s"}{" "}
          available
        </div>

        {/* Preset Grid */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
            {filteredPresets.map((preset) => {
              const isSelected = isPresetSelected(preset);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={cn(
                    "relative text-left p-3 rounded-lg border transition-all",
                    "hover:border-primary/50 hover:bg-accent/50",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card"
                  )}
                >
                  {/* Selection Indicator */}
                  <div className="absolute top-2 right-2">
                    {isSelected ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>

                  {/* Preset Content */}
                  <div className="pr-6 space-y-1.5">
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {preset.description}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground/70 bg-muted/50 rounded px-1.5 py-1 line-clamp-1">
                      {preset.promptText}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredPresets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No presets match &quot;{searchQuery}&quot;
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Try a different search or use a custom value
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button
            variant="ghost"
            onClick={handleClearSelection}
            disabled={!localSelection}
          >
            No Selection
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              {localSelection ? "Confirm Selection" : "Confirm"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
