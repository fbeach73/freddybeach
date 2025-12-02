/**
 * Shared validation constants for image generation
 */

export const VALID_RESOLUTIONS = ["1K", "2K", "4K"] as const;
export const VALID_ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"] as const;

export const MIN_IMAGE_COUNT = 1;
export const MAX_IMAGE_COUNT = 4;

export type Resolution = (typeof VALID_RESOLUTIONS)[number];
export type AspectRatio = (typeof VALID_ASPECT_RATIOS)[number];
