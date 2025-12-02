"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  Preset,
  PresetSettings,
  CreatePresetInput,
  UpdatePresetInput,
} from "@/lib/types/image-generation";

interface CreatePresetResult {
  success: boolean;
  preset?: Preset;
  error?: string;
}

interface UpdatePresetResult {
  success: boolean;
  preset?: Preset;
  error?: string;
}

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all presets for the current user
   */
  const loadPresets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/presets");
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Failed to load presets";
        setError(errorMsg);
        return;
      }

      const loadedPresets: Preset[] = (data.presets || []).map(
        (p: Preset & { createdAt: string; updatedAt: string }) => ({
          ...p,
          createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
        })
      );

      setPresets(loadedPresets);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load presets";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new preset
   */
  const createPreset = useCallback(
    async (
      name: string,
      settings: PresetSettings
    ): Promise<CreatePresetResult> => {
      setError(null);

      try {
        const body: CreatePresetInput = { name, settings };
        const response = await fetch("/api/presets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error || "Failed to create preset";
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }

        const newPreset: Preset = {
          ...data.preset,
          createdAt: data.preset.createdAt
            ? new Date(data.preset.createdAt)
            : undefined,
          updatedAt: data.preset.updatedAt
            ? new Date(data.preset.updatedAt)
            : undefined,
        };

        // Add to local state
        setPresets((prev) => [newPreset, ...prev]);

        return { success: true, preset: newPreset };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to create preset";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  /**
   * Update an existing preset
   */
  const updatePreset = useCallback(
    async (id: string, data: UpdatePresetInput): Promise<UpdatePresetResult> => {
      setError(null);

      try {
        const response = await fetch(`/api/presets/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
          const errorMsg = responseData.error || "Failed to update preset";
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }

        const updatedPreset: Preset = {
          ...responseData.preset,
          createdAt: responseData.preset.createdAt
            ? new Date(responseData.preset.createdAt)
            : undefined,
          updatedAt: responseData.preset.updatedAt
            ? new Date(responseData.preset.updatedAt)
            : undefined,
        };

        // Update in local state
        setPresets((prev) =>
          prev.map((p) => (p.id === id ? updatedPreset : p))
        );

        return { success: true, preset: updatedPreset };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to update preset";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  /**
   * Delete a preset
   */
  const deletePreset = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/presets/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.error || "Failed to delete preset";
        setError(errorMsg);
        return false;
      }

      // Remove from local state
      setPresets((prev) => prev.filter((p) => p.id !== id));

      return true;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete preset";
      setError(errorMsg);
      return false;
    }
  }, []);

  /**
   * Get a single preset by ID
   */
  const getPresetById = useCallback(
    (id: string): Preset | undefined => {
      return presets.find((p) => p.id === id);
    },
    [presets]
  );

  /**
   * Clear any error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  return {
    // State
    presets,
    isLoading,
    error,

    // Actions
    loadPresets,
    createPreset,
    updatePreset,
    deletePreset,

    // Helpers
    getPresetById,
    clearError,
  };
}
