"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MapPin, Sparkles, Users, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/data";

const mainNavItems = [
  {
    title: "Browse",
    href: "/search",
    icon: Search,
    description: "Search and explore local businesses",
  },
  {
    title: "Browse Categories",
    href: "#categories",
    icon: MapPin,
    isSection: true,
  },
  {
    title: "AI Tools",
    href: "/ai-tools",
    icon: Sparkles,
    description: "Free AI tools for local businesses",
  },
  {
    title: "Success Stories",
    href: "/success-stories",
    icon: Users,
    description: "See how local businesses are growing",
  },
];

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-left">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
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
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        {item.title}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.slice(0, 6).map((category) => (
                        <Link
                          key={category.slug}
                          href={`/${category.slug}`}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                            pathname === `/${category.slug}` && "bg-accent"
                          )}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/#categories"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      View all categories
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </React.Fragment>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent",
                    pathname === item.href && "bg-accent"
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

          <Separator />

          {/* CTA */}
          <div className="rounded-lg bg-primary/5 p-4">
            <h4 className="font-medium">Own a Local Business?</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Claim your listing and unlock free AI tools.
            </p>
            <Button asChild className="mt-3 w-full" size="sm">
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
