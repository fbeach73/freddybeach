"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Settings2,
  Loader2,
  FileSliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type {
  Preset,
  PresetSettings,
  Resolution,
  AspectRatio,
} from "@/lib/types/image-generation";

const RESOLUTIONS: { value: Resolution; label: string }[] = [
  { value: "1K", label: "1K (1024px)" },
  { value: "2K", label: "2K (2048px)" },
  { value: "4K", label: "4K (4096px)" },
];

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "9:16", label: "Portrait (9:16)" },
  { value: "4:3", label: "Standard (4:3)" },
  { value: "3:4", label: "Tall (3:4)" },
  { value: "21:9", label: "Ultra-wide (21:9)" },
];

interface PresetManagerProps {
  presets: Preset[];
  isLoading?: boolean;
  onCreatePreset: (name: string, settings: PresetSettings) => Promise<{ success: boolean; error?: string }>;
  onUpdatePreset: (id: string, data: { name?: string; settings?: PresetSettings }) => Promise<{ success: boolean; error?: string }>;
  onDeletePreset: (id: string) => Promise<boolean>;
  onLoadPreset?: (preset: Preset) => void;
}

export function PresetManager({
  presets,
  isLoading = false,
  onCreatePreset,
  onUpdatePreset,
  onDeletePreset,
  onLoadPreset,
}: PresetManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [deletingPreset, setDeletingPreset] = useState<Preset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [createName, setCreateName] = useState("");
  const [createResolution, setCreateResolution] = useState<Resolution>("2K");
  const [createAspectRatio, setCreateAspectRatio] = useState<AspectRatio>("1:1");
  const [createImageCount, setCreateImageCount] = useState(1);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editResolution, setEditResolution] = useState<Resolution>("2K");
  const [editAspectRatio, setEditAspectRatio] = useState<AspectRatio>("1:1");
  const [editImageCount, setEditImageCount] = useState(1);

  const resetCreateForm = useCallback(() => {
    setCreateName("");
    setCreateResolution("2K");
    setCreateAspectRatio("1:1");
    setCreateImageCount(1);
    setError(null);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!createName.trim()) {
      setError("Name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onCreatePreset(createName.trim(), {
        resolution: createResolution,
        aspectRatio: createAspectRatio,
        imageCount: createImageCount,
      });

      if (result.success) {
        setIsCreateOpen(false);
        resetCreateForm();
      } else {
        setError(result.error || "Failed to create preset");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [createName, createResolution, createAspectRatio, createImageCount, onCreatePreset, resetCreateForm]);

  const handleOpenEdit = useCallback((preset: Preset) => {
    setEditingPreset(preset);
    setEditName(preset.name);
    setEditResolution(preset.settings.resolution);
    setEditAspectRatio(preset.settings.aspectRatio);
    setEditImageCount(preset.settings.imageCount);
    setError(null);
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!editingPreset || !editName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onUpdatePreset(editingPreset.id, {
        name: editName.trim(),
        settings: {
          resolution: editResolution,
          aspectRatio: editAspectRatio,
          imageCount: editImageCount,
        },
      });

      if (result.success) {
        setEditingPreset(null);
      } else {
        setError(result.error || "Failed to update preset");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [editingPreset, editName, editResolution, editAspectRatio, editImageCount, onUpdatePreset]);

  const handleDelete = useCallback(async () => {
    if (!deletingPreset) return;

    setIsSubmitting(true);
    try {
      await onDeletePreset(deletingPreset.id);
      setDeletingPreset(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [deletingPreset, onDeletePreset]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Presets</CardTitle>
              <CardDescription>
                Save your favorite generation settings for quick access
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Preset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : presets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileSliders className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No presets yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create presets to quickly apply your favorite settings
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create your first preset
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {presets.map((preset) => (
                <Card key={preset.id} className="group relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {preset.name}
                      </CardTitle>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(preset)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeletingPreset(preset)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {preset.settings.resolution}
                      </Badge>
                      <Badge variant="secondary">
                        {preset.settings.aspectRatio}
                      </Badge>
                      <Badge variant="secondary">
                        {preset.settings.imageCount} image
                        {preset.settings.imageCount > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    {onLoadPreset && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => onLoadPreset(preset)}
                      >
                        <Settings2 className="mr-2 h-4 w-4" />
                        Load Preset
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Preset</DialogTitle>
            <DialogDescription>
              Save your current settings as a reusable preset
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="create-preset-name">Name</Label>
              <Input
                id="create-preset-name"
                placeholder="e.g., Portrait Photos, Landscapes"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <Label htmlFor="create-resolution">Resolution</Label>
              <Select
                value={createResolution}
                onValueChange={(v) => setCreateResolution(v as Resolution)}
              >
                <SelectTrigger id="create-resolution">
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
              <Label htmlFor="create-aspect">Aspect Ratio</Label>
              <Select
                value={createAspectRatio}
                onValueChange={(v) => setCreateAspectRatio(v as AspectRatio)}
              >
                <SelectTrigger id="create-aspect">
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

            {/* Image Count */}
            <div className="space-y-2">
              <Label>Images per generation ({createImageCount})</Label>
              <Slider
                value={[createImageCount]}
                onValueChange={([v]) => setCreateImageCount(v)}
                min={1}
                max={4}
                step={1}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!createName.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Preset"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingPreset}
        onOpenChange={(open) => {
          if (!open) setEditingPreset(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Preset</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-preset-name">Name</Label>
              <Input
                id="edit-preset-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <Label htmlFor="edit-resolution">Resolution</Label>
              <Select
                value={editResolution}
                onValueChange={(v) => setEditResolution(v as Resolution)}
              >
                <SelectTrigger id="edit-resolution">
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
              <Label htmlFor="edit-aspect">Aspect Ratio</Label>
              <Select
                value={editAspectRatio}
                onValueChange={(v) => setEditAspectRatio(v as AspectRatio)}
              >
                <SelectTrigger id="edit-aspect">
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

            {/* Image Count */}
            <div className="space-y-2">
              <Label>Images per generation ({editImageCount})</Label>
              <Slider
                value={[editImageCount]}
                onValueChange={([v]) => setEditImageCount(v)}
                min={1}
                max={4}
                step={1}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingPreset(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!editName.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingPreset}
        onOpenChange={(open) => {
          if (!open) setDeletingPreset(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingPreset?.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
