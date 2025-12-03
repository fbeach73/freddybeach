"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiKeyManager } from "@/components/generate";
import { useRouter } from "next/navigation";

interface ApiKeyStatus {
  hasKey: boolean;
  keyHint?: string;
  provider: string;
}

interface ApiKeySectionProps {
  /** Whether user has BYOK Pro subscription */
  hasByokPro?: boolean;
}

export function ApiKeySection({ hasByokPro = false }: ApiKeySectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [keyStatus, setKeyStatus] = useState<ApiKeyStatus>({
    hasKey: false,
    provider: "google",
  });

  // Fetch initial key status
  useEffect(() => {
    async function fetchKeyStatus() {
      try {
        const response = await fetch("/api/user/api-key");
        if (response.ok) {
          const data = await response.json();
          setKeyStatus({
            hasKey: data.hasKey,
            keyHint: data.keyHint,
            provider: data.provider || "google",
          });
        }
      } catch (error) {
        console.error("Failed to fetch API key status:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchKeyStatus();
  }, []);

  const handleSaveApiKey = useCallback(
    async (key: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch("/api/user/api-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: key }),
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: data.error || "Failed to save API key" };
        }

        // Update local state
        setKeyStatus({
          hasKey: true,
          keyHint: data.keyHint,
          provider: "google",
        });

        // Refresh to update server-side state
        router.refresh();

        return { success: true };
      } catch {
        return { success: false, error: "Network error. Please try again." };
      }
    },
    [router]
  );

  const handleRemoveApiKey = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/user/api-key", {
        method: "DELETE",
      });

      if (response.ok) {
        setKeyStatus({
          hasKey: false,
          provider: "google",
        });
        // Refresh to update server-side state
        router.refresh();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [router]);

  return (
    <ApiKeyManager
      hasApiKey={keyStatus.hasKey}
      keyHint={keyStatus.keyHint}
      provider="Google"
      isLoading={isLoading}
      onSaveApiKey={handleSaveApiKey}
      onRemoveApiKey={handleRemoveApiKey}
      hasByokPro={hasByokPro}
    />
  );
}
