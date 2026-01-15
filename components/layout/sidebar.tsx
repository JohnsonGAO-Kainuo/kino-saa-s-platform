"use client"

import { Home, FileText, Settings, Briefcase } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: Briefcase, label: "Business Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen fixed left-0 top-0 z-30 shadow-sm">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
          K
        </div>
        <span className="text-xl font-bold text-foreground tracking-tight">Kino</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-3">
          Menu
        </div>
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 bg-secondary/50 rounded-xl">
          <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center text-foreground font-bold text-sm shadow-sm">
            K
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Kainuo</p>
            <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  )
}
