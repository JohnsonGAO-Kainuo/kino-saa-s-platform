"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

export function AuthShell({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  return (
    <main
      className={cn(
        "flex-1 transition-all duration-300 ease-in-out w-full relative",
        user ? "md:pl-64" : "md:pl-0"
      )}
    >
      {children}
    </main>
  )
}
