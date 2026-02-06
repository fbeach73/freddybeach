"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PostEditor } from "./post-editor";
import { categories } from "@/lib/data/categories";
import { slugify } from "@/lib/blog/utils";
import { Save, Upload, Eye, Loader2, Images } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MediaLibrary } from "./media-library";
import type { BlogPostDraft, BlogImage } from "@/types/blog";

interface PostFormProps {
  post?: BlogPostDraft;
  mode: "create" | "edit";
}

export function PostForm({ post, mode }: PostFormProps) {
  const router = useRouter();
  const isMountedRef = useRef(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Track mounted state for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Form state
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [categoryId, setCategoryId] = useState(post?.categoryId || "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    post?.featuredImageUrl || ""
  );
  const [featuredImageAlt, setFeaturedImageAlt] = useState(
    post?.featuredImageAlt || ""
  );
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    post?.metaDescription || ""
  );
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  // Handle featured image selection from media library
  const handleFeaturedImageSelect = (image: BlogImage) => {
    setFeaturedImageUrl(image.url);
    setFeaturedImageAlt(image.altText);
    setIsMediaLibraryOpen(false);
  };

  // Auto-generate slug from title (only in create mode and if slug is empty)
  useEffect(() => {
    if (mode === "create" && title && !slug) {
      setSlug(slugify(title));
    }
  }, [title, mode, slug]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        categoryId: categoryId || null,
        featuredImageUrl: featuredImageUrl || null,
        featuredImageAlt: featuredImageAlt || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      };

      const url =
        mode === "create"
          ? "/api/blog/posts"
          : `/api/blog/posts/${post?.id}`;

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save post");
      }

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      toast.success(
        mode === "create" ? "Post created!" : "Post saved!"
      );

      if (mode === "create") {
        router.push(`/admin/blog/${data.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      toast.error(
        error instanceof Error ? error.message : "Failed to save post"
      );
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  const handlePublish = async () => {
    if (!post?.id) {
      toast.error("Save the post first before publishing");
      return;
    }

    // Validate required fields
    const errors: string[] = [];
    if (!title.trim()) errors.push("Title");
    if (!content.trim()) errors.push("Content");
    if (!featuredImageUrl) errors.push("Featured image");
    if (!featuredImageAlt) errors.push("Featured image alt text");
    if (!categoryId) errors.push("Category");

    if (errors.length > 0) {
      toast.error(`Missing required fields: ${errors.join(", ")}`);
      return;
    }

    setIsPublishing(true);

    try {
      // Save first to ensure latest content is saved
      await handleSave();

      // Check if component is still mounted
      if (!isMountedRef.current) return;

      // Then publish
      const response = await fetch(`/api/blog/posts/${post.id}/publish`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to publish post");
      }

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;

      toast.success("Post published successfully!");
      router.push("/admin/blog");
      router.refresh();
    } catch (error) {
      if (!isMountedRef.current) return;
      toast.error(
        error instanceof Error ? error.message : "Failed to publish post"
      );
    } finally {
      if (isMountedRef.current) {
        setIsPublishing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">
            {mode === "create" ? "Create New Post" : "Edit Post"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Start writing a new blog post"
              : `Editing: ${post?.title}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Draft
          </Button>
          {mode === "edit" && post?.status === "published" && (
            <Button variant="outline" asChild>
              <a href={`/${post.slug}`} target="_blank" rel="noopener">
                <Eye className="mr-2 h-4 w-4" />
                View
              </a>
            </Button>
          )}
          {mode === "edit" && post?.status !== "published" && (
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Publish
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base uppercase tracking-tight">Title</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                className="text-lg"
              />
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base uppercase tracking-tight">Content</CardTitle>
              <CardDescription>
                Write your post using the rich text editor below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PostEditor
                content={content}
                onChange={setContent}
                placeholder="Start writing your amazing post..."
                blogPostId={post?.id}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Status */}
          {mode === "edit" && post && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base uppercase tracking-tight">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      post.status === "published"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : post.status === "draft"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>
                  {post.publishedAt && (
                    <span className="text-sm text-muted-foreground">
                      Published{" "}
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* URL Slug */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base uppercase tracking-tight">URL Slug</CardTitle>
              <CardDescription>
                The URL path for this post: /{slug || "..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="url-slug"
              />
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base uppercase tracking-tight">Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base uppercase tracking-tight">Featured Image</CardTitle>
              <CardDescription>
                The main image shown in listings and social shares
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Media Library Button */}
              <Dialog
                open={isMediaLibraryOpen}
                onOpenChange={setIsMediaLibraryOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Images className="mr-2 h-4 w-4" />
                    Select from Media Library
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select Featured Image</DialogTitle>
                    <DialogDescription>
                      Choose an image from your media library or upload a new one.
                    </DialogDescription>
                  </DialogHeader>
                  <MediaLibrary
                    onSelect={handleFeaturedImageSelect}
                    selectionMode
                    blogPostId={post?.id}
                  />
                </DialogContent>
              </Dialog>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t-2 border-nb-border/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    or enter URL
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured-image-url">Image URL</Label>
                <Input
                  id="featured-image-url"
                  value={featuredImageUrl}
                  onChange={(e) => setFeaturedImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featured-image-alt">
                  Alt Text <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="featured-image-alt"
                  value={featuredImageAlt}
                  onChange={(e) => setFeaturedImageAlt(e.target.value)}
                  placeholder="Describe the image for accessibility"
                />
              </div>
              {featuredImageUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-none border-2 border-nb-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredImageUrl}
                    alt={featuredImageAlt || "Featured image preview"}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base uppercase tracking-tight">SEO</CardTitle>
              <CardDescription>
                Customize how this post appears in search results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="excerpt">
                  Excerpt / Description
                  <span className="text-muted-foreground text-xs ml-2">
                    ({excerpt.length}/160)
                  </span>
                </Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description for listings and social shares..."
                  rows={3}
                  maxLength={300}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-title">
                  Meta Title
                  <span className="text-muted-foreground text-xs ml-2">
                    (optional, defaults to post title)
                  </span>
                </Label>
                <Input
                  id="meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Custom title for search engines"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-description">
                  Meta Description
                  <span className="text-muted-foreground text-xs ml-2">
                    (optional, defaults to excerpt)
                  </span>
                </Label>
                <Textarea
                  id="meta-description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Custom description for search engines..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
