"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Upload,
  Archive,
  ArchiveRestore,
} from "lucide-react";
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
import type { blogPost } from "@/lib/schema";
import type { InferSelectModel } from "drizzle-orm";

type BlogPost = InferSelectModel<typeof blogPost>;

interface BlogPostActionsProps {
  post: BlogPost;
}

export function BlogPostActions({ post }: BlogPostActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      const response = await fetch(`/api/blog/posts/${post.id}/publish`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to publish post");
      }

      toast.success("Post published successfully!");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to publish post"
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleArchive = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      if (!response.ok) {
        throw new Error("Failed to archive post");
      }

      toast.success("Post archived");
      router.refresh();
    } catch {
      toast.error("Failed to archive post");
    }
  };

  const handleUnarchive = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });

      if (!response.ok) {
        throw new Error("Failed to restore post");
      }

      toast.success("Post restored to drafts");
      router.refresh();
    } catch {
      toast.error("Failed to restore post");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/blog/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      toast.success("Post deleted successfully");
      setShowDeleteDialog(false);
      router.refresh();
    } catch {
      toast.error("Failed to delete post");
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
            <Link href={`/admin/blog/${post.id}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Post
            </Link>
          </DropdownMenuItem>

          {post.status === "published" && (
            <DropdownMenuItem asChild>
              <Link href={`/blog/${post.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                View Post
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {post.status === "draft" && (
            <DropdownMenuItem
              onClick={handlePublish}
              disabled={isPublishing}
              className="text-green-600 focus:text-green-600"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isPublishing ? "Publishing..." : "Publish"}
            </DropdownMenuItem>
          )}

          {post.status === "archived" ? (
            <DropdownMenuItem onClick={handleUnarchive}>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Restore to Drafts
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
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
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{post.title}&quot;? This
              action cannot be undone.
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
