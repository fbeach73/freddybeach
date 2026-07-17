"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MapPin, Sparkles, Search, ChevronDown, Tag, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/data";

// Top 6 categories by popularity (can be adjusted based on analytics)
const TOP_CATEGORIES_COUNT = 6;

const mainNavItems = [
  {
    title: "Browse Directory",
    href: "/search",
    icon: Search,
    description: "Search and explore local businesses",
  },
  {
    title: "Browse Categories",
    href: "/#categories",
    icon: MapPin,
    isSection: true,
  },
  {
    title: "AI Tools",
    href: "/ai-tools",
    icon: Sparkles,
    description: "AI tools for local businesses",
  },
  {
    title: "Pricing",
    href: "/pricing",
    icon: Tag,
    description: "Start free — 10 credits every month",
  },
  {
    title: "Blog",
    href: "/blog",
    icon: Newspaper,
    description: "Local business tips and news",
  },
];

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const pathname = usePathname();

  // Split categories into top 6 and remaining
  const topCategories = categories.slice(0, TOP_CATEGORIES_COUNT);
  const moreCategories = categories.slice(TOP_CATEGORIES_COUNT);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden rounded-none border-2 border-nb-border">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 rounded-none border-r-4 border-nb-border">
        <SheetHeader className="border-b-4 border-nb-border px-6 py-4">
          <SheetTitle className="text-left">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-none bg-nb-yellow border-2 border-nb-border">
                <MapPin className="h-4 w-4 text-black" />
              </div>
              <span className="font-bold text-primary">FreddyBeach</span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-6">
          {/* Main Nav Items */}
          <nav className="flex flex-col gap-2">
            {mainNavItems.map((item) => {
              if (item.isSection) {
                return (
                  <React.Fragment key={item.title}>
                    <div className="pt-2">
                      <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                        {item.title}
                      </span>
                    </div>
                    {/* Top 6 categories - single column */}
                    <div className="flex flex-col gap-1">
                      {topCategories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/${category.slug}`}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-2 rounded-none px-3 py-2 text-sm font-bold transition-all duration-150 border-2",
                            pathname === `/${category.slug}`
                              ? "bg-nb-yellow text-black border-nb-border"
                              : "border-transparent hover:bg-nb-yellow hover:text-black hover:border-nb-border"
                          )}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                    {/* More categories - collapsible */}
                    {moreCategories.length > 0 && (
                      <Collapsible open={moreOpen} onOpenChange={setMoreOpen}>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between px-3 py-2 text-sm font-normal text-muted-foreground hover:text-foreground nb-btn rounded-none border-2 border-nb-border"
                          >
                            More Categories
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                moreOpen && "rotate-180"
                              )}
                            />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="max-h-48 overflow-y-auto rounded-none border-2 border-nb-border bg-muted/30">
                            <div className="flex flex-col gap-1 p-2">
                              {moreCategories.map((category) => (
                                <Link
                                  key={category.slug}
                                  href={`/${category.slug}`}
                                  onClick={() => setOpen(false)}
                                  className={cn(
                                    "flex items-center gap-2 rounded-none px-3 py-2 text-sm font-bold transition-all duration-150 border-2",
                                    pathname === `/${category.slug}`
                                      ? "bg-nb-yellow text-black border-nb-border"
                                      : "border-transparent hover:bg-nb-yellow hover:text-black hover:border-nb-border"
                                  )}
                                >
                                  {category.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </React.Fragment>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-none px-3 py-2 font-bold transition-all duration-150 border-2",
                    pathname === item.href
                      ? "bg-nb-yellow text-black border-nb-border"
                      : "border-transparent hover:bg-nb-yellow hover:text-black hover:border-nb-border"
                  )}
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t-2 border-nb-border" />

          {/* CTA */}
          <div className="rounded-none border-2 border-nb-border bg-nb-green/10 p-4">
            <h4 className="font-bold uppercase">Own a Local Business?</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Claim your listing and unlock free AI tools.
            </p>
            <Button asChild className="mt-3 w-full nb-btn bg-nb-green text-black hover:bg-nb-green" size="sm">
              <Link href="/ai-tools" onClick={() => setOpen(false)}>
                Get Started Free
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
