/**
 * Type definitions for AI Image Generation feature
 */

// Resolution options for image generation
export type Resolution = "1K" | "2K" | "4K";

// Scene category types for the prompt builder
export type SceneCategory = "style" | "location" | "lighting" | "camera";

/**
 * Scene Preset - A predefined option for scene settings
 */
export interface ScenePreset {
  id: string;
  name: string;
  description: string;
  promptText: string;
}

/**
 * Scene Settings - Selected values for each scene category
 * Can be either a preset or a custom string value
 */
export interface SceneSettings {
  style?: ScenePreset | string;
  location?: ScenePreset | string;
  lighting?: ScenePreset | string;
  camera?: ScenePreset | string;
}

// Aspect ratio options for image generation
export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9";

// Avatar type (human or object reference)
export type AvatarType = "human" | "object";

// Generation status
export type GenerationStatus = "pending" | "processing" | "completed" | "failed";

/**
 * Avatar - Reference image for consistent character/object generation
 */
export interface Avatar {
  id: string;
  name: string;
  type: AvatarType;
  imageUrl: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Preset settings - Saved configuration for quick reuse
 */
export interface PresetSettings {
  resolution: Resolution;
  aspectRatio: AspectRatio;
  imageCount: number;
  style?: string;
  negativePrompt?: string;
}

/**
 * Preset - Named preset configuration
 */
export interface Preset {
  id: string;
  userId: string;
  name: string;
  settings: PresetSettings;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Generation settings - Configuration for a single generation
 */
export interface GenerationSettings {
  resolution: Resolution;
  aspectRatio: AspectRatio;
  imageCount: number;
  style?: string;
  negativePrompt?: string;
  avatarIds?: string[];
  sceneSettings?: SceneSettings;
}

/**
 * Options for generating images
 */
export interface GenerateOptions {
  prompt: string;
  userId: string;
  apiKey?: string;
  settings: GenerationSettings;
  avatarIds?: string[];
}

/**
 * Generated image data
 */
export interface GeneratedImageData {
  imageBytes: string; // Base64 encoded image
  width: number;
  height: number;
  raiFilteredReason?: string;
}

/**
 * Result of an image generation request
 */
export interface GenerationResult {
  success: boolean;
  images?: GeneratedImageData[];
  error?: string;
  usedAppKey: boolean;
}

/**
 * Stored generation record
 */
export interface Generation {
  id: string;
  userId: string;
  prompt: string;
  status: GenerationStatus;
  settings: GenerationSettings;
  usedAppKey: boolean;
  errorMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Stored generated image record
 */
export interface GeneratedImage {
  id: string;
  generationId: string;
  userId: string;
  imageUrl: string;
  isPublic: boolean;
  width?: number | null;
  height?: number | null;
  createdAt: Date;
}

/**
 * Generation history entry (for conversation/refinement tracking)
 */
export interface GenerationHistoryEntry {
  id: string;
  generationId: string;
  role: "user" | "assistant";
  content: string;
  imageUrls?: string[] | null;
  createdAt: Date;
}

/**
 * Image with like count for gallery display
 */
export interface GalleryImage extends GeneratedImage {
  likeCount: number;
  isLiked?: boolean;
  prompt?: string;
  userName?: string;
  userImage?: string | null;
}

/**
 * Paginated gallery response
 */
export interface GalleryResponse {
  images: GalleryImage[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * API key status response
 */
export interface ApiKeyStatus {
  hasKey: boolean;
  keyHint?: string;
  provider: string;
}

/**
 * Create avatar input
 */
export interface CreateAvatarInput {
  name: string;
  type: AvatarType;
  description?: string;
}

/**
 * Update avatar input
 */
export interface UpdateAvatarInput {
  name?: string;
  type?: AvatarType;
  description?: string;
}

/**
 * Create preset input
 */
export interface CreatePresetInput {
  name: string;
  settings: PresetSettings;
}

/**
 * Update preset input
 */
export interface UpdatePresetInput {
  name?: string;
  settings?: PresetSettings;
}

/**
 * Generate request body
 */
export interface GenerateRequestBody {
  prompt: string;
  settings: GenerationSettings;
}

/**
 * Refine request body
 */
export interface RefineRequestBody {
  instruction: string;
  imageId?: string;
}
