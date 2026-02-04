"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, RefreshCw, LogOut, CheckCircle2 } from "lucide-react";
import { authClient, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface VerifyEmailClientProps {
  email: string;
  name: string;
}

export function VerifyEmailClient({ email, name }: VerifyEmailClientProps) {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const firstName = name.split(" ")[0];

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/dashboard",
      });

      if (error) {
        setResendError(error.message || "Failed to send verification email");
      } else {
        setResendSuccess(true);
      }
    } catch (err) {
      console.error("Error resending verification email:", err);
      setResendError("An unexpected error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace("/");
    } catch (err) {
      console.error("Error signing out:", err);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription className="text-base">
            Hi {firstName}, please check your inbox
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              We sent a verification email to:
            </p>
            <p className="mt-1 font-medium">{email}</p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Click the link in the email to verify your account and access your
              dashboard. The link will expire in 24 hours.
            </p>
            <p>
              If you don&apos;t see the email, check your spam folder or request
              a new one below.
            </p>
          </div>

          {resendSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Verification email sent! Check your inbox.</span>
            </div>
          )}

          {resendError && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {resendError}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full"
            >
              {isSigningOut ? (
                <>
                  <LogOut className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Having trouble?{" "}
            <a
              href="mailto:support@freddybeach.com"
              className="text-primary hover:underline"
            >
              Contact support
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
