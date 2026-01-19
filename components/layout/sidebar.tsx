"use client"

import React, { memo } from "react"
import { Home, FileText, Settings, Briefcase, ChevronRight, Users, Package } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: Users, label: "Clients", href: "/clients" },
  { icon: Package, label: "Items", href: "/items" },
  { icon: Briefcase, label: "Business Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

// Memoized Sidebar to prevent unnecessary re-renders
export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex flex-col w-[260px] h-screen fixed left-0 top-0 z-30 p-4">
      {/* Floating Sidebar Container */}
      <div className="flex flex-col h-full bg-card/80 backdrop-blur-md border border-white/50 shadow-[0_0_20px_rgba(0,0,0,0.02)] rounded-[24px]">
        
        {/* Logo Section */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-lg shadow-orange-500/20 overflow-hidden bg-[#F55503]">
              <img src="/kino-logo.svg" alt="Kino Logo" className="w-full h-full object-cover p-1.5" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground tracking-tight block leading-none">Kino</span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Workspace</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5">
          <div className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-4 px-4 font-mono">
            Main Menu
          </div>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3.5 rounded-[16px] transition-all duration-300 group relative overflow-hidden",
                  isActive 
                    ? "bg-white shadow-sm border border-border/50" 
                    : "hover:bg-white/50 hover:shadow-sm hover:border hover:border-border/30"
                )}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <item.icon 
                    className={cn(
                      "w-[20px] h-[20px] transition-colors duration-300", 
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={cn(
                    "font-medium text-[14px] transition-colors duration-300",
                    isActive ? "text-foreground font-semibold" : "text-muted-foreground group-hover:text-foreground"
                  )}>{item.label}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(245,85,3,0.4)]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 mt-auto">
          <div className="flex items-center gap-3 p-3 bg-white/60 border border-white/50 rounded-[18px] hover:bg-white transition-colors cursor-pointer shadow-sm group">
            <div className="w-9 h-9 bg-[#EBE7E0] rounded-full flex items-center justify-center text-foreground font-bold text-sm border-2 border-white shadow-sm">
              K
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-foreground truncate group-hover:text-primary transition-colors">Kainuo Admin</p>
              <p className="text-[11px] text-muted-foreground truncate">Pro Plan Active</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary/50" />
          </div>
        </div>
      </div>
    </div>
  )
})
