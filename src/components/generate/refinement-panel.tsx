"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Send, Loader2, User, Bot, Image as ImageIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type {
  GenerationHistoryEntry,
  GeneratedImage,
} from "@/lib/types/image-generation";

interface RefinementPanelProps {
  history: GenerationHistoryEntry[];
  images: GeneratedImage[];
  onRefine: (instruction: string, imageId?: string) => Promise<void>;
  isRefining?: boolean;
  disabled?: boolean;
}

export function RefinementPanel({
  history,
  images,
  onRefine,
  isRefining = false,
  disabled = false,
}: RefinementPanelProps) {
  const [instruction, setInstruction] = useState("");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when history updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = useCallback(async () => {
    if (!instruction.trim() || isRefining || disabled) return;

    const imageId = selectedImageId || undefined;
    setInstruction("");
    setSelectedImageId(null);
    await onRefine(instruction, imageId);
  }, [instruction, selectedImageId, isRefining, disabled, onRefine]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  if (history.length === 0 && images.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Refine Your Generation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Conversation History */}
        {history.length > 0 && (
          <ScrollArea
            className="h-[200px] rounded-lg border bg-muted/30 p-4"
            ref={scrollRef}
          >
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "flex gap-3",
                    entry.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      entry.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {entry.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={cn(
                      "flex max-w-[80%] flex-col gap-2",
                      entry.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        entry.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border"
                      )}
                    >
                      {entry.content}
                    </div>

                    {/* Associated Images */}
                    {entry.imageUrls && entry.imageUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.imageUrls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Generated image ${idx + 1}`}
                            className="h-16 w-16 rounded object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isRefining && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="flex items-center rounded-lg border bg-background px-3 py-2">
                    <span className="text-sm text-muted-foreground">
                      Generating...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Image Selection for Targeted Refinement */}
        {images.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Select an image to refine (optional):
            </p>
            <div className="flex flex-wrap gap-2">
              {images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() =>
                    setSelectedImageId(
                      selectedImageId === image.id ? null : image.id
                    )
                  }
                  className={cn(
                    "relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-all",
                    selectedImageId === image.id
                      ? "border-primary ring-2 ring-primary/50"
                      : "border-transparent hover:border-muted-foreground/50"
                  )}
                  disabled={isRefining || disabled}
                >
                  <img
                    src={image.imageUrl}
                    alt="Select for refinement"
                    className="h-full w-full object-cover"
                  />
                  {selectedImageId === image.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedImageId && (
              <p className="text-xs text-muted-foreground">
                <ImageIcon className="mr-1 inline h-3 w-3" />
                Refinement will focus on the selected image
              </p>
            )}
          </div>
        )}

        {/* Refinement Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Describe how you'd like to refine the image..."
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRefining || disabled}
            className="min-h-[80px] flex-1 resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={!instruction.trim() || isRefining || disabled}
            className="self-end"
          >
            {isRefining ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Tips */}
        <p className="text-xs text-muted-foreground">
          Tip: Be specific about what you want to change. For example: &quot;Make the
          sky more vibrant&quot; or &quot;Add a sunset glow to the mountains&quot;.
        </p>
      </CardContent>
    </Card>
  );
}
