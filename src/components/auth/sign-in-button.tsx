"use client";

import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "./auth-dialog";

export function SignInButton() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <Button disabled>Loading...</Button>;
  }

  if (session) {
    return null;
  }

  return (
    <AuthDialog>
      <Button>Sign In</Button>
    </AuthDialog>
  );
}
