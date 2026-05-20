"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Building2,
  ArrowLeft,
  Shield,
  Download,
  FileText,
  PenSquare,
  Sparkles,
  BarChart3,
  Wrench,
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
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
  },
  {
    label: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    label: "Claims",
    icon: ClipboardCheck,
    href: "/admin/claims",
  },
  {
    label: "Businesses",
    icon: Building2,
    href: "/admin/businesses",
  },
  {
    label: "Import Businesses",
    icon: Download,
    href: "/admin/import",
  },
  {
    label: "Blog Posts",
    icon: FileText,
    href: "/admin/blog",
  },
  {
    label: "New Post",
    icon: PenSquare,
    href: "/admin/blog/new",
  },
  {
    label: "Blog Optimizer",
    icon: Sparkles,
    href: "/admin/blog-optimizer",
  },
  {
    label: "Tool Access",
    icon: Wrench,
    href: "/admin/tools",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-semibold group-data-[collapsible=icon]:hidden">
            Admin Panel
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
