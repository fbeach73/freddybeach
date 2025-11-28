"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontal, Eye, EyeOff, Trash2, ExternalLink, Pencil, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import type { business } from "@/lib/schema";
import type { InferSelectModel } from "drizzle-orm";
import { getCategoryById } from "@/lib/data/categories";

type Business = InferSelectModel<typeof business>;

interface BusinessActionsProps {
  business: Business;
}

export function BusinessActions({ business }: BusinessActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get the category to build the public listing URL
  const category = business.categoryId ? getCategoryById(business.categoryId) : null;
  const publicListingUrl = category ? `/${category.slug}/${business.slug}` : null;

  const handleStatusToggle = async () => {
    const newStatus = business.status === "published" ? "draft" : "published";

    try {
      const response = await fetch(`/api/admin/businesses/${business.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(
        newStatus === "published"
          ? "Business published successfully"
          : "Business unpublished"
      );
      router.refresh();
    } catch {
      toast.error("Failed to update business status");
    }
  };

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/admin/businesses/${business.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve business");
      }

      toast.success("Business approved and published");
      router.refresh();
    } catch {
      toast.error("Failed to approve business");
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`/api/admin/businesses/${business.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject business");
      }

      toast.success("Business rejected and moved to drafts");
      router.refresh();
    } catch {
      toast.error("Failed to reject business");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/businesses/${business.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete business");
      }

      toast.success("Business deleted successfully");
      setShowDeleteDialog(false);
      router.refresh();
    } catch {
      toast.error("Failed to delete business");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href={`/admin/businesses/${business.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Listing
            </Link>
          </DropdownMenuItem>

          {publicListingUrl && (
            <DropdownMenuItem asChild>
              <Link href={publicListingUrl} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                View Listing
              </Link>
            </DropdownMenuItem>
          )}

          {business.googlePlaceId && (
            <DropdownMenuItem asChild>
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${business.googlePlaceId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Google Maps
              </a>
            </DropdownMenuItem>
          )}

          {business.status === "pending_review" ? (
            <>
              <DropdownMenuItem
                onClick={handleApprove}
                className="text-green-600 focus:text-green-600"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve & Publish
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleReject}
                className="text-orange-600 focus:text-orange-600"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={handleStatusToggle}>
              {business.status === "published" ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Publish
                </>
              )}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{business.name}&quot;? This action cannot
              be undone and will also delete all associated images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
