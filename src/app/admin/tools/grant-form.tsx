"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface BusinessOption {
  id: string;
  name: string;
  slug: string;
}

interface ToolOption {
  slug: string;
  name: string;
}

interface GrantFormProps {
  businesses: BusinessOption[];
  tools: ToolOption[];
}

export function GrantForm({ businesses, tools }: GrantFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [businessId, setBusinessId] = useState<string>("");
  const [toolSlug, setToolSlug] = useState(tools[0]?.slug ?? "review-collector");
  const [accessType, setAccessType] = useState<"gifted" | "trial" | "paid" | "free">("gifted");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = businesses.find((b) => b.id === businessId) ?? null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!businessId) {
      setError("Pick a business first.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/tools/grants", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessId,
          toolSlug,
          accessType,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to grant access.");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
      setExpiresAt("");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Network error.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="business">Business</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="business"
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal"
            >
              {selected ? (
                <span className="truncate">
                  {selected.name}{" "}
                  <span className="text-xs text-muted-foreground">({selected.slug})</span>
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Search by name or slug...
                </span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command
              filter={(value, search) => {
                // value comes from <CommandItem value="..."> below — we pack
                // "name|slug|id" into it so search matches any of them.
                if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                return 0;
              }}
            >
              <CommandInput placeholder="Type to search businesses..." />
              <CommandList>
                <CommandEmpty>No businesses found.</CommandEmpty>
                <CommandGroup>
                  {businesses.map((b) => (
                    <CommandItem
                      key={b.id}
                      value={`${b.name}|${b.slug}|${b.id}`}
                      onSelect={() => {
                        setBusinessId(b.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          businessId === b.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{b.name}</span>
                        <span className="text-xs text-muted-foreground">{b.slug}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tool">Tool</Label>
          <Select value={toolSlug} onValueChange={setToolSlug}>
            <SelectTrigger id="tool">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tools.map((t) => (
                <SelectItem key={t.slug} value={t.slug}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accessType">Access type</Label>
          <Select
            value={accessType}
            onValueChange={(v) =>
              setAccessType(v as "gifted" | "trial" | "paid" | "free")
            }
          >
            <SelectTrigger id="accessType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gifted">Gifted (pilot)</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="free">Free</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Expires at (optional)</Label>
        <Input
          id="expiresAt"
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank for permanent access. Used mainly for trials.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting || !businessId}>
        {submitting ? "Granting..." : "Grant access"}
      </Button>
    </form>
  );
}
