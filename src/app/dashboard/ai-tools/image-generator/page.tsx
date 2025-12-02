"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  PromptBuilder,
  GenerationOutput,
  RefinementPanel,
  AvatarManager,
  PresetManager,
  ApiKeyManager,
  TokenUsageCard,
  GenerationErrorBoundary,
} from "@/components/generate";
import { toast } from "sonner";
import { useGeneration } from "@/hooks/use-generation";
import { useAvatars } from "@/hooks/use-avatars";
import { usePresets } from "@/hooks/use-presets";
import { useApiKey } from "@/hooks/use-api-key";
import type { GenerationSettings, PresetSettings } from "@/lib/types/image-generation";

export default function ImageGeneratorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("generate");

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

  // TODO: Get actual usage from user's subscription tier
  const userTier = "free";
  const tokenLimit = userTier === "free" ? 10 : userTier === "enhanced" ? 50 : 200;
  const [tokensUsed, setTokensUsed] = useState(0);
  const tokensRemaining = tokenLimit - tokensUsed;

  // Get current month for usage tracking
  const currentMonth = new Date().toISOString().slice(0, 7);

  // History pagination state
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const HISTORY_PAGE_SIZE = 10;

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
    async (prompt: string, settings: GenerationSettings) => {
      const result = await generate(prompt, settings);
      if (result.success) {
        const retryInfo = result.retriesUsed && result.retriesUsed > 0
          ? ` (after ${result.retriesUsed} ${result.retriesUsed === 1 ? "retry" : "retries"})`
          : "";
        toast.success("Images generated successfully!", {
          description: `Created ${settings.imageCount} image${settings.imageCount > 1 ? "s" : ""}${retryInfo}.`,
        });
        if (result.usedAppKey) {
          setTokensUsed((prev) => prev + 1);
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

  // Handle refinement
  const handleRefine = useCallback(
    async (instruction: string, imageId?: string) => {
      if (!currentGeneration) return;
      const result = await refine(currentGeneration.generation.id, instruction, imageId);
      if (result.success) {
        const retryInfo = result.retriesUsed && result.retriesUsed > 0
          ? ` (after ${result.retriesUsed} ${result.retriesUsed === 1 ? "retry" : "retries"})`
          : "";
        toast.success("Refinement complete!", {
          description: `Your images have been updated${retryInfo}.`,
        });
        if (result.usedAppKey) {
          setTokensUsed((prev) => prev + 1);
        }
      } else {
        if (result.isRateLimited) {
          toast.error("Rate limit reached", {
            description: "Too many requests. Please wait a moment and try again.",
          });
        } else {
          toast.error("Refinement failed", {
            description: result.error || "Please try again.",
          });
        }
      }
    },
    [refine, currentGeneration]
  );

  // Handle saving preset from PromptBuilder
  const handleSavePreset = useCallback(
    async (name: string, settings: PresetSettings) => {
      await createPreset(name, settings);
    },
    [createPreset]
  );

  // Handle toggling image public status
  const handleTogglePublic = useCallback(
    async (imageId: string, isPublic: boolean) => {
      // TODO: Implement API call to toggle public status
      console.log("Toggle public:", imageId, isPublic);
    },
    []
  );

  // Navigate to settings tab when clicking "Add API Key"
  const handleAddApiKey = useCallback(() => {
    setActiveTab("settings");
  }, []);

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/dashboard/ai-tools">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to AI Tools
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
                <TierBadge tier="free" size="sm" />
              </div>
              <p className="mt-1 max-w-2xl text-muted-foreground">
                Create stunning AI-generated images with Google&apos;s Gemini. Use
                avatars for consistent characters and refine your creations with
                natural language.
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="flex flex-wrap items-center gap-2">
            {hasApiKey ? (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Unlimited (Own Key)
              </Badge>
            ) : (
              <Badge variant="outline" className="text-sm">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {tokensRemaining} / {tokenLimit} remaining
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none">
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

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          {/* Error Display */}
          {generationError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {generationError}
            </div>
          )}

          {/* Prompt Builder */}
          <GenerationErrorBoundary>
            <PromptBuilder
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              avatars={avatars}
              presets={presets}
              onSavePreset={handleSavePreset}
              tokensRemaining={hasApiKey ? undefined : tokensRemaining}
              tokenLimit={hasApiKey ? undefined : tokenLimit}
              hasApiKey={hasApiKey}
            />
          </GenerationErrorBoundary>

          {/* Generation Output */}
          <GenerationErrorBoundary>
            <GenerationOutput
              images={currentGeneration?.images || []}
              prompt={currentGeneration?.generation.prompt}
              isLoading={isGenerating}
              onTogglePublic={handleTogglePublic}
            />
          </GenerationErrorBoundary>

          {/* Refinement Panel */}
          <GenerationErrorBoundary>
            <RefinementPanel
              history={currentGeneration?.history || []}
              images={currentGeneration?.images || []}
              onRefine={handleRefine}
              isRefining={isRefining}
              disabled={!currentGeneration || isGenerating}
            />
          </GenerationErrorBoundary>
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
                        <img
                          src={gen.thumbnailUrl}
                          alt="Generation thumbnail"
                          className="h-16 w-16 rounded-lg object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
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
            />

            {/* Token Usage Card */}
            <TokenUsageCard
              used={tokensUsed}
              limit={tokenLimit}
              tier={userTier}
              month={currentMonth}
              hasApiKey={hasApiKey}
              onUpgrade={() => router.push("/ai-tools#pricing")}
              onAddApiKey={handleAddApiKey}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
