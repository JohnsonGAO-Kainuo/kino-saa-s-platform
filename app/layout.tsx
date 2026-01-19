            import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { LanguageProvider } from "@/lib/language-context"
import { Toaster } from "@/components/ui/sonner"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { AuthShell } from "@/components/layout/auth-shell"

// Use Inter as a primary font for better performance and professional look
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  themeColor: "#F55503",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: "Kino SaaS - AI Document Workspace",
  description: "Minimalist AI-powered platform for professional quotations, invoices, and contracts",
  metadataBase: new URL('https://kino-saas.vercel.app'), // Replace with actual URL
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        {/* Preconnect to Supabase for faster initial handshakes - only if URL is defined */}
        {supabaseUrl && (
          <>
            <link rel="preconnect" href={supabaseUrl} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={supabaseUrl} />
          </>
        )}
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <AuthProvider>
          <LanguageProvider>
            <div className="flex flex-col md:flex-row min-h-screen relative">
              <Sidebar />
              <MobileNav />
              <AuthShell>
                {children}
              </AuthShell>
            </div>
            <Analytics />
            <Toaster position="top-center" expand={false} richColors />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
