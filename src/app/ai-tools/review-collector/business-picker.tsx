"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BusinessOption {
  id: string;
  name: string;
}

interface BusinessPickerProps {
  businesses: BusinessOption[];
  selectedId: string;
}

export function BusinessPicker({
  businesses,
  selectedId,
}: BusinessPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (businesses.length <= 1) return null;

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("businessId", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Business:</span>
      <Select value={selectedId} onValueChange={handleChange}>
        <SelectTrigger className="w-[240px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {businesses.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
