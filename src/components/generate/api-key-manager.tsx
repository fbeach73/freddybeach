"use client";

import { useState, useCallback } from "react";
import {
  Key,
  Check,
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ApiKeyManagerProps {
  hasApiKey: boolean;
  keyHint?: string | null;
  provider?: string;
  isLoading?: boolean;
  onSaveApiKey: (key: string) => Promise<{ success: boolean; error?: string }>;
  onRemoveApiKey: () => Promise<boolean>;
}

export function ApiKeyManager({
  hasApiKey,
  keyHint,
  provider = "Google",
  isLoading = false,
  onSaveApiKey,
  onRemoveApiKey,
}: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSaveKey = useCallback(async () => {
    if (!apiKey.trim()) {
      setError("API key is required");
      return;
    }

    // Basic validation for Google API key format
    if (!apiKey.startsWith("AIza") || apiKey.length < 30) {
      setError("Invalid API key format. Google API keys start with 'AIza'");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await onSaveApiKey(apiKey.trim());

      if (result.success) {
        setApiKey("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to save API key");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [apiKey, onSaveApiKey]);

  const handleRemoveKey = useCallback(async () => {
    setIsRemoving(true);
    try {
      await onRemoveApiKey();
      setShowRemoveDialog(false);
    } finally {
      setIsRemoving(false);
    }
  }, [onRemoveApiKey]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {provider} API Key
          </CardTitle>
          <CardDescription>
            Use your own API key for unlimited generations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          {hasApiKey ? (
            <div className="flex items-center justify-between rounded-lg border bg-green-50 p-4 dark:bg-green-950/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    API Key Connected
                  </p>
                  {keyHint && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Key ending in ...{keyHint}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRemoveDialog(true)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
              >
                <X className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No API Key</AlertTitle>
              <AlertDescription>
                You&apos;re using the app&apos;s shared API key with limited monthly
                generations. Add your own key for unlimited access.
              </AlertDescription>
            </Alert>
          )}

          {/* Add New Key */}
          {!hasApiKey && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">{provider} API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="api-key"
                      type={showKey ? "text" : "password"}
                      placeholder="AIza..."
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setError(null);
                      }}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={handleSaveKey}
                    disabled={!apiKey.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {/* Success Message */}
              {success && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  API key saved successfully!
                </p>
              )}

              {/* Instructions */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <h4 className="mb-2 font-medium">How to get an API key:</h4>
                <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>
                    Go to{" "}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Google AI Studio
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Sign in with your Google account</li>
                  <li>Click &quot;Create API key&quot;</li>
                  <li>Copy the key and paste it above</li>
                </ol>
              </div>

              {/* Security Note */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Shield className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Your API key is encrypted before storage and never shared.
                  Only you can use it for your generations.
                </p>
              </div>
            </div>
          )}

          {/* Benefits */}
          {!hasApiKey && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <h5 className="font-medium">With Your Own Key</h5>
                <ul className="mt-1 text-sm text-muted-foreground">
                  <li>Unlimited generations</li>
                  <li>No monthly limits</li>
                  <li>Priority processing</li>
                </ul>
              </div>
              <div className="rounded-lg border p-3">
                <h5 className="font-medium">Shared Key (Current)</h5>
                <ul className="mt-1 text-sm text-muted-foreground">
                  <li>Limited monthly quota</li>
                  <li>Shared with other users</li>
                  <li>May have wait times</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your API key? You&apos;ll switch back
              to the shared key with limited monthly generations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveKey}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Key"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
