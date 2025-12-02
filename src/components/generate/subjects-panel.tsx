"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Upload,
  Trash2,
  User,
  Package,
  Loader2,
  X,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type {
  Avatar,
  AvatarType,
  CreateAvatarInput,
} from "@/lib/types/image-generation";

interface SubjectsPanelProps {
  avatars: Avatar[];
  selectedAvatarIds: string[];
  isLoading?: boolean;
  onSelectAvatar: (avatarId: string) => void;
  onDeselectAvatar: (avatarId: string) => void;
  onCreateAvatar: (
    data: CreateAvatarInput,
    file: File
  ) => Promise<{ success: boolean; error?: string }>;
  onDeleteAvatar: (id: string) => Promise<boolean>;
}

export function SubjectsPanel({
  avatars,
  selectedAvatarIds,
  isLoading = false,
  onSelectAvatar,
  onDeselectAvatar,
  onCreateAvatar,
  onDeleteAvatar,
}: SubjectsPanelProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState<Avatar | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [createName, setCreateName] = useState("");
  const [createType, setCreateType] = useState<AvatarType>("human");
  const [createDescription, setCreateDescription] = useState("");
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [createPreview, setCreatePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get selected avatars
  const selectedAvatars = avatars.filter((a) =>
    selectedAvatarIds.includes(a.id)
  );

  const resetCreateForm = useCallback(() => {
    setCreateName("");
    setCreateType("human");
    setCreateDescription("");
    setCreateFile(null);
    setCreatePreview(null);
    setError(null);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          setError("Please select an image file");
          return;
        }
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError("Image must be less than 5MB");
          return;
        }
        setCreateFile(file);
        setError(null);
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setCreatePreview(e.target?.result as string);
        };
        reader.onerror = () => {
          setError("Failed to read image file");
          setCreateFile(null);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }
      setCreateFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCreatePreview(e.target?.result as string);
      };
      reader.onerror = () => {
        setError("Failed to read image file");
        setCreateFile(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCreate = useCallback(async () => {
    if (!createName.trim() || !createFile) {
      setError("Name and image are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onCreateAvatar(
        {
          name: createName.trim(),
          type: createType,
          description: createDescription.trim() || undefined,
        },
        createFile
      );

      if (result.success) {
        setError(null);
        setIsCreateOpen(false);
        resetCreateForm();
      } else {
        setError(result.error || "Failed to create subject");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    createName,
    createType,
    createDescription,
    createFile,
    onCreateAvatar,
    resetCreateForm,
  ]);

  const handleDelete = useCallback(async () => {
    if (!deletingAvatar) return;

    setIsSubmitting(true);
    try {
      const success = await onDeleteAvatar(deletingAvatar.id);
      if (success) {
        // Also deselect if it was selected
        if (selectedAvatarIds.includes(deletingAvatar.id)) {
          onDeselectAvatar(deletingAvatar.id);
        }
      }
      setDeletingAvatar(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [deletingAvatar, onDeleteAvatar, selectedAvatarIds, onDeselectAvatar]);

  const handleToggleSelect = useCallback(
    (avatar: Avatar) => {
      if (selectedAvatarIds.includes(avatar.id)) {
        onDeselectAvatar(avatar.id);
      } else {
        onSelectAvatar(avatar.id);
      }
    },
    [selectedAvatarIds, onSelectAvatar, onDeselectAvatar]
  );

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Subjects
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Subject
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : avatars.length === 0 ? (
          // Empty state with dashed border
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 py-8 text-center"
            role="button"
            tabIndex={0}
            onClick={() => setIsCreateOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsCreateOpen(true);
              }
            }}
          >
            <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No subjects added yet
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                setIsCreateOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Your First Subject
            </Button>
          </div>
        ) : (
          // Subject cards list
          <div className="space-y-2">
            {avatars.map((avatar) => {
              const isSelected = selectedAvatarIds.includes(avatar.id);
              return (
                <div
                  key={avatar.id}
                  className={`group flex items-center gap-3 rounded-lg border p-2 transition-colors cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => handleToggleSelect(avatar)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleToggleSelect(avatar);
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={avatar.imageUrl}
                      alt={avatar.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {avatar.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 text-[10px] capitalize"
                      >
                        {avatar.type === "human" ? (
                          <User className="mr-1 h-3 w-3" />
                        ) : (
                          <Package className="mr-1 h-3 w-3" />
                        )}
                        {avatar.type}
                      </Badge>
                    </div>
                    {avatar.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {avatar.description}
                      </p>
                    )}
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingAvatar(avatar);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}

            {/* Selected count indicator */}
            {selectedAvatars.length > 0 && (
              <p className="text-xs text-muted-foreground pt-2">
                {selectedAvatars.length} subject
                {selectedAvatars.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}
      </div>

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
            <DialogTitle>Add Subject</DialogTitle>
            <DialogDescription>
              Upload an image to use as a reference for consistent generation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload */}
            <div
              className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-muted-foreground/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {createPreview ? (
                <div className="relative h-32 w-32">
                  <Image
                    src={createPreview}
                    alt="Preview"
                    fill
                    className="rounded-lg object-cover"
                    unoptimized
                  />
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    className="absolute -right-2 -top-2"
                    onClick={() => {
                      setCreateFile(null);
                      setCreatePreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max 5MB, PNG or JPG
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                placeholder="e.g., John, Red Car, Logo"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="create-type">Type</Label>
              <Select
                value={createType}
                onValueChange={(v) => setCreateType(v as AvatarType)}
              >
                <SelectTrigger id="create-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="human">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Human
                    </span>
                  </SelectItem>
                  <SelectItem value="object">
                    <span className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Object
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="create-description">Description (optional)</Label>
              <Textarea
                id="create-description"
                placeholder="Additional details about this subject..."
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Error */}
            {error && <p className="text-sm text-destructive">{error}</p>}
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
              disabled={!createName.trim() || !createFile || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Subject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingAvatar}
        onOpenChange={(open) => {
          if (!open) setDeletingAvatar(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingAvatar?.name}
              &quot;? This action cannot be undone.
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
