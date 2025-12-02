import { GoogleGenAI, Part } from "@google/genai";
import { db } from "@/lib/db";
import { userApiKey, avatar } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import type {
  GenerateOptions,
  GenerationResult,
  Avatar,
} from "@/lib/types/image-generation";

// Image generation models
// Nano Banana Pro (Gemini 3 Pro Image) - best quality, highest capability
const NANO_BANANA_PRO_MODEL = "gemini-3-pro-image-preview";
// Nano Banana (Gemini 2.5 Flash Image) - faster, lower cost fallback
const NANO_BANANA_MODEL = "gemini-2.5-flash-image";

// Resolution to dimensions mapping
const RESOLUTION_MAP = {
  "1K": { width: 1024, height: 1024 },
  "2K": { width: 2048, height: 2048 },
  "4K": { width: 4096, height: 4096 },
};

/**
 * Create a new GoogleGenAI client with the provided API key
 */
export function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({ apiKey });
}

/**
 * Get the default app-provided API key
 */
export function getAppApiKey(): string {
  const key = process.env.GOOGLE_GENAI_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_GENAI_API_KEY environment variable is not set");
  }
  return key;
}

/**
 * Retrieve and decrypt a user's stored API key from the database
 */
export async function getUserApiKey(userId: string): Promise<string | null> {
  try {
    const result = await db
      .select()
      .from(userApiKey)
      .where(
        and(eq(userApiKey.userId, userId), eq(userApiKey.provider, "google"))
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const { encryptedKey, iv } = result[0];
    return decrypt(encryptedKey, iv);
  } catch (error) {
    console.error("Failed to retrieve user API key:", error);
    return null;
  }
}

/**
 * Create an image Part from various sources (base64, URL, or file buffer)
 */
export async function createImagePart(
  source: string | Buffer
): Promise<Part | null> {
  try {
    // If source is a Buffer, convert to base64
    if (Buffer.isBuffer(source)) {
      return {
        inlineData: {
          data: source.toString("base64"),
          mimeType: "image/jpeg", // Default to JPEG
        },
      };
    }

    // If source is a base64 string (data URL)
    if (source.startsWith("data:")) {
      const [header, data] = source.split(",");
      const mimeMatch = header.match(/data:([^;]+)/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

      return {
        inlineData: {
          data,
          mimeType,
        },
      };
    }

    // If source is a URL, fetch and convert to base64
    if (source.startsWith("http://") || source.startsWith("https://")) {
      const response = await fetch(source);
      if (!response.ok) {
        console.error(`Failed to fetch image from URL: ${response.status}`);
        return null;
      }

      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "image/jpeg";

      return {
        inlineData: {
          data: Buffer.from(buffer).toString("base64"),
          mimeType: contentType,
        },
      };
    }

    // Assume it's already a base64 string without data URL prefix
    return {
      inlineData: {
        data: source,
        mimeType: "image/jpeg",
      },
    };
  } catch (error) {
    console.error("Failed to create image part:", error);
    return null;
  }
}

/**
 * Build a prompt with avatar references
 * Avatars can be referenced in the prompt using @avatarName syntax
 */
export function buildPromptWithReferences(
  prompt: string,
  avatars: Avatar[]
): string {
  if (avatars.length === 0) {
    return prompt;
  }

  // Build avatar reference descriptions
  const avatarDescriptions = avatars
    .map((a) => {
      const typeDesc = a.type === "human" ? "person" : "object";
      return `- "${a.name}": A ${typeDesc}${a.description ? ` (${a.description})` : ""}`;
    })
    .join("\n");

  // Add avatar context to the prompt
  return `${prompt}

Note: The following reference images are included:
${avatarDescriptions}
Please incorporate these visual references into the generated image as specified in the prompt.`;
}

/**
 * Generate images using the user's API key (BYOK) or app key
 */
export async function generateWithUserKey(
  options: GenerateOptions
): Promise<GenerationResult> {
  const {
    prompt,
    userId,
    apiKey,
    settings,
    avatarIds = [],
  } = options;

  try {
    // Get the appropriate API key
    let effectiveApiKey: string | undefined = apiKey;
    let usedAppKey = false;

    if (!effectiveApiKey) {
      // Try to get user's stored key
      const userKey = await getUserApiKey(userId);
      if (userKey) {
        effectiveApiKey = userKey;
      }
    }

    if (!effectiveApiKey) {
      // Fall back to app key
      effectiveApiKey = getAppApiKey();
      usedAppKey = true;
    }

    // Create the Gemini client
    const client = createGeminiClient(effectiveApiKey);

    // Fetch avatars if specified
    let avatars: Avatar[] = [];
    if (avatarIds.length > 0) {
      const avatarResults = await db
        .select()
        .from(avatar)
        .where(eq(avatar.userId, userId));

      avatars = avatarResults
        .filter((a) => avatarIds.includes(a.id))
        .map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          imageUrl: a.imageUrl,
          description: a.description,
        }));
    }

    // Build the final prompt
    const finalPrompt = buildPromptWithReferences(prompt, avatars);

    // Build enhanced prompt with style and negative prompt
    let enhancedPrompt = finalPrompt;
    if (settings.style) {
      enhancedPrompt = `${finalPrompt}. Style: ${settings.style}`;
    }
    if (settings.negativePrompt) {
      enhancedPrompt = `${enhancedPrompt}. Avoid: ${settings.negativePrompt}`;
    }

    // Add aspect ratio guidance to prompt
    const aspectRatioHint = settings.aspectRatio === "16:9"
      ? "wide landscape format"
      : settings.aspectRatio === "9:16"
      ? "tall portrait format"
      : settings.aspectRatio === "4:3"
      ? "standard landscape format"
      : settings.aspectRatio === "3:4"
      ? "standard portrait format"
      : "square format";

    enhancedPrompt = `Generate an image in ${aspectRatioHint}: ${enhancedPrompt}`;

    // Process images array
    const images: Array<{
      imageBytes: string;
      width: number;
      height: number;
      raiFilteredReason?: string;
    }> = [];

    const imageCount = settings.imageCount || 1;

    // Generate images using Nano Banana Pro (Gemini 3 Pro Image)
    // Falls back to Nano Banana (Gemini 2.5 Flash Image) if Pro fails
    for (let i = 0; i < imageCount; i++) {
      let generated = false;

      // Try Nano Banana Pro first (best quality)
      for (const model of [NANO_BANANA_PRO_MODEL, NANO_BANANA_MODEL]) {
        if (generated) break;

        try {
          const response = await client.models.generateContent({
            model,
            contents: enhancedPrompt,
            config: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          });

          // Extract image from response
          if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData?.data) {
                const dimensions = calculateDimensions(
                  settings.resolution || "1K",
                  settings.aspectRatio || "1:1"
                );

                images.push({
                  imageBytes: part.inlineData.data,
                  width: dimensions.width,
                  height: dimensions.height,
                });
                generated = true;
                console.log(`Generated image ${i + 1} using ${model}`);
                break; // Only take first image from response
              }
            }
          }
        } catch (genError) {
          console.error(`Failed to generate image ${i + 1} with ${model}:`, genError);
          // Try next model
        }
      }

      if (!generated) {
        console.error(`Failed to generate image ${i + 1} with all models`);
      }
    }

    if (images.length === 0) {
      return {
        success: false,
        error: "No images were generated. The model may not support image generation or the content was filtered.",
        usedAppKey,
      };
    }

    return {
      success: true,
      images,
      usedAppKey,
    };
  } catch (error) {
    console.error("Image generation failed:", error);

    // Extract more detailed error information
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check for common API errors
      if (error.message.includes("API key")) {
        errorMessage = "Invalid or missing Google GenAI API key. Please check your GOOGLE_GENAI_API_KEY environment variable.";
      } else if (error.message.includes("403") || error.message.includes("permission")) {
        errorMessage = "Access denied. The Imagen model may require billing enabled or specific API access. Visit https://aistudio.google.com to verify your API key permissions.";
      } else if (error.message.includes("404") || error.message.includes("not found")) {
        errorMessage = "Model not found. The Imagen model may not be available in your region or require Vertex AI.";
      } else if (error.message.includes("429") || error.message.includes("quota")) {
        errorMessage = "Rate limit or quota exceeded. Please try again later or check your API usage limits.";
      }
    }

    return {
      success: false,
      error: errorMessage,
      usedAppKey: false,
    };
  }
}

/**
 * Refine a generation with additional instructions
 * This creates a new generation based on the previous one with modifications
 */
export async function refineGeneration(
  generationId: string,
  instruction: string,
  imageId?: string,
  options?: {
    userId: string;
    apiKey?: string;
    originalPrompt: string;
    settings: GenerateOptions["settings"];
  }
): Promise<GenerationResult> {
  if (!options) {
    return {
      success: false,
      error: "Options are required for refinement",
      usedAppKey: false,
    };
  }

  // Build refined prompt
  const refinedPrompt = `Original request: ${options.originalPrompt}

Refinement instruction: ${instruction}

Please generate a new image incorporating the refinement while maintaining the original intent.`;

  // Generate with the refined prompt
  return generateWithUserKey({
    prompt: refinedPrompt,
    userId: options.userId,
    apiKey: options.apiKey,
    settings: options.settings,
  });
}

/**
 * Calculate image dimensions based on resolution and aspect ratio
 */
function calculateDimensions(
  resolution: "1K" | "2K" | "4K",
  aspectRatio: string
): { width: number; height: number } {
  const baseSize = RESOLUTION_MAP[resolution] || RESOLUTION_MAP["1K"];

  // Parse aspect ratio
  const [widthRatio, heightRatio] = aspectRatio.split(":").map(Number);

  if (!widthRatio || !heightRatio) {
    return baseSize; // Default to square
  }

  const ratio = widthRatio / heightRatio;

  if (ratio > 1) {
    // Landscape
    return {
      width: baseSize.width,
      height: Math.round(baseSize.width / ratio),
    };
  } else if (ratio < 1) {
    // Portrait
    return {
      height: baseSize.height,
      width: Math.round(baseSize.height * ratio),
    };
  }

  return baseSize; // Square
}
