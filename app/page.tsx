"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CreateButtons } from "@/components/dashboard/create-buttons"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { documentStorage } from "@/lib/document-storage"
import { Document } from "@/lib/types"
import { Loader2, Bell, Search } from "lucide-react"
import { AIAgentSidebar } from "@/components/editor/ai-agent-sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
    console.log("Document generated from dashboard:", content)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Calculate stats
  const stats = {
    total: documents.length,
    quotations: documents.filter(d => d.doc_type === 'quotation').length,
    contracts: documents.filter(d => d.doc_type === 'contract').length,
    invoices: documents.filter(d => d.doc_type === 'invoice').length
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8 text-slate-900">
      {/* Top Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your business documents</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search..." 
              className="pl-10 bg-white border-none shadow-sm w-64 focus-visible:ring-blue-500" 
            />
          </div>
          <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-blue-600">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f7f9fc]"></span>
          </Button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="mb-10">
        <StatsCards stats={stats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Create Buttons (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
          <CreateButtons />
          
          {/* Drafts List could go here if needed, keeping it simple for now to match design */}
        </div>

        {/* Right Sidebar - Recent Activity (1/3 width) */}
        <div className="space-y-6">
          <RecentActivity />
        </div>
      </div>

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
