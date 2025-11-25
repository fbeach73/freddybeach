"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : "";
    router.push(`/search${params}`);
  };

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="secondary" className="mb-4">
          Fredericton&apos;s Local Business Directory
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          Discover Local Businesses in Freddy Beach
        </h1>
        <p className="mt-4 text-lg text-muted-foreground md:text-xl">
          Find restaurants, shops, services, and more in Fredericton, New Brunswick.
          Support local businesses and discover what makes our community special.
        </p>
        <form
          onSubmit={handleSearch}
          className="mt-8 flex flex-col gap-2 sm:flex-row sm:gap-0"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search businesses, categories, or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:rounded-r-none"
            />
          </div>
          <Button type="submit" className="sm:rounded-l-none">
            Search
          </Button>
        </form>
      </div>
    </section>
  );
}
