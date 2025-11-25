"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Sparkles, Users, Search } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { ModeToggle } from "./ui/mode-toggle";
import { MobileNav } from "./layout/mobile-nav";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Browse",
    href: "/search",
    icon: Search,
  },
  {
    title: "AI Tools",
    href: "/ai-tools",
    icon: Sparkles,
  },
  {
    title: "Success Stories",
    href: "/success-stories",
    icon: Users,
  },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Mobile Nav */}
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none">
                  FreddyBeach
                </span>
                <span className="text-[10px] text-muted-foreground leading-none hidden sm:block">
                  Fredericton Business Directory
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
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hidden sm:flex"
            >
              <Link href="/search">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>

            {/* User Profile */}
            <UserProfile />

            {/* Theme Toggle */}
            <ModeToggle />

            {/* CTA Button - Desktop only */}
            <Button asChild className="hidden lg:flex" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
