"use client";

import * as React from "react";
import { ChevronRight, Palette, MapPin, Sun, Camera, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SceneSelectorModal } from "./scene-selector-modal";
import {
  stylePresets,
  locationPresets,
  lightingPresets,
  cameraPresets,
  sceneCategories,
} from "@/lib/data/scene-presets";
import type { ScenePreset, SceneSettings as SceneSettingsType } from "@/lib/types/image-generation";

interface SceneSettingsProps {
  value: SceneSettingsType;
  onChange: (settings: SceneSettingsType) => void;
}

type SceneCategory = "style" | "location" | "lighting" | "camera";

interface SelectorConfig {
  category: SceneCategory;
  icon: React.ElementType;
  placeholder: string;
  presets: ScenePreset[];
}

const selectorConfigs: SelectorConfig[] = [
  {
    category: "style",
    icon: Palette,
    placeholder: "Select or type style...",
    presets: stylePresets,
  },
  {
    category: "location",
    icon: MapPin,
    placeholder: "Select or type location...",
    presets: locationPresets,
  },
  {
    category: "lighting",
    icon: Sun,
    placeholder: "Select or type lighting...",
    presets: lightingPresets,
  },
  {
    category: "camera",
    icon: Camera,
    placeholder: "Select or type camera angle...",
    presets: cameraPresets,
  },
];

function getDisplayValue(value: ScenePreset | string | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.name;
}

export function SceneSettings({ value, onChange }: SceneSettingsProps) {
  const [openModal, setOpenModal] = React.useState<SceneCategory | null>(null);

  const handleSelect = (category: SceneCategory, selection: ScenePreset | string | undefined) => {
    onChange({
      ...value,
      [category]: selection,
    });
  };

  const handleClear = (category: SceneCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      ...value,
      [category]: undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Scene Settings
        </h3>
      </div>

      {/* Selector Buttons */}
      <div className="space-y-2">
        {selectorConfigs.map((config) => {
          const Icon = config.icon;
          const currentValue = value[config.category];
          const displayValue = getDisplayValue(currentValue);
          const categoryInfo = sceneCategories[config.category];

          return (
            <React.Fragment key={config.category}>
              <button
                type="button"
                onClick={() => setOpenModal(config.category)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
                  "hover:border-primary/50 hover:bg-accent/50",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  displayValue
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                    displayValue
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Label and Value */}
                <div className="flex-1 text-left min-w-0">
                  <div className="text-xs font-medium text-muted-foreground">
                    {categoryInfo.label}
                  </div>
                  <div
                    className={cn(
                      "text-sm truncate",
                      displayValue ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {displayValue || config.placeholder}
                  </div>
                </div>

                {/* Clear button or Arrow */}
                {displayValue ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => handleClear(config.category, e)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear {categoryInfo.label}</span>
                  </Button>
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>

              {/* Modal for this category */}
              <SceneSelectorModal
                open={openModal === config.category}
                onOpenChange={(open) => setOpenModal(open ? config.category : null)}
                title={`Select ${categoryInfo.label}`}
                description={categoryInfo.description}
                presets={config.presets}
                value={currentValue}
                onSelect={(selection) => handleSelect(config.category, selection)}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
