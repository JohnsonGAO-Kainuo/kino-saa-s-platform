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
import { AIAgentSidebar } from "@/components/editor/ai-agent-sidebar"

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [agentOpen, setAgentOpen] = useState(false)

  useEffect(() => {
    async function loadDocuments() {
      const docs = await documentStorage.getAllDocuments()
      setDocuments(docs)
      setLoading(false)
    }
    loadDocuments()
  }, [])

  const handleDocumentGenerated = (content: any) => {
    // Logic to handle AI generation from dashboard
    console.log("Document generated from dashboard:", content)
  }

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
          <h1 className="text-[28px] font-bold text-[#1a1f36] tracking-tight">Good morning</h1>
          <p className="text-[#4f566b] text-[15px] mt-1">Here's what's happening with your documents today.</p>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 units) */}
          <div className="lg:col-span-8 space-y-8">
            <DocumentStats />
            <QuickActions />
            <DraftDocuments drafts={drafts} />
          </div>

          {/* Right Column (4 units) */}
          <div className="lg:col-span-4 space-y-8">
            <SubscriptionCard />
            <RecentActivity />
          </div>
        </div>
      </main>

      {/* Global Integrated AI Sidebar */}
      <AIAgentSidebar 
        currentDocType="document" 
        onDocumentGenerated={handleDocumentGenerated} 
        isOpen={agentOpen}
        onToggle={setAgentOpen}
      />
    </div>
  )
}
