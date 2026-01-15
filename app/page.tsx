"use client"

import { useEffect, useState } from "react"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import DashboardHero from "@/components/dashboard/hero-chat"
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
  const [loading, setLoading] = useState(true)
  const [agentOpen, setAgentOpen] = useState(false)

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)
      const [recentDocs] = await Promise.all([
        documentStorage.getAllDocuments({ limit: 5 }),
      ])
      setDocuments(recentDocs)
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 text-foreground flex flex-col gap-16 relative">
      
      {/* Top Navigation (Subtle) */}
      <header className="flex justify-end items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents..." 
            className="pl-10 bg-card border-border shadow-sm w-64 focus-visible:ring-primary/20 rounded-[14px] h-10" 
          />
        </div>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary hover:bg-secondary rounded-xl">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
        </Button>
      </header>

      {/* Hero Section - The Main Focus */}
      <section className="flex-1 flex flex-col justify-center -mt-10">
        <DashboardHero />
      </section>

      {/* Recent Activity (Secondary) */}
      {documents.length > 0 && (
        <section className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="mb-4 flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Continue Working</h3>
          </div>
          <RecentActivity documents={documents} />
        </section>
      )}
    </div>
  )
}
