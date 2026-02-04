"use client";

import { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  size?: "default" | "lg";
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search businesses...",
  autoFocus = false,
  size = "default",
  className,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit();
    }
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
          size === "lg" ? "h-5 w-5" : "h-4 w-4"
        )}
      />
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "pr-10 border-2 border-nb-border rounded-none font-bold shadow-nb-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all duration-150",
          size === "lg"
            ? "h-12 pl-11 text-lg md:h-14 md:text-xl"
            : "h-10 pl-10"
        )}
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleClear}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            size === "lg" ? "h-8 w-8" : "h-6 w-6"
          )}
        >
          <X className={size === "lg" ? "h-4 w-4" : "h-3 w-3"} />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
