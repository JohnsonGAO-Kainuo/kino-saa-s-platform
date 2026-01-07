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

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState({ total: 0, quotations: 0, contracts: 0, invoices: 0 })
  const [loading, setLoading] = useState(true)
  const [agentOpen, setAgentOpen] = useState(false)

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)
      const [recentDocs, documentStats] = await Promise.all([
        documentStorage.getAllDocuments({ limit: 5 }),
        documentStorage.getDocumentStats()
      ])
      setDocuments(recentDocs)
      setStats(documentStats)
      setLoading(false)
    }
    loadDashboardData()
  }, [])

  const handleDocumentGenerated = async (content: any) => {
    if (!user) {
      toast.error("Please login to create documents")
      return
    }

    try {
      const docType = "quotation" // Default
      const docData = {
        user_id: user.id,
        doc_type: docType,
        status: "draft",
        title: content.clientName ? `${docType.toUpperCase()} - ${content.clientName}` : `AI Generated ${docType}`,
        client_name: content.clientName || "",
        client_email: content.clientEmail || "",
        client_address: content.clientAddress || "",
        content: content,
      }

      const savedDoc = await documentStorage.saveDocument(docData)
      if (savedDoc) {
        toast.success("AI draft created! Opening editor...")
        router.push(`/editor?type=${docType}&id=${savedDoc.id}`)
      }
    } catch (error) {
      console.error("Error creating AI draft:", error)
      toast.error("Failed to create AI draft")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
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
          
          {/* Recent Documents Table or Grid could go here */}
        </div>

        {/* Right Sidebar - Recent Activity (1/3 width) */}
        <div className="space-y-6">
          <RecentActivity documents={documents} />
        </div>
      </div>

      {/* Global Integrated AI Sidebar */}
      <AIAgentSidebar 
        currentDocType="document" 
        onDocumentGenerated={handleDocumentGenerated} 
        isOpen={agentOpen}
        onToggle={setAgentOpen}
        docId="dashboard"
      />
    </div>
  )
}
