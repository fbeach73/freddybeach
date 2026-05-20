"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface RevokeButtonProps {
  grantId: string;
  businessName: string;
}

export function RevokeButton({ grantId, businessName }: RevokeButtonProps) {
  const router = useRouter();
  const [working, setWorking] = useState(false);

  async function handleRevoke() {
    if (working) return;
    const ok = window.confirm(
      `Revoke this tool access for ${businessName}? They'll lose access immediately.`
    );
    if (!ok) return;

    setWorking(true);
    try {
      const res = await fetch(`/api/admin/tools/grants?id=${encodeURIComponent(grantId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        window.alert(data?.error ?? "Failed to revoke.");
        setWorking(false);
        return;
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      window.alert("Network error.");
      setWorking(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRevoke}
      disabled={working}
      className="text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
      {working ? "Revoking..." : "Revoke"}
    </Button>
  );
}
