"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  User, 
  Building2, 
  FileCheck, 
  BarChart3, 
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Building2, label: "Business Profiles", href: "/business-profile" },
  { icon: FileCheck, label: "Contracts", href: "/contracts" },
  { icon: BarChart3, label: "Analysis", href: "/analysis" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-background/50 backdrop-blur-sm">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-lg font-bold text-primary-foreground leading-none">K</span>
          </div>
          {state !== "collapsed" && (
            <span className="text-xl font-bold tracking-tight text-foreground">Kino</span>
          )}
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className={cn(
                  "h-10 px-3 transition-all duration-200 rounded-xl",
                  pathname === item.href 
                    ? "bg-primary/10 text-primary font-semibold shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Link href={item.href}>
                  <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-primary" : "text-muted-foreground/70")} />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-3 py-4 border-t border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/settings"}
              tooltip="Settings"
              className={cn(
                "h-10 px-3 transition-all duration-200 rounded-xl",
                pathname === "/settings" 
                  ? "bg-primary/10 text-primary font-semibold shadow-sm" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Link href="/settings">
                <Settings className={cn("w-5 h-5", pathname === "/settings" ? "text-primary" : "text-muted-foreground/70")} />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

