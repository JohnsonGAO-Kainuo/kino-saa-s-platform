"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Bell, Settings, User, Search, HelpCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo and Search */}
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-lg font-bold text-primary-foreground leading-none">K</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-[#1a1f36]">Kino</span>
          </div>
          
          <div className="hidden md:flex relative max-w-[320px] w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search documents, clients..." 
              className="h-9 pl-9 bg-[#f7f9fc] border-transparent focus:bg-white focus:border-border transition-all shadow-none" 
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="w-9 h-9 text-muted-foreground hover:text-foreground">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-9 h-9 text-muted-foreground hover:text-foreground relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </Button>
          <Button variant="ghost" size="icon" className="w-9 h-9 text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </Button>

          <div className="w-px h-6 bg-border mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2.5 px-1.5 hover:bg-[#f7f9fc]">
                <Avatar className="w-7 h-7 border border-border">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">JD</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-[#1a1f36]">Kainuo Innovision</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-[#1a1f36]">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#e6e9ef]" />
              <DropdownMenuItem className="cursor-pointer text-[#4f566b] focus:text-[#1a1f36] focus:bg-[#f7f9fc]">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer text-[#4f566b] focus:text-[#1a1f36] focus:bg-[#f7f9fc]">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="bg-[#e6e9ef]" />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-red-50"
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/login'
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
