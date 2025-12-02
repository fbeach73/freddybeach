"use client";

import { useState, useCallback, useRef } from "react";
import type {
  Generation,
  GeneratedImage,
  GenerationHistoryEntry,
  GenerationSettings,
  GenerateRequestBody,
  RefineRequestBody,
} from "@/lib/types/image-generation";

// Constants for retry logic
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const RATE_LIMIT_STATUS = 429;

// Helper to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to check if error is retryable
const isRetryableError = (status: number, error?: string): boolean => {
  // Retry on rate limits, server errors, or network issues
  if (status === RATE_LIMIT_STATUS) return true;
  if (status >= 500 && status < 600) return true;
  if (error?.toLowerCase().includes("network")) return true;
  if (error?.toLowerCase().includes("timeout")) return true;
  return false;
};

// Get retry delay with exponential backoff
const getRetryDelay = (attempt: number, isRateLimit: boolean): number => {
  if (isRateLimit) {
    // Longer delay for rate limits
    return INITIAL_RETRY_DELAY * Math.pow(2, attempt) * 2;
  }
  return INITIAL_RETRY_DELAY * Math.pow(2, attempt);
};

interface GenerationWithDetails {
  generation: Generation;
  images: GeneratedImage[];
  history: GenerationHistoryEntry[];
}

interface GenerationsListItem {
  id: string;
  prompt: string;
  status: string;
  createdAt: Date;
  imageCount: number;
  thumbnailUrl?: string;
}

interface GenerateResult {
  success: boolean;
  generationId?: string;
  images?: Array<{
    id: string;
    imageUrl: string;
    width: number;
    height: number;
  }>;
  usedAppKey?: boolean;
  error?: string;
  retriesUsed?: number;
  isRateLimited?: boolean;
}

interface RefineResult {
  success: boolean;
  images?: Array<{
    id: string;
    imageUrl: string;
    width: number;
    height: number;
  }>;
  usedAppKey?: boolean;
  error?: string;
  retriesUsed?: number;
  isRateLimited?: boolean;
}

export function useGeneration() {
  const [currentGeneration, setCurrentGeneration] =
    useState<GenerationWithDetails | null>(null);
  const [generations, setGenerations] = useState<GenerationsListItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use a ref for loadGeneration to avoid circular dependencies
  const loadGenerationRef = useRef<(id: string) => Promise<GenerationWithDetails | null>>(null);

  /**
   * Load a single generation with its images and history
   */
  const loadGeneration = useCallback(
    async (id: string): Promise<GenerationWithDetails | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/generate/${id}`);
        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error || "Failed to load generation";
          setError(errorMsg);
          return null;
        }

        const generationDetails: GenerationWithDetails = {
          generation: {
            ...data.generation,
            createdAt: new Date(data.generation.createdAt),
            updatedAt: new Date(data.generation.updatedAt),
          },
          images: data.images.map(
            (img: GeneratedImage & { createdAt: string }) => ({
              ...img,
              createdAt: new Date(img.createdAt),
            })
          ),
          history: data.history.map(
            (h: GenerationHistoryEntry & { createdAt: string }) => ({
              ...h,
              createdAt: new Date(h.createdAt),
            })
          ),
        };

        setCurrentGeneration(generationDetails);
        return generationDetails;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load generation";
        setError(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Keep ref updated with latest loadGeneration function
  loadGenerationRef.current = loadGeneration;

  /**
   * Generate new images with the given prompt and settings
   * Includes automatic retry with exponential backoff for transient errors
   */
  const generate = useCallback(
    async (
      prompt: string,
      settings: GenerationSettings
    ): Promise<GenerateResult> => {
      setIsGenerating(true);
      setError(null);

      const body: GenerateRequestBody = { prompt, settings };
      let lastError: string | undefined = undefined;
      let lastStatus = 0;
      let retriesUsed = 0;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          lastStatus = response.status;
          const data = await response.json();

          if (!response.ok) {
            lastError = data.error || "Generation failed";

            // Check if we should retry
            if (attempt < MAX_RETRIES && isRetryableError(response.status, lastError)) {
              const isRateLimit = response.status === RATE_LIMIT_STATUS;
              const retryDelay = getRetryDelay(attempt, isRateLimit);
              retriesUsed = attempt + 1;
              await delay(retryDelay);
              continue; // Retry
            }

            // Don't retry - return error
            setIsGenerating(false);
            setError(lastError || null);
            return {
              success: false,
              error: lastError,
              retriesUsed,
              isRateLimited: response.status === RATE_LIMIT_STATUS,
            };
          }

          // Success - load the full generation details
          if (data.generationId && loadGenerationRef.current) {
            await loadGenerationRef.current(data.generationId);
          }

          setIsGenerating(false);
          return {
            success: true,
            generationId: data.generationId,
            images: data.images,
            usedAppKey: data.usedAppKey,
            retriesUsed,
          };
        } catch (err) {
          lastError = err instanceof Error ? err.message : "Failed to generate images";

          // Check if we should retry network errors
          if (attempt < MAX_RETRIES && isRetryableError(0, lastError)) {
            const retryDelay = getRetryDelay(attempt, false);
            retriesUsed = attempt + 1;
            await delay(retryDelay);
            continue; // Retry
          }

          setIsGenerating(false);
          setError(lastError || null);
          return { success: false, error: lastError, retriesUsed };
        }
      }

      // All retries exhausted
      setIsGenerating(false);
      const finalError = lastError || "Generation failed after multiple attempts";
      setError(finalError || null);
      return {
        success: false,
        error: finalError,
        retriesUsed,
        isRateLimited: lastStatus === RATE_LIMIT_STATUS,
      };
    },
    []
  );

  // Keep ref updated with latest generate function for retry context
  const generateRef = useRef(generate);
  generateRef.current = generate;

  // Helper to manually trigger a retry (exposed for UI)
  const retryLastGeneration = useCallback(
    async (prompt: string, settings: GenerationSettings): Promise<GenerateResult> => {
      return generateRef.current(prompt, settings);
    },
    []
  );

  /**
   * Refine an existing generation with additional instructions
   * Includes automatic retry with exponential backoff for transient errors
   */
  const refine = useCallback(
    async (
      generationId: string,
      instruction: string,
      imageId?: string
    ): Promise<RefineResult> => {
      setIsRefining(true);
      setError(null);

      const body: RefineRequestBody = { instruction, imageId };
      let lastError: string | undefined = undefined;
      let lastStatus = 0;
      let retriesUsed = 0;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const response = await fetch(`/api/generate/${generationId}/refine`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          lastStatus = response.status;
          const data = await response.json();

          if (!response.ok) {
            lastError = data.error || "Refinement failed";

            // Check if we should retry
            if (attempt < MAX_RETRIES && isRetryableError(response.status, lastError)) {
              const isRateLimit = response.status === RATE_LIMIT_STATUS;
              const retryDelay = getRetryDelay(attempt, isRateLimit);
              retriesUsed = attempt + 1;
              await delay(retryDelay);
              continue; // Retry
            }

            // Don't retry - return error
            setIsRefining(false);
            setError(lastError || null);
            return {
              success: false,
              error: lastError,
              retriesUsed,
              isRateLimited: response.status === RATE_LIMIT_STATUS,
            };
          }

          // Success - reload the generation to get updated images and history
          if (loadGenerationRef.current) {
            await loadGenerationRef.current(generationId);
          }

          setIsRefining(false);
          return {
            success: true,
            images: data.images,
            usedAppKey: data.usedAppKey,
            retriesUsed,
          };
        } catch (err) {
          lastError = err instanceof Error ? err.message : "Failed to refine generation";

          // Check if we should retry network errors
          if (attempt < MAX_RETRIES && isRetryableError(0, lastError)) {
            const retryDelay = getRetryDelay(attempt, false);
            retriesUsed = attempt + 1;
            await delay(retryDelay);
            continue; // Retry
          }

          setIsRefining(false);
          setError(lastError || null);
          return { success: false, error: lastError, retriesUsed };
        }
      }

      // All retries exhausted
      setIsRefining(false);
      const finalError = lastError || "Refinement failed after multiple attempts";
      setError(finalError || null);
      return {
        success: false,
        error: finalError,
        retriesUsed,
        isRateLimited: lastStatus === RATE_LIMIT_STATUS,
      };
    },
    []
  );

  /**
   * Load a paginated list of user's generations
   */
  const loadGenerations = useCallback(
    async (page: number = 1, pageSize: number = 20) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/generate?page=${page}&pageSize=${pageSize}`
        );
        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error || "Failed to load generations";
          setError(errorMsg);
          return { generations: [], total: 0, hasMore: false };
        }

        const items: GenerationsListItem[] = (data.generations || []).map(
          (gen: GenerationsListItem & { createdAt: string }) => ({
            ...gen,
            createdAt: new Date(gen.createdAt),
          })
        );

        setGenerations(items);

        return {
          generations: items,
          total: data.total || 0,
          hasMore: data.hasMore || false,
        };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load generations";
        setError(errorMsg);
        return { generations: [], total: 0, hasMore: false };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Delete a generation and all associated images
   */
  const deleteGeneration = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/generate/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.error || "Failed to delete generation";
        setError(errorMsg);
        return false;
      }

      // Remove from local state if it was in the list
      setGenerations((prev) => prev.filter((g) => g.id !== id));

      // Clear current generation if it was the deleted one
      setCurrentGeneration((prev) =>
        prev?.generation.id === id ? null : prev
      );

      return true;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete generation";
      setError(errorMsg);
      return false;
    }
  }, []);

  /**
   * Clear the current generation (for starting fresh)
   */
  const clearCurrentGeneration = useCallback(() => {
    setCurrentGeneration(null);
    setError(null);
  }, []);

  /**
   * Clear any error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    currentGeneration,
    generations,
    isGenerating,
    isRefining,
    isLoading,
    error,

    // Actions
    generate,
    refine,
    retryLastGeneration,
    loadGeneration,
    loadGenerations,
    deleteGeneration,
    clearCurrentGeneration,
    clearError,
  };
}
