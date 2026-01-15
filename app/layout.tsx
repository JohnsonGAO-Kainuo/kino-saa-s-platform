import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { LanguageProvider } from "@/lib/language-context"
import { Toaster } from "@/components/ui/sonner"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kino - Document Management SaaS",
  description: "Professional document generation platform for quotations, invoices, and receipts",
  generator: "v0.app",
// ... existing metadata code ...
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased bg-background text-foreground`}>
        <AuthProvider>
          <LanguageProvider>
            <div className="flex flex-col md:flex-row min-h-screen">
              <Sidebar />
              <MobileNav />
              <main className="flex-1 md:pl-64 transition-all duration-300 ease-in-out w-full">
                {children}
              </main>
            </div>
            <Analytics />
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
