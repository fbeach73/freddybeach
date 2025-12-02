"use client";

import * as React from "react";
import { useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Save,
  FolderOpen,
  Loader2,
  Settings2,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  Resolution,
  AspectRatio,
  GenerationSettings,
  Preset,
  PresetSettings,
} from "@/lib/types/image-generation";

// ============================================================================
// Constants
// ============================================================================

const RESOLUTIONS: { value: Resolution; label: string }[] = [
  { value: "1K", label: "1K (1024px)" },
  { value: "2K", label: "2K (2048px)" },
  { value: "4K", label: "4K (4096px)" },
];

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "1:1 Square" },
  { value: "16:9", label: "16:9 Landscape" },
  { value: "9:16", label: "9:16 Portrait" },
  { value: "4:3", label: "4:3 Standard" },
  { value: "3:4", label: "3:4 Tall" },
  { value: "21:9", label: "21:9 Ultra-wide" },
];

const IMAGE_COUNT_OPTIONS = [1, 2, 3, 4] as const;

// ============================================================================
// Types
// ============================================================================

interface PreviewGenerateProps {
  /** The assembled prompt from scene settings */
  prompt: string;
  /** Callback when the prompt is manually edited */
  onPromptChange: (prompt: string) => void;
  /** Current generation settings */
  settings: {
    resolution: Resolution;
    aspectRatio: AspectRatio;
    imageCount: number;
  };
  /** Callback when settings change */
  onSettingsChange: (settings: {
    resolution: Resolution;
    aspectRatio: AspectRatio;
    imageCount: number;
  }) => void;
  /** Callback to generate images */
  onGenerate: (prompt: string, settings: GenerationSettings) => Promise<void>;
  /** Whether generation is in progress */
  isGenerating?: boolean;
  /** Available presets */
  presets?: Preset[];
  /** Callback to save current settings as preset */
  onSavePreset?: (name: string, settings: PresetSettings) => Promise<void>;
  /** Callback to load a preset */
  onLoadPreset?: (preset: Preset) => void;
  /** Whether user has API key configured */
  hasApiKey?: boolean;
  /** Remaining tokens (if using app key) */
  tokensRemaining?: number;
  /** Token limit (if using app key) */
  tokenLimit?: number;
  /** Selected avatar IDs for generation */
  selectedAvatarIds?: string[];
}

// ============================================================================
// Component
// ============================================================================

export function PreviewGenerate({
  prompt,
  onPromptChange,
  settings,
  onSettingsChange,
  onGenerate,
  isGenerating = false,
  presets = [],
  onSavePreset,
  onLoadPreset,
  hasApiKey = false,
  tokensRemaining,
  tokenLimit,
  selectedAvatarIds = [],
}: PreviewGenerateProps) {
  const [isSavingPreset, setIsSavingPreset] = React.useState(false);
  const [presetDialogOpen, setPresetDialogOpen] = React.useState(false);

  // Handle generation
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    const generationSettings: GenerationSettings = {
      resolution: settings.resolution,
      aspectRatio: settings.aspectRatio,
      imageCount: settings.imageCount,
      avatarIds: selectedAvatarIds.length > 0 ? selectedAvatarIds : undefined,
    };

    await onGenerate(prompt, generationSettings);
  }, [prompt, settings, selectedAvatarIds, onGenerate]);

  // Handle saving preset
  const handleSavePreset = useCallback(async () => {
    if (!onSavePreset) return;

    const name = window.prompt("Enter a name for this preset:");
    if (!name) return;

    setIsSavingPreset(true);
    try {
      await onSavePreset(name, {
        resolution: settings.resolution,
        aspectRatio: settings.aspectRatio,
        imageCount: settings.imageCount,
      });
    } finally {
      setIsSavingPreset(false);
    }
  }, [onSavePreset, settings]);

  // Handle loading preset
  const handleLoadPreset = useCallback(
    (presetId: string) => {
      const preset = presets.find((p) => p.id === presetId);
      if (preset && onLoadPreset) {
        onLoadPreset(preset);
        onSettingsChange({
          resolution: preset.settings.resolution,
          aspectRatio: preset.settings.aspectRatio,
          imageCount: preset.settings.imageCount,
        });
      }
    },
    [presets, onLoadPreset, onSettingsChange]
  );

  // Update individual settings
  const updateResolution = (value: Resolution) => {
    onSettingsChange({ ...settings, resolution: value });
  };

  const updateAspectRatio = (value: AspectRatio) => {
    onSettingsChange({ ...settings, aspectRatio: value });
  };

  const updateImageCount = (value: number) => {
    onSettingsChange({ ...settings, imageCount: value });
  };

  // Can generate check
  const canGenerate =
    prompt.trim().length > 0 &&
    !isGenerating &&
    (hasApiKey || (tokensRemaining !== undefined && tokensRemaining > 0));

  // Keyboard shortcut: Ctrl/Cmd + Enter to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canGenerate) {
        e.preventDefault();
        handleGenerate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canGenerate, handleGenerate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Preview & Generate</h2>
        <p className="text-sm text-muted-foreground">
          Review your prompt and generate images
        </p>
      </div>

      {/* Preset Buttons Row */}
      <div className="flex items-center gap-2">
        <TooltipProvider>
          {/* Load Preset */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Select
                  value=""
                  onValueChange={handleLoadPreset}
                  disabled={isGenerating || presets.length === 0}
                >
                  <SelectTrigger className="w-auto gap-2">
                    <FolderOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {presets.length === 0 ? "No Presets" : "Load Preset"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {presets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {presets.length === 0
                ? "No saved presets yet"
                : "Load a saved preset"}
            </TooltipContent>
          </Tooltip>

          {/* Save Preset */}
          {onSavePreset && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSavePreset}
                  disabled={isGenerating || isSavingPreset}
                  className="gap-2"
                >
                  {isSavingPreset ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Save Preset</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save current settings as a preset</TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>

      {/* Generated Prompt Section */}
      <div className="space-y-2">
        <Label htmlFor="generated-prompt" className="text-sm font-medium">
          Generated Prompt
        </Label>
        <Textarea
          id="generated-prompt"
          placeholder="Your prompt will appear here based on scene settings, or type directly..."
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="min-h-[140px] resize-none font-mono text-sm"
          disabled={isGenerating}
        />
        <p className="text-xs text-muted-foreground">
          Edit the prompt above or build it using the scene settings on the left
        </p>
      </div>

      {/* Generation Settings Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Generation Settings
          </h3>
        </div>

        {/* Number of Images */}
        <div className="space-y-2">
          <Label className="text-sm">Number of Images</Label>
          <div className="flex gap-2">
            {IMAGE_COUNT_OPTIONS.map((count) => (
              <Button
                key={count}
                variant={settings.imageCount === count ? "default" : "outline"}
                size="sm"
                onClick={() => updateImageCount(count)}
                disabled={isGenerating}
                className={cn(
                  "flex-1 font-mono",
                  settings.imageCount === count && "ring-2 ring-primary ring-offset-2"
                )}
              >
                {count}
              </Button>
            ))}
          </div>
        </div>

        {/* Resolution */}
        <div className="space-y-2">
          <Label className="text-sm">Resolution</Label>
          <Select
            value={settings.resolution}
            onValueChange={(v) => updateResolution(v as Resolution)}
            disabled={isGenerating}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESOLUTIONS.map((res) => (
                <SelectItem key={res.value} value={res.value}>
                  {res.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <Label className="text-sm">Aspect Ratio</Label>
          <Select
            value={settings.aspectRatio}
            onValueChange={(v) => updateAspectRatio(v as AspectRatio)}
            disabled={isGenerating}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASPECT_RATIOS.map((ratio) => (
                <SelectItem key={ratio.value} value={ratio.value}>
                  {ratio.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Generate Section */}
      <div className="space-y-4 pt-2">
        {/* API Key Status / Generate Button */}
        {!hasApiKey && tokensRemaining === 0 ? (
          // No tokens remaining - need API key or upgrade
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div className="flex-1">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    No generations remaining
                  </p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                    Add your own Google AI API key for unlimited generations, or
                    upgrade your plan.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/ai-tools/image-generator?tab=settings">
                  <User className="mr-2 h-4 w-4" />
                  Go to Profile Settings
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          // Has tokens or API key - show generate button
          <>
            {/* Token/Key Status */}
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                {hasApiKey ? (
                  <span className="text-green-600 dark:text-green-400">
                    Using your API key (unlimited)
                  </span>
                ) : tokensRemaining !== undefined && tokenLimit !== undefined ? (
                  <span>
                    {tokensRemaining} of {tokenLimit} generations remaining
                  </span>
                ) : null}
              </div>
              <div className="hidden text-xs text-muted-foreground sm:block">
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
                  Ctrl
                </kbd>
                {" + "}
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
                  Enter
                </kbd>
                {" to generate"}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Images
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
