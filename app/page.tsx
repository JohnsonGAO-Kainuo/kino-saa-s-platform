"use client"

import { useEffect, useState, useCallback } from "react"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import DashboardHero from "@/components/dashboard/hero-chat"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { documentStorage } from "@/lib/document-storage"
import { Document } from "@/lib/types"
import { Bell, Search, Loader2, Plus, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    quotations: 0,
    contracts: 0,
    invoices: 0
  })

  const loadDashboardData = useCallback(async () => {
    if (!user) {
      setLoadingDocs(false)
      return
    }

    try {
      setLoadingDocs(true)
      
      // Load recent documents and stats in parallel for better performance
      const [recentDocs, docStats] = await Promise.all([
        documentStorage.getAllDocuments({ limit: 5 }),
        documentStorage.getDocumentStats()
      ])
      
      setDocuments(recentDocs)
      setStats(docStats)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoadingDocs(false)
    }
  }, [user])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 flex flex-col gap-12 relative overflow-x-hidden">
      
      {/* Top Navigation */}
      <header className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground/80">AI Workspace Active</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search or ask AI..." 
              className="pl-10 bg-card border-border shadow-none w-64 focus-visible:ring-primary/20 rounded-xl h-10" 
            />
          </div>
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary hover:bg-secondary rounded-xl">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col justify-center py-10">
        <DashboardHero />
      </section>

      {/* Stats Section */}
      <section className="max-w-5xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between px-2">
          <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Overview</h3>
        </div>
        <StatsCards stats={stats} />
      </section>

      {/* Recent Activity */}
      <section className="max-w-5xl mx-auto w-full pb-20">
        <div className="mb-6 flex items-center justify-between px-2">
          <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Recent Activity</h3>
          <Link href="/documents">
            <Button variant="link" className="text-primary text-xs font-bold uppercase tracking-widest p-0 h-auto">View All Docs</Button>
          </Link>
        </div>
        
        {loadingDocs ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-card/30 border border-border rounded-[22px] animate-pulse" />
            ))}
          </div>
        ) : documents.length > 0 ? (
          <RecentActivity documents={documents} />
        ) : (
          <div className="bg-card/30 rounded-[32px] border-2 border-dashed border-border p-16 text-center">
            <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-light text-muted-foreground/40">
              +
            </div>
            <p className="text-muted-foreground font-medium mb-6">No recent documents found.</p>
            <Link href="/editor?type=quotation">
              <Button variant="outline" className="rounded-xl px-8 border-primary/20 text-primary hover:bg-primary/5">
                Create First Document
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
