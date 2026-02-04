"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Sparkles,
  BarChart3,
  CreditCard,
  Settings,
  Shield,
  ChevronLeft,
  Plus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils/format";

const navItems = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "My Businesses",
    icon: Building2,
    href: "/dashboard/my-businesses",
  },
  {
    label: "AI Tools",
    icon: Sparkles,
    href: "/ai-tools",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
  },
  {
    label: "Billing",
    icon: CreditCard,
    href: "/dashboard/billing",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const { toggleSidebar, open } = useSidebar();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="font-semibold group-data-[collapsible=icon]:hidden">
            Dashboard
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 pb-2 group-data-[collapsible=icon]:px-0">
              <Button
                asChild
                size="sm"
                className="w-full group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
              >
                <Link href="/dashboard/my-businesses/new">
                  <Plus className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-1.5" />
                  <span className="group-data-[collapsible=icon]:hidden">Add Business</span>
                </Link>
              </Button>
            </div>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Admin Panel link for admin users */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/admin")}
                    tooltip="Admin Panel"
                  >
                    <Link href="/admin">
                      <Shield className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
            <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium truncate">
              {user?.name || "Loading..."}
            </span>
            {isAdmin ? (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5 w-fit">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 w-fit">
                {user?.role === "client" ? "Business Owner" : "Member"}
              </Badge>
            )}
          </div>
        </div>
      </SidebarFooter>

      {/* Floating collapse/expand toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-18 z-20 hidden sm:flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors"
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      >
        <ChevronLeft
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
            open ? "" : "rotate-180"
          }`}
        />
      </button>
    </Sidebar>
  );
}
