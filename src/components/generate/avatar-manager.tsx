"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Upload,
  Trash2,
  Edit2,
  User,
  Package,
  Loader2,
  X,
  ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  UpdateAvatarInput,
} from "@/lib/types/image-generation";

interface AvatarManagerProps {
  avatars: Avatar[];
  isLoading?: boolean;
  onCreateAvatar: (data: CreateAvatarInput, file: File) => Promise<{ success: boolean; error?: string }>;
  onUpdateAvatar: (id: string, data: UpdateAvatarInput) => Promise<{ success: boolean; error?: string }>;
  onDeleteAvatar: (id: string) => Promise<boolean>;
}

export function AvatarManager({
  avatars,
  isLoading = false,
  onCreateAvatar,
  onUpdateAvatar,
  onDeleteAvatar,
}: AvatarManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState<Avatar | null>(null);
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

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<AvatarType>("human");
  const [editDescription, setEditDescription] = useState("");

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
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
    },
    []
  );

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
        setError(result.error || "Failed to create avatar");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [createName, createType, createDescription, createFile, onCreateAvatar, resetCreateForm]);

  const handleOpenEdit = useCallback((avatar: Avatar) => {
    setEditingAvatar(avatar);
    setEditName(avatar.name);
    setEditType(avatar.type);
    setEditDescription(avatar.description || "");
    setError(null);
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!editingAvatar || !editName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onUpdateAvatar(editingAvatar.id, {
        name: editName.trim(),
        type: editType,
        description: editDescription.trim() || undefined,
      });

      if (result.success) {
        setError(null);
        setEditingAvatar(null);
      } else {
        setError(result.error || "Failed to update avatar");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [editingAvatar, editName, editType, editDescription, onUpdateAvatar]);

  const handleDelete = useCallback(async () => {
    if (!deletingAvatar) return;

    setIsSubmitting(true);
    try {
      await onDeleteAvatar(deletingAvatar.id);
      setDeletingAvatar(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [deletingAvatar, onDeleteAvatar]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Avatars</CardTitle>
              <CardDescription>
                Reference images for consistent character or object generation
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Avatar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : avatars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageOff className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No avatars yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create avatars to maintain consistent characters across
                generations
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create your first avatar
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className="group relative overflow-hidden rounded-lg border bg-card"
                >
                  {/* Image */}
                  <div className="aspect-square relative">
                    <Image
                      src={avatar.imageUrl}
                      alt={avatar.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      {avatar.type === "human" ? (
                        <User className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Package className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{avatar.name}</span>
                    </div>
                    {avatar.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {avatar.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute inset-x-0 top-0 flex justify-end gap-1 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => handleOpenEdit(avatar)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => setDeletingAvatar(avatar)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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
            <DialogTitle>Create Avatar</DialogTitle>
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
              <Label htmlFor="create-description">
                Description (optional)
              </Label>
              <Textarea
                id="create-description"
                placeholder="Additional details about this avatar..."
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                className="resize-none"
                rows={3}
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
              disabled={!createName.trim() || !createFile || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Avatar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingAvatar}
        onOpenChange={(open) => {
          if (!open) setEditingAvatar(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Avatar</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview */}
            {editingAvatar && (
              <div className="flex justify-center">
                <div className="relative h-32 w-32">
                  <Image
                    src={editingAvatar.imageUrl}
                    alt={editingAvatar.name}
                    fill
                    className="rounded-lg object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={editType}
                onValueChange={(v) => setEditType(v as AvatarType)}
              >
                <SelectTrigger id="edit-type">
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
              <Label htmlFor="edit-description">
                Description (optional)
              </Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="resize-none"
                rows={3}
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
              onClick={() => setEditingAvatar(null)}
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
        open={!!deletingAvatar}
        onOpenChange={(open) => {
          if (!open) setDeletingAvatar(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Avatar</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingAvatar?.name}&quot;? This
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
