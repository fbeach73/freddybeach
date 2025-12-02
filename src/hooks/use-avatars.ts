"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  Avatar,
  AvatarType,
  CreateAvatarInput,
  UpdateAvatarInput,
} from "@/lib/types/image-generation";

interface CreateAvatarResult {
  success: boolean;
  avatar?: Avatar;
  error?: string;
}

interface UpdateAvatarResult {
  success: boolean;
  avatar?: Avatar;
  error?: string;
}

export function useAvatars() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all avatars for the current user
   */
  const loadAvatars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/avatars");
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Failed to load avatars";
        setError(errorMsg);
        return;
      }

      const loadedAvatars: Avatar[] = (data.avatars || []).map(
        (a: Avatar & { createdAt: string; updatedAt: string }) => ({
          ...a,
          createdAt: a.createdAt ? new Date(a.createdAt) : undefined,
          updatedAt: a.updatedAt ? new Date(a.updatedAt) : undefined,
        })
      );

      setAvatars(loadedAvatars);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load avatars";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new avatar with a file upload
   */
  const createAvatar = useCallback(
    async (
      data: CreateAvatarInput,
      file: File
    ): Promise<CreateAvatarResult> => {
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", data.name);
        formData.append("type", data.type);
        if (data.description) {
          formData.append("description", data.description);
        }

        const response = await fetch("/api/avatars", {
          method: "POST",
          body: formData,
        });

        const responseData = await response.json();

        if (!response.ok) {
          const errorMsg = responseData.error || "Failed to create avatar";
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }

        const newAvatar: Avatar = {
          ...responseData.avatar,
          createdAt: responseData.avatar.createdAt
            ? new Date(responseData.avatar.createdAt)
            : undefined,
          updatedAt: responseData.avatar.updatedAt
            ? new Date(responseData.avatar.updatedAt)
            : undefined,
        };

        // Add to local state
        setAvatars((prev) => [newAvatar, ...prev]);

        return { success: true, avatar: newAvatar };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to create avatar";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  /**
   * Update an existing avatar's metadata
   */
  const updateAvatar = useCallback(
    async (id: string, data: UpdateAvatarInput): Promise<UpdateAvatarResult> => {
      setError(null);

      try {
        const response = await fetch(`/api/avatars/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
          const errorMsg = responseData.error || "Failed to update avatar";
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }

        const updatedAvatar: Avatar = {
          ...responseData.avatar,
          createdAt: responseData.avatar.createdAt
            ? new Date(responseData.avatar.createdAt)
            : undefined,
          updatedAt: responseData.avatar.updatedAt
            ? new Date(responseData.avatar.updatedAt)
            : undefined,
        };

        // Update in local state
        setAvatars((prev) =>
          prev.map((a) => (a.id === id ? updatedAvatar : a))
        );

        return { success: true, avatar: updatedAvatar };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to update avatar";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  /**
   * Delete an avatar
   */
  const deleteAvatar = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/avatars/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.error || "Failed to delete avatar";
        setError(errorMsg);
        return false;
      }

      // Remove from local state
      setAvatars((prev) => prev.filter((a) => a.id !== id));

      return true;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete avatar";
      setError(errorMsg);
      return false;
    }
  }, []);

  /**
   * Get a single avatar by ID
   */
  const getAvatarById = useCallback(
    (id: string): Avatar | undefined => {
      return avatars.find((a) => a.id === id);
    },
    [avatars]
  );

  /**
   * Filter avatars by type
   */
  const getAvatarsByType = useCallback(
    (type: AvatarType): Avatar[] => {
      return avatars.filter((a) => a.type === type);
    },
    [avatars]
  );

  /**
   * Clear any error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load avatars on mount
  useEffect(() => {
    loadAvatars();
  }, [loadAvatars]);

  return {
    // State
    avatars,
    isLoading,
    error,

    // Actions
    loadAvatars,
    createAvatar,
    updateAvatar,
    deleteAvatar,

    // Helpers
    getAvatarById,
    getAvatarsByType,
    clearError,
  };
}
