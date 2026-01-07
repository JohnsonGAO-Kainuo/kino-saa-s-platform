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

import { DashboardLayout } from "@/components/layout/dashboard-layout"

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
    <DashboardLayout>
      <div className="p-8">
        {/* Welcome Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1f36]">Dashboard</h1>
          </div>
          <div className="flex gap-4">
            <DashboardHeader />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-8">
          <DocumentStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (8 units) */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SubscriptionCard />
                <QuickActions />
              </div>
              <DraftDocuments drafts={drafts} />
              <RecentActivity />
            </div>

            {/* Right Column (4 units) - Preview Area like design */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800">Preview</h3>
                  <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded border border-red-100 uppercase tracking-widest">Unpaid</span>
                </div>
                
                {/* Simplified Document Preview Mock */}
                <div className="aspect-[1/1.4] bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col p-6 overflow-hidden">
                  <div className="w-12 h-12 bg-slate-200 rounded mb-6" />
                  <div className="space-y-2 mb-8">
                    <div className="w-full h-4 bg-slate-200 rounded" />
                    <div className="w-2/3 h-4 bg-slate-200 rounded" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex justify-between">
                        <div className="w-1/2 h-3 bg-slate-200 rounded" />
                        <div className="w-1/4 h-3 bg-slate-200 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-6 border-t border-slate-200">
                    <div className="flex justify-between font-bold">
                      <div className="w-1/4 h-4 bg-slate-200 rounded" />
                      <div className="w-1/3 h-4 bg-slate-200 rounded" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button className="flex-1 bg-slate-100 text-slate-600 font-medium py-2 rounded-lg text-sm hover:bg-slate-200 transition-colors">Edit</button>
                  <button className="flex-1 bg-[#6366f1] text-white font-medium py-2 rounded-lg text-sm hover:bg-[#5658d2] transition-colors">Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Integrated AI Sidebar */}
      <AIAgentSidebar 
        currentDocType="document" 
        onDocumentGenerated={handleDocumentGenerated} 
        isOpen={agentOpen}
        onToggle={setAgentOpen}
      />
    </DashboardLayout>
  )
}
