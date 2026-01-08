"use client"

import { useState } from "react"
import { Home, FileText, Settings, User, Briefcase, Menu, X, Bot } from "lucide-react"
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
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-gray-100 sticky top-0 z-[60]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            K
          </div>
          <span className="text-lg font-bold text-gray-800 tracking-tight">Kino</span>
        </Link>
        <div className="flex items-center gap-2">
           <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-500"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Full Screen Overlay Menu */}
      <div className={cn(
        "fixed inset-0 bg-white z-[55] transition-transform duration-300 ease-in-out md:hidden pt-20 px-6",
        isOpen ? "translate-y-0" : "-translate-y-full"
      )}>
        <nav className="space-y-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl transition-all",
                  isActive 
                    ? "bg-blue-50 text-blue-600 font-bold" 
                    : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive ? "text-blue-600" : "text-gray-400")} />
                <span className="text-lg">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-8 left-6 right-6 p-6 bg-slate-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
              K
            </div>
            <div>
              <p className="font-bold text-gray-900">Kainuo</p>
              <p className="text-sm text-gray-500 italic">Professional Plan</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

