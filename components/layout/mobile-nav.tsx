"use client"

import { useState } from "react"
import { Home, FileText, Settings, Briefcase, Menu, X, ArrowRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: Briefcase, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between h-16 px-6 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-[60]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-[12px] flex items-center justify-center text-white font-bold text-lg shadow-md">
            K
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">Kino</span>
        </Link>
        <div className="flex items-center gap-2">
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground hover:bg-secondary/50 rounded-[12px]"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Full Screen Overlay Menu */}
      <div className={cn(
        "fixed inset-0 bg-background z-[55] transition-transform duration-300 ease-in-out md:hidden pt-24 px-6 flex flex-col",
        isOpen ? "translate-y-0" : "-translate-y-full"
      )}>
        <nav className="space-y-3 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between p-5 rounded-[20px] transition-all border",
                  isActive 
                    ? "bg-card border-primary/20 shadow-md" 
                    : "bg-transparent border-transparent hover:bg-card hover:border-border"
                )}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground")} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={cn("text-lg font-bold", isActive ? "text-foreground" : "text-muted-foreground")}>{item.label}</span>
                </div>
                {isActive && <ArrowRight className="w-5 h-5 text-primary" />}
              </Link>
            )
          })}
        </nav>

        <div className="mb-10">
          <div className="p-6 bg-card rounded-[24px] border border-border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-foreground font-bold text-2xl border-2 border-background shadow-sm">
                K
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">Kainuo</p>
                <p className="text-sm text-muted-foreground">Professional Plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
