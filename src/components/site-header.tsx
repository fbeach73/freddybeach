"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Sparkles, Search, Tag, Newspaper } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { ModeToggle } from "./ui/mode-toggle";
import { MobileNav } from "./layout/mobile-nav";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Browse Directory",
    href: "/search",
    icon: Search,
  },
  {
    title: "AI Tools",
    href: "/ai-tools",
    icon: Sparkles,
  },
  {
    title: "Pricing",
    href: "/pricing",
    icon: Tag,
  },
  {
    title: "Blog",
    href: "/blog",
    icon: Newspaper,
  },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-nb-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Mobile Nav */}
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-none bg-nb-yellow border-2 border-nb-border">
                <MapPin className="h-5 w-5 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none uppercase">
                  FreddyBeach
                </span>
                <span className="text-[10px] text-muted-foreground leading-none hidden sm:block">
                  AI tools + directory for Fredericton businesses
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm transition-all duration-150",
                  pathname === item.href
                    ? "font-bold bg-nb-yellow text-black border-2 border-nb-border"
                    : "font-bold border-2 border-transparent hover:border-nb-border hover:bg-nb-yellow hover:text-black"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* User Profile */}
            <UserProfile />

            {/* Theme Toggle */}
            <ModeToggle />

            {/* CTA Button - Desktop only */}
            <Link href="/dashboard" className="hidden lg:block">
              <Button size="sm" className="nb-btn bg-nb-yellow text-black hover:bg-nb-yellow">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
