"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Building2, Star, ImageIcon, Upload, Trash2, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { BusinessActions } from "./business-actions";
import { getCategoryById } from "@/lib/data/categories";
import type { business } from "@/lib/schema";
import type { InferSelectModel } from "drizzle-orm";

type Business = InferSelectModel<typeof business>;

interface BusinessListClientProps {
  businesses: Business[];
}

export function BusinessListClient({ businesses }: BusinessListClientProps) {
  const router = useRouter();
  const isMountedRef = useRef(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<"publish" | "unpublish" | "delete" | null>(null);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reset selection when businesses change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [businesses]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(businesses.map((b) => b.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const performBulkAction = async (action: "publish" | "unpublish" | "delete") => {
    if (selectedIds.size === 0) {
      toast.error("No businesses selected");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/admin/businesses/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          businessIds: Array.from(selectedIds),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} businesses`);
      }

      if (!isMountedRef.current) return;

      toast.success(data.message);
      setSelectedIds(new Set());
      setShowDeleteDialog(false);
      setPendingAction(null);
      router.refresh();
    } catch (error) {
      if (!isMountedRef.current) return;
      toast.error(error instanceof Error ? error.message : `Failed to ${action} businesses`);
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const handlePublish = () => performBulkAction("publish");
  const handleUnpublish = () => performBulkAction("unpublish");
  const handleDelete = () => {
    setPendingAction("delete");
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => performBulkAction("delete");

  const allSelected = businesses.length > 0 && selectedIds.size === businesses.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < businesses.length;

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-4 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Publish All
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleUnpublish}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <EyeOff className="mr-2 h-4 w-4" />
              )}
              Unpublish All
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete All
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto"
          >
            Clear selection
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
                {...(someSelected ? { "data-state": "indeterminate" } : {})}
              />
            </TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Images</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses.map((biz) => {
            const category = biz.categoryId ? getCategoryById(biz.categoryId) : null;
            const isSelected = selectedIds.has(biz.id);

            return (
              <TableRow key={biz.id} className={isSelected ? "bg-muted/50" : ""}>
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectOne(biz.id, checked as boolean)}
                    aria-label={`Select ${biz.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {biz.imageUrl ? (
                        <Image
                          src={biz.imageUrl}
                          alt={biz.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                          unoptimized={biz.imageUrl.startsWith("/api")}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Building2 className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate max-w-[200px]">{biz.name}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {biz.address}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {category ? (
                    <Badge variant="outline">{category.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={biz.status === "published" ? "default" : "secondary"}
                    className={
                      biz.status === "published"
                        ? "bg-green-600"
                        : biz.status === "pending_review"
                        ? "bg-orange-500 text-white"
                        : ""
                    }
                  >
                    {biz.status === "pending_review" ? "Pending Review" : biz.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {biz.rating ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span>{biz.rating.toFixed(1)}</span>
                      {biz.reviewCount && (
                        <span className="text-muted-foreground text-xs">
                          ({biz.reviewCount})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{biz.images?.length || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <BusinessActions business={biz} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} businesses?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected
              businesses and remove all associated images from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
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
