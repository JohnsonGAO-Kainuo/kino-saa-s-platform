"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DocumentStats } from "@/components/dashboard/document-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SubscriptionCard } from "@/components/dashboard/subscription-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { DraftDocuments } from "@/components/dashboard/draft-documents"
import { documentStorage } from "@/lib/document-storage"
import { Document } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDocuments() {
      const docs = await documentStorage.getAllDocuments()
      setDocuments(docs)
      setLoading(false)
    }
    loadDocuments()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Convert types to match DraftDoc interface
  const drafts = documents.map(doc => ({
    id: doc.id,
    type: doc.doc_type,
    title: doc.title || "Untitled",
    clientName: doc.client_name || "Unknown",
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
    status: doc.status as "draft" | "sent" | "archived"
  }))

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-foreground">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-[28px] font-bold text-[#1a1f36] tracking-tight">Good morning, Johnson</h1>
          <p className="text-[#4f566b] text-[15px] mt-1">Here's what's happening with your documents today.</p>
        </div>

        {/* Top Section: Stats and Subscription */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
          <div className="lg:col-span-3">
            <DocumentStats />
          </div>
          <div className="lg:col-span-1">
            <SubscriptionCard />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <QuickActions />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Drafts */}
          <div className="lg:col-span-2">
            <DraftDocuments drafts={drafts} />
          </div>

          {/* Sidebar: Activity Feed */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  )
}
