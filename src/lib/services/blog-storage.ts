import { put, del } from "@vercel/blob";
import { db } from "@/lib/db";
import { blogImage } from "@/lib/schema";
import { eq, desc, like, and, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { BlogImage } from "@/types/blog";

// Allowed image types for blog uploads
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface UploadBlogImageParams {
  file: File;
  altText: string;
  blogPostId?: string;
}

export interface UploadBlogImageResult {
  success: boolean;
  image?: BlogImage;
  error?: string;
}

/**
 * Validate an image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.map(t => t.split("/")[1]).join(", ")}`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Upload a blog image to Vercel Blob and save metadata to database
 */
export async function uploadBlogImage({
  file,
  altText,
  blogPostId,
}: UploadBlogImageParams): Promise<UploadBlogImageResult> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Validate alt text
  if (!altText || altText.trim().length === 0) {
    return { success: false, error: "Alt text is required for accessibility" };
  }

  try {
    // Generate a unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[^a-zA-Z0-9-_]/g, "-") // Sanitize
      .substring(0, 50); // Limit length
    const uniqueFilename = `${sanitizedName}-${nanoid(8)}.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(`blog/${uniqueFilename}`, file, {
      access: "public",
      contentType: file.type,
    });

    // Generate a unique ID for the database record
    const id = nanoid();

    // Save metadata to database
    const [inserted] = await db
      .insert(blogImage)
      .values({
        id,
        url: blob.url,
        filename: uniqueFilename,
        altText: altText.trim(),
        blogPostId: blogPostId || null,
        fileSize: file.size,
        mimeType: file.type,
        // Note: width and height would require image processing
        // We'll leave these null for now and could add later with sharp
      })
      .returning();

    return {
      success: true,
      image: {
        id: inserted.id,
        url: inserted.url,
        filename: inserted.filename,
        altText: inserted.altText,
        blogPostId: inserted.blogPostId || undefined,
        fileSize: inserted.fileSize || undefined,
        mimeType: inserted.mimeType || undefined,
        width: inserted.width || undefined,
        height: inserted.height || undefined,
        createdAt: inserted.createdAt,
      },
    };
  } catch (error) {
    console.error("Error uploading blog image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
}

/**
 * Delete a blog image from Vercel Blob and database
 */
export async function deleteBlogImage(imageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the image record first
    const [image] = await db
      .select()
      .from(blogImage)
      .where(eq(blogImage.id, imageId))
      .limit(1);

    if (!image) {
      return { success: false, error: "Image not found" };
    }

    // Delete from Vercel Blob
    try {
      await del(image.url);
    } catch (blobError) {
      console.error("Error deleting from blob storage:", blobError);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from database
    await db.delete(blogImage).where(eq(blogImage.id, imageId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting blog image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete image",
    };
  }
}

export interface ListBlogImagesParams {
  search?: string;
  blogPostId?: string;
  limit?: number;
  offset?: number;
}

export interface ListBlogImagesResult {
  images: BlogImage[];
  total: number;
}

/**
 * List blog images with optional filters
 */
export async function listBlogImages({
  search,
  blogPostId,
  limit = 50,
  offset = 0,
}: ListBlogImagesParams = {}): Promise<ListBlogImagesResult> {
  try {
    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(like(blogImage.filename, `%${search}%`));
    }

    if (blogPostId) {
      conditions.push(eq(blogImage.blogPostId, blogPostId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: count() })
      .from(blogImage)
      .where(whereClause);
    const total = countResult[0]?.count ?? 0;

    // Get paginated results
    const images = await db
      .select()
      .from(blogImage)
      .where(whereClause)
      .orderBy(desc(blogImage.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        filename: img.filename,
        altText: img.altText,
        blogPostId: img.blogPostId || undefined,
        fileSize: img.fileSize || undefined,
        mimeType: img.mimeType || undefined,
        width: img.width || undefined,
        height: img.height || undefined,
        createdAt: img.createdAt,
      })),
      total,
    };
  } catch (error) {
    console.error("Error listing blog images:", error);
    return { images: [], total: 0 };
  }
}

/**
 * Get a single blog image by ID
 */
export async function getBlogImage(imageId: string): Promise<BlogImage | null> {
  try {
    const [image] = await db
      .select()
      .from(blogImage)
      .where(eq(blogImage.id, imageId))
      .limit(1);

    if (!image) {
      return null;
    }

    return {
      id: image.id,
      url: image.url,
      filename: image.filename,
      altText: image.altText,
      blogPostId: image.blogPostId || undefined,
      fileSize: image.fileSize || undefined,
      mimeType: image.mimeType || undefined,
      width: image.width || undefined,
      height: image.height || undefined,
      createdAt: image.createdAt,
    };
  } catch (error) {
    console.error("Error getting blog image:", error);
    return null;
  }
}
