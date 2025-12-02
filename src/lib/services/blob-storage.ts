import { put, del } from "@vercel/blob";

const GOOGLE_PLACES_API_BASE = "https://places.googleapis.com/v1";

/**
 * Download a photo from Google Places API and upload to Vercel Blob storage
 * Returns the permanent blob URL
 */
export async function uploadGooglePlacePhoto(
  photoName: string,
  businessId: string,
  photoIndex: number,
  maxWidth: number = 800,
  maxHeight: number = 600
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_PLACES_API_KEY not configured");
    return null;
  }

  try {
    // Fetch the photo from Google Places API
    const photoUrl = `${GOOGLE_PLACES_API_BASE}/${photoName}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}`;

    const response = await fetch(photoUrl, {
      headers: {
        "X-Goog-Api-Key": apiKey,
      },
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`Failed to fetch Google photo: ${response.status}`);
      return null;
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Determine file extension from content type
    const ext = contentType.includes("png") ? "png" : "jpg";

    // Upload to Vercel Blob with a structured path
    const blob = await put(
      `businesses/${businessId}/photo-${photoIndex}.${ext}`,
      imageBuffer,
      {
        access: "public",
        contentType,
        addRandomSuffix: false, // Keep predictable URLs
      }
    );

    return blob.url;
  } catch (error) {
    console.error("Error uploading photo to blob storage:", error);
    return null;
  }
}

/**
 * Upload multiple photos for a business
 * Returns array of blob URLs (null entries for failed uploads)
 */
export async function uploadBusinessPhotos(
  photoNames: string[],
  businessId: string,
  maxPhotos: number = 5
): Promise<string[]> {
  // Limit the number of photos to upload
  const photosToUpload = photoNames.slice(0, maxPhotos);

  const uploadPromises = photosToUpload.map((photoName, index) =>
    uploadGooglePlacePhoto(photoName, businessId, index)
  );

  const results = await Promise.all(uploadPromises);

  // Filter out null values (failed uploads)
  return results.filter((url): url is string => url !== null);
}

/**
 * Delete all photos for a business from blob storage
 */
export async function deleteBusinessPhotos(urls: string[]): Promise<void> {
  const deletePromises = urls.map((url) => {
    try {
      return del(url);
    } catch (error) {
      console.error(`Failed to delete blob: ${url}`, error);
      return Promise.resolve();
    }
  });

  await Promise.all(deletePromises);
}

/**
 * Upload a single image from a URL (for user uploads or other sources)
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  path: string
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status}`);
      return null;
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    const blob = await put(path, imageBuffer, {
      access: "public",
      contentType,
    });

    return blob.url;
  } catch (error) {
    console.error("Error uploading image to blob storage:", error);
    return null;
  }
}

/**
 * Upload a generated image from base64 data to Vercel Blob storage
 * Used for AI-generated images
 */
export async function uploadGeneratedImage(
  imageBase64: string,
  userId: string,
  generationId: string,
  index: number
): Promise<string | null> {
  try {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64, "base64");

    // Determine content type (default to PNG for generated images)
    const contentType = "image/png";
    const ext = "png";

    // Create a structured path for generated images
    const path = `generated/${userId}/${generationId}/image-${index}.${ext}`;

    const blob = await put(path, imageBuffer, {
      access: "public",
      contentType,
    });

    return blob.url;
  } catch (error) {
    console.error("Error uploading generated image to blob storage:", error);
    return null;
  }
}

/**
 * Upload an avatar image from a File object to Vercel Blob storage
 * Returns the permanent blob URL
 */
export async function uploadAvatarImage(
  fileBuffer: ArrayBuffer,
  contentType: string,
  userId: string,
  avatarId: string
): Promise<string | null> {
  try {
    // Determine file extension from content type
    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : contentType.includes("gif")
          ? "gif"
          : "jpg";

    // Create a structured path for avatar images
    const path = `avatars/${userId}/${avatarId}.${ext}`;

    const blob = await put(path, fileBuffer, {
      access: "public",
      contentType,
    });

    return blob.url;
  } catch (error) {
    console.error("Error uploading avatar image to blob storage:", error);
    return null;
  }
}

/**
 * Delete a single image from blob storage
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    await del(url);
    return true;
  } catch (error) {
    console.error("Error deleting image from blob storage:", error);
    return false;
  }
}

/**
 * Delete all generated images for a specific generation
 */
export async function deleteGenerationImages(urls: string[]): Promise<void> {
  const deletePromises = urls.map((url) => {
    try {
      return del(url);
    } catch (error) {
      console.error(`Failed to delete generated image: ${url}`, error);
      return Promise.resolve();
    }
  });

  await Promise.all(deletePromises);
}
