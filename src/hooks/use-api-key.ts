"use client";

import { useState, useCallback, useEffect } from "react";
import type { ApiKeyStatus } from "@/lib/types/image-generation";

interface SaveKeyResult {
  success: boolean;
  keyHint?: string;
  error?: string;
}

export function useApiKey() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [keyHint, setKeyHint] = useState<string | null>(null);
  const [provider, setProvider] = useState<string>("google");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if user has a stored API key
   */
  const checkApiKey = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/api-key");
      const data: ApiKeyStatus & { updatedAt?: string } = await response.json();

      if (!response.ok) {
        const errorMsg =
          (data as unknown as { error?: string }).error ||
          "Failed to check API key status";
        setError(errorMsg);
        return;
      }

      setHasApiKey(data.hasKey);
      setKeyHint(data.keyHint || null);
      setProvider(data.provider);
      setUpdatedAt(data.updatedAt ? new Date(data.updatedAt) : null);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to check API key status";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save a new API key
   */
  const saveApiKey = useCallback(
    async (apiKey: string): Promise<SaveKeyResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/user/api-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error || "Failed to save API key";
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }

        // Update local state
        setHasApiKey(true);
        setKeyHint(data.keyHint);
        setUpdatedAt(new Date());

        return { success: true, keyHint: data.keyHint };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to save API key";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Remove the stored API key
   */
  const removeApiKey = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/api-key", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.error || "Failed to remove API key";
        setError(errorMsg);
        return false;
      }

      // Update local state
      setHasApiKey(false);
      setKeyHint(null);
      setUpdatedAt(null);

      return true;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to remove API key";
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear any error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check API key status on mount
  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  return {
    // State
    hasApiKey,
    keyHint,
    provider,
    updatedAt,
    isLoading,
    error,

    // Actions
    checkApiKey,
    saveApiKey,
    removeApiKey,
    clearError,
  };
}
