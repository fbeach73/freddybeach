"use client";

import { useState, useCallback, useEffect } from "react";
import { Sparkles, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type {
  Resolution,
  AspectRatio,
  GenerationSettings,
  Avatar,
  Preset,
  PresetSettings,
} from "@/lib/types/image-generation";

const RESOLUTIONS: { value: Resolution; label: string }[] = [
  { value: "1K", label: "1K (1024px)" },
  { value: "2K", label: "2K (2048px)" },
  { value: "4K", label: "4K (4096px)" },
];

const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: "1:1", label: "Square", icon: "1:1" },
  { value: "16:9", label: "Landscape", icon: "16:9" },
  { value: "9:16", label: "Portrait", icon: "9:16" },
  { value: "4:3", label: "Standard", icon: "4:3" },
  { value: "3:4", label: "Tall", icon: "3:4" },
  { value: "21:9", label: "Ultra-wide", icon: "21:9" },
];

interface PromptBuilderProps {
  onGenerate: (prompt: string, settings: GenerationSettings) => Promise<void>;
  isGenerating?: boolean;
  avatars?: Avatar[];
  presets?: Preset[];
  onSavePreset?: (name: string, settings: PresetSettings) => Promise<void>;
  tokensRemaining?: number;
  tokenLimit?: number;
  hasApiKey?: boolean;
}

export function PromptBuilder({
  onGenerate,
  isGenerating = false,
  avatars = [],
  presets = [],
  onSavePreset,
  tokensRemaining,
  tokenLimit,
  hasApiKey = false,
}: PromptBuilderProps) {
  const [prompt, setPrompt] = useState("");
  const [resolution, setResolution] = useState<Resolution>("2K");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [imageCount, setImageCount] = useState(1);
  const [selectedAvatars, setSelectedAvatars] = useState<string[]>([]);
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    const settings: GenerationSettings = {
      resolution,
      aspectRatio,
      imageCount,
      avatarIds: selectedAvatars.length > 0 ? selectedAvatars : undefined,
    };

    await onGenerate(prompt, settings);
  }, [prompt, resolution, aspectRatio, imageCount, selectedAvatars, onGenerate]);

  const handleLoadPreset = useCallback((preset: Preset) => {
    const { settings } = preset;
    setResolution(settings.resolution);
    setAspectRatio(settings.aspectRatio);
    setImageCount(settings.imageCount);
  }, []);

  const handleSavePreset = useCallback(async () => {
    if (!onSavePreset) return;

    const name = window.prompt("Enter a name for this preset:");
    if (!name) return;

    setIsSavingPreset(true);
    try {
      await onSavePreset(name, {
        resolution,
        aspectRatio,
        imageCount,
      });
    } finally {
      setIsSavingPreset(false);
    }
  }, [onSavePreset, resolution, aspectRatio, imageCount]);

  const toggleAvatar = useCallback((avatarId: string) => {
    setSelectedAvatars((prev) =>
      prev.includes(avatarId)
        ? prev.filter((id) => id !== avatarId)
        : [...prev, avatarId]
    );
  }, []);

  const canGenerate = prompt.trim().length > 0 && !isGenerating && (hasApiKey || (tokensRemaining !== undefined && tokensRemaining > 0));

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
    <Card>
      <CardContent className="space-y-6 pt-6">
        {/* Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="prompt">Describe your image</Label>
          <Textarea
            id="prompt"
            placeholder="A serene mountain landscape at sunset with dramatic clouds..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none"
            disabled={isGenerating}
          />
        </div>

        {/* Settings Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Resolution */}
          <div className="space-y-2">
            <Label>Resolution</Label>
            <Select
              value={resolution}
              onValueChange={(v) => setResolution(v as Resolution)}
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
            <Label>Aspect Ratio</Label>
            <Select
              value={aspectRatio}
              onValueChange={(v) => setAspectRatio(v as AspectRatio)}
              disabled={isGenerating}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {ratio.icon}
                      </span>
                      {ratio.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image Count */}
          <div className="space-y-2">
            <Label>Images ({imageCount})</Label>
            <Slider
              value={[imageCount]}
              onValueChange={([v]) => setImageCount(v)}
              min={1}
              max={4}
              step={1}
              disabled={isGenerating}
              className="py-2"
            />
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <Label>Presets</Label>
            <div className="flex gap-2">
              <Select
                value=""
                onValueChange={(v) => {
                  const preset = presets.find((p) => p.id === v);
                  if (preset) handleLoadPreset(preset);
                }}
                disabled={isGenerating || presets.length === 0}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Load preset" />
                </SelectTrigger>
                <SelectContent>
                  {presets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {onSavePreset && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSavePreset}
                  disabled={isGenerating || isSavingPreset}
                  title="Save current settings as preset"
                >
                  {isSavingPreset ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Avatars Selection */}
        {avatars.length > 0 && (
          <div className="space-y-2">
            <Label>Reference Avatars (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled={isGenerating}
                >
                  {selectedAvatars.length > 0 ? (
                    <span className="flex flex-wrap gap-1">
                      {selectedAvatars.map((id) => {
                        const avatar = avatars.find((a) => a.id === id);
                        return avatar ? (
                          <Badge key={id} variant="secondary">
                            {avatar.name}
                          </Badge>
                        ) : null;
                      })}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Select avatars to include...
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-2">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={avatar.id}
                        checked={selectedAvatars.includes(avatar.id)}
                        onCheckedChange={() => toggleAvatar(avatar.id)}
                      />
                      <label
                        htmlFor={avatar.id}
                        className="flex flex-1 items-center gap-2 text-sm"
                      >
                        {avatar.imageUrl && (
                          <img
                            src={avatar.imageUrl}
                            alt={avatar.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{avatar.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {avatar.type}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Generate Button & Token Display */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {hasApiKey ? (
              <span className="text-green-600 dark:text-green-400">
                Using your API key (unlimited)
              </span>
            ) : tokensRemaining !== undefined && tokenLimit !== undefined ? (
              <span>
                {tokensRemaining} of {tokenLimit} generations remaining
              </span>
            ) : null}
            <span className="hidden text-xs sm:inline">
              Press <kbd className="rounded border bg-muted px-1 font-mono">Ctrl</kbd>+<kbd className="rounded border bg-muted px-1 font-mono">Enter</kbd> to generate
            </span>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="min-w-[140px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
