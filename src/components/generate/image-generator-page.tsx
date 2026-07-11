"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Sparkles,
  Image as ImageIcon,
  Users,
  Settings2,
  History,
  Settings,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TierBadge } from "@/components/shared/tier-badge";
import {
  AvatarManager,
  PresetManager,
  ApiKeyManager,
  TokenUsageCard,
  GenerationErrorBoundary,
  SceneSettings,
  SubjectsPanel,
  PreviewGenerate,
  ResultsPanel,
} from "@/components/generate";
import { toast } from "sonner";
import { useGeneration } from "@/hooks/use-generation";
import { useAvatars } from "@/hooks/use-avatars";
import { usePresets } from "@/hooks/use-presets";
import { useApiKey } from "@/hooks/use-api-key";
import type {
  GenerationSettings,
  PresetSettings,
  SceneSettings as SceneSettingsType,
  ScenePreset,
  Avatar,
  GeneratedImage,
} from "@/lib/types/image-generation";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export type EffectiveTier = "free" | "credits" | "subscription" | "byok";

export interface UserTierData {
  /** The user's effective tier based on priority: byok > subscription > credits > free */
  effectiveTier: EffectiveTier;
  /** Whether user has their own API key (unlimited usage) */
  hasByok: boolean;
  /** Whether user has an active subscription */
  hasSubscription: boolean;
  /** Subscription tier if active: starter, pro, or byok (BYOK Pro subscription) */
  subscriptionTier: "starter" | "pro" | "byok" | null;
  /** Days remaining in subscription */
  subscriptionDaysRemaining: number | null;
  /** Available credits balance */
  creditsRemaining: number;
  /** Monthly usage count (for subscription users) */
  monthlyUsage: number;
  /** Soft cap limit for subscribers */
  softCapLimit: number;
  /** Whether approaching soft cap (80%+) */
  softCapWarning: boolean;
}

// ============================================================================
// Props Interface
// ============================================================================

export interface ImageGeneratorPageProps {
  /** URL for the back navigation link */
  backLink: string;
  /** Text displayed for the back navigation link */
  backLinkText: string;
  /** Optional className for the container div */
  containerClassName?: string;
  /** Optional className for the TabsList */
  tabsListClassName?: string;
  /** Optional URL for the upgrade button */
  upgradeLink?: string;
  /** User tier information fetched from server. If not provided, defaults to unauthenticated free tier */
  userTierData?: UserTierData;
}

// ============================================================================
// Prompt Assembly Utility
// ============================================================================

function getPromptText(value: ScenePreset | string | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.promptText;
}

function assemblePrompt(
  sceneSettings: SceneSettingsType,
  selectedAvatars: Avatar[]
): string {
  const parts: string[] = [];

  // Style
  const style = getPromptText(sceneSettings.style);
  if (style) parts.push(style);

  // Subjects (avatars)
  if (selectedAvatars.length > 0) {
    const subjectDescriptions = selectedAvatars
      .map((a) => {
        const typeLabel = a.type === "human" ? "person" : "object";
        return a.description
          ? `${a.name} (${a.description})`
          : `${a.name} (${typeLabel})`;
      })
      .join(", ");
    parts.push(subjectDescriptions);
  }

  // Location
  const location = getPromptText(sceneSettings.location);
  if (location) parts.push(`in ${location}`);

  // Lighting
  const lighting = getPromptText(sceneSettings.lighting);
  if (lighting) parts.push(lighting);

  // Camera
  const camera = getPromptText(sceneSettings.camera);
  if (camera) parts.push(camera);

  return parts.join(". ") + (parts.length > 0 ? "." : "");
}

// ============================================================================
// Component
// ============================================================================

// Default tier data for unauthenticated users
const DEFAULT_TIER_DATA: UserTierData = {
  effectiveTier: "free",
  hasByok: false,
  hasSubscription: false,
  subscriptionTier: null,
  subscriptionDaysRemaining: null,
  creditsRemaining: 0,
  monthlyUsage: 0,
  softCapLimit: 500,
  softCapWarning: false,
};

export function ImageGeneratorPage({
  backLink,
  backLinkText,
  containerClassName = "space-y-6",
  tabsListClassName = "inline-flex h-auto w-auto flex-wrap gap-1",
  upgradeLink = "/ai-tools#pricing",
  userTierData = DEFAULT_TIER_DATA,
}: ImageGeneratorPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("generate");

  // Scene settings state
  const [sceneSettings, setSceneSettings] = useState<SceneSettingsType>({});
  const [selectedAvatarIds, setSelectedAvatarIds] = useState<string[]>([]);

  // Prompt state
  const [prompt, setPrompt] = useState("");
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Generation settings state
  const [generationSettings, setGenerationSettings] = useState<{
    resolution: "1K" | "2K" | "4K";
    aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9";
    imageCount: number;
  }>({
    resolution: "1K",
    aspectRatio: "1:1",
    imageCount: 4,
  });

  // Hooks
  const {
    currentGeneration,
    generations,
    isGenerating,
    isRefining,
    isLoading: isLoadingGeneration,
    error: generationError,
    generate,
    refine,
    loadGenerations,
    deleteGeneration,
  } = useGeneration();

  const {
    avatars,
    isLoading: isLoadingAvatars,
    createAvatar,
    updateAvatar,
    deleteAvatar,
  } = useAvatars();

  const {
    presets,
    isLoading: isLoadingPresets,
    createPreset,
    updatePreset,
    deletePreset,
  } = usePresets();

  const {
    hasApiKey,
    keyHint,
    provider,
    isLoading: isLoadingApiKey,
    saveApiKey,
    removeApiKey,
  } = useApiKey();

  // Use tier data from server-side props
  const {
    effectiveTier,
    hasByok,
    hasSubscription,
    subscriptionTier,
    subscriptionDaysRemaining,
    creditsRemaining,
    monthlyUsage,
    softCapLimit,
    softCapWarning,
  } = userTierData;

  // Track local token usage for the session (UI feedback only)
  const [sessionTokensUsed, setSessionTokensUsed] = useState(0);

  // Calculate display values based on tier
  const isUnlimited = hasByok || hasApiKey; // Either server-side BYOK or client-side key
  const displayCredits = creditsRemaining - sessionTokensUsed;
  const displayUsage = monthlyUsage + sessionTokensUsed;

  // Get current month for usage tracking
  const currentMonth = new Date().toISOString().slice(0, 7);

  // History pagination state
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const HISTORY_PAGE_SIZE = 10;

  // Get selected avatars
  const selectedAvatars = avatars.filter((a) => selectedAvatarIds.includes(a.id));

  // Auto-assemble prompt when scene settings or selected avatars change
  useEffect(() => {
    if (!hasUserEdited) {
      const assembled = assemblePrompt(sceneSettings, selectedAvatars);
      setPrompt(assembled);
    }
  }, [sceneSettings, selectedAvatars, hasUserEdited]);

  // Handle prompt change (from user editing)
  const handlePromptChange = useCallback((newPrompt: string) => {
    setPrompt(newPrompt);
    setHasUserEdited(true);
  }, []);

  // Reset user edited flag when scene settings change
  const handleSceneSettingsChange = useCallback((newSettings: SceneSettingsType) => {
    setSceneSettings(newSettings);
    setHasUserEdited(false);
  }, []);

  // Load generations when switching to history tab
  useEffect(() => {
    if (activeTab === "history") {
      loadGenerations(historyPage, HISTORY_PAGE_SIZE).then((result) => {
        setHistoryTotal(result.total);
        setHistoryHasMore(result.hasMore);
      });
    }
  }, [activeTab, historyPage, loadGenerations]);

  // Handle generation
  const handleGenerate = useCallback(
    async (promptText: string, settings: GenerationSettings) => {
      const result = await generate(promptText, settings);
      if (result.success) {
        const retryInfo = result.retriesUsed && result.retriesUsed > 0
          ? ` (after ${result.retriesUsed} ${result.retriesUsed === 1 ? "retry" : "retries"})`
          : "";
        toast.success("Images generated successfully!", {
          description: `Created ${settings.imageCount} image${settings.imageCount > 1 ? "s" : ""}${retryInfo}.`,
        });
        if (result.usedAppKey) {
          setSessionTokensUsed((prev) => prev + 1);
        }
      } else {
        if (result.isRateLimited) {
          toast.error("Rate limit reached", {
            description: "Too many requests. Please wait a moment and try again.",
          });
        } else {
          toast.error("Generation failed", {
            description: result.error || "Please try again.",
          });
        }
      }
    },
    [generate]
  );

  // Handle refinement (for when clicking refine on an image)
  const handleRefineImage = useCallback(
    (image: GeneratedImage) => {
      // TODO: Open refinement modal or panel with this image
      toast.info("Refinement coming soon!", {
        description: `Selected image: ${image.id}`,
      });
    },
    []
  );

  // Handle saving preset from PreviewGenerate
  const handleSavePreset = useCallback(
    async (name: string, settings: PresetSettings) => {
      await createPreset(name, settings);
    },
    [createPreset]
  );

  // Handle toggling image public status
  const handleTogglePublic = useCallback(
    async (imageId: string, isPublic: boolean) => {
      try {
        const response = await fetch(`/api/generate/${imageId}/public`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublic }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update image");
        }

        toast.success(isPublic ? "Image shared to gallery" : "Image removed from gallery");
      } catch (error) {
        toast.error("Failed to update image visibility");
        throw error;
      }
    },
    []
  );

  // Subject (avatar) selection handlers
  const handleSelectAvatar = useCallback((avatarId: string) => {
    setSelectedAvatarIds((prev) => [...prev, avatarId]);
  }, []);

  const handleDeselectAvatar = useCallback((avatarId: string) => {
    setSelectedAvatarIds((prev) => prev.filter((id) => id !== avatarId));
  }, []);

  // Navigate to settings tab when clicking "Add API Key"
  const handleAddApiKey = useCallback(() => {
    setActiveTab("settings");
  }, []);

  return (
    <div className={cn(containerClassName)}>
      {/* Back Navigation */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={backLink}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          {backLinkText}
        </Link>
      </Button>

      {/* Page Header */}
      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ImageIcon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">AI Image Generator</h1>
                <TierBadge tier={effectiveTier === "byok" || effectiveTier === "subscription" ? "featured" : effectiveTier === "credits" ? "enhanced" : "free"} size="sm" />
              </div>
              <p className="mt-1 max-w-2xl text-muted-foreground">
                Create stunning AI-generated images with Google&apos;s Gemini. Use
                subjects for consistent characters and refine your creations with
                natural language.
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="flex flex-wrap items-center gap-2">
            {isUnlimited ? (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Unlimited {hasByok ? "(BYOK)" : "(Own Key)"}
              </Badge>
            ) : hasSubscription ? (
              <>
                <Badge
                  variant="secondary"
                  className={cn(
                    softCapWarning
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  )}
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  {subscriptionTier === "byok" ? "BYOK Pro" : subscriptionTier === "starter" ? "Starter" : "Pro"} Subscriber
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {displayUsage} / {softCapLimit} used
                </Badge>
              </>
            ) : displayCredits > 0 ? (
              <Badge variant="outline" className="text-sm">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {displayCredits} credits remaining
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-sm">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                No credits
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={cn(tabsListClassName)}>
          <TabsTrigger value="generate" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Generate</span>
          </TabsTrigger>
          <TabsTrigger value="avatars" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Avatars</span>
          </TabsTrigger>
          <TabsTrigger value="presets" className="gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Presets</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab - 3 Column Layout */}
        <TabsContent value="generate" className="space-y-6">
          {/* Error Display */}
          {generationError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {generationError}
            </div>
          )}

          {/* 3-Column Grid */}
          <div className="grid gap-6 lg:grid-cols-[320px_1fr_320px]">
            {/* Left Column - Prompt Builder */}
            <div className="order-2 lg:order-1">
              <Card className="lg:sticky lg:top-4">
                <CardContent className="space-y-6 p-4 sm:p-5">
                  <GenerationErrorBoundary>
                    <SceneSettings
                      value={sceneSettings}
                      onChange={handleSceneSettingsChange}
                    />
                  </GenerationErrorBoundary>

                  <div className="border-t pt-4">
                    <GenerationErrorBoundary>
                      <SubjectsPanel
                        avatars={avatars}
                        selectedAvatarIds={selectedAvatarIds}
                        isLoading={isLoadingAvatars}
                        onSelectAvatar={handleSelectAvatar}
                        onDeselectAvatar={handleDeselectAvatar}
                        onCreateAvatar={createAvatar}
                        onDeleteAvatar={deleteAvatar}
                      />
                    </GenerationErrorBoundary>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center Column - Preview & Generate */}
            <div className="order-1 lg:order-2">
              <Card>
                <CardContent className="p-4 sm:p-5">
                  <GenerationErrorBoundary>
                    <PreviewGenerate
                      prompt={prompt}
                      onPromptChange={handlePromptChange}
                      settings={generationSettings}
                      onSettingsChange={setGenerationSettings}
                      onGenerate={handleGenerate}
                      isGenerating={isGenerating}
                      presets={presets}
                      onSavePreset={handleSavePreset}
                      hasApiKey={isUnlimited}
                      hasSubscription={hasSubscription}
                      creditsRemaining={displayCredits}
                      tokensRemaining={isUnlimited ? undefined : hasSubscription ? softCapLimit - displayUsage : displayCredits}
                      tokenLimit={isUnlimited ? undefined : hasSubscription ? softCapLimit : undefined}
                      selectedAvatarIds={selectedAvatarIds}
                    />
                  </GenerationErrorBoundary>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Results */}
            <div className="order-3">
              <Card className="lg:sticky lg:top-4">
                <CardContent className="p-4 sm:p-5">
                  <GenerationErrorBoundary>
                    <ResultsPanel
                      images={currentGeneration?.images || []}
                      isLoading={isGenerating}
                      prompt={currentGeneration?.generation.prompt}
                      onTogglePublic={handleTogglePublic}
                      onRefine={handleRefineImage}
                    />
                  </GenerationErrorBoundary>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Avatars Tab */}
        <TabsContent value="avatars">
          <GenerationErrorBoundary>
            <AvatarManager
              avatars={avatars}
              isLoading={isLoadingAvatars}
              onCreateAvatar={createAvatar}
              onUpdateAvatar={updateAvatar}
              onDeleteAvatar={deleteAvatar}
            />
          </GenerationErrorBoundary>
        </TabsContent>

        {/* Presets Tab */}
        <TabsContent value="presets">
          <GenerationErrorBoundary>
            <PresetManager
              presets={presets}
              isLoading={isLoadingPresets}
              onCreatePreset={createPreset}
              onUpdatePreset={updatePreset}
              onDeletePreset={deletePreset}
            />
          </GenerationErrorBoundary>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Generation History</CardTitle>
              <CardDescription>
                View and manage your past generations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingGeneration ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : generations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium">No generations yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your generation history will appear here
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab("generate")}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Generating
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {generations.map((gen) => (
                    <div
                      key={gen.id}
                      className="group flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      {/* Thumbnail */}
                      {gen.thumbnailUrl ? (
                        <div className="relative h-16 w-16 flex-shrink-0">
                          <Image
                            src={gen.thumbnailUrl}
                            alt="Generation thumbnail"
                            fill
                            className="rounded-lg object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{gen.prompt}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>{gen.imageCount} images</span>
                          <span>•</span>
                          <span>
                            {new Date(gen.createdAt).toLocaleDateString()}
                          </span>
                          <Badge variant="secondary" className="capitalize">
                            {gen.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Load this generation and switch to generate tab
                            console.log("Load generation:", gen.id);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteGeneration(gen.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {historyTotal > HISTORY_PAGE_SIZE && (
                    <div className="flex items-center justify-between border-t pt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {(historyPage - 1) * HISTORY_PAGE_SIZE + 1} -{" "}
                        {Math.min(historyPage * HISTORY_PAGE_SIZE, historyTotal)} of{" "}
                        {historyTotal}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                          disabled={historyPage === 1 || isLoadingGeneration}
                        >
                          <ChevronLeft className="mr-1 h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryPage((p) => p + 1)}
                          disabled={!historyHasMore || isLoadingGeneration}
                        >
                          Next
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* API Key Manager */}
            <ApiKeyManager
              hasApiKey={hasApiKey}
              keyHint={keyHint}
              provider="Google"
              isLoading={isLoadingApiKey}
              onSaveApiKey={saveApiKey}
              onRemoveApiKey={removeApiKey}
              hasByokPro={subscriptionTier === "byok"}
            />

            {/* Token Usage Card */}
            <TokenUsageCard
              used={hasSubscription ? displayUsage : sessionTokensUsed}
              limit={hasSubscription ? softCapLimit : creditsRemaining + sessionTokensUsed}
              tier={effectiveTier}
              month={currentMonth}
              hasApiKey={isUnlimited}
              onUpgrade={() => router.push(upgradeLink)}
              onAddApiKey={handleAddApiKey}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
