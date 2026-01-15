"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { documentStorage } from "@/lib/document-storage"
import { Document, DocumentType } from "@/lib/types"
import { 
  FileText, 
  FileSignature, 
  Receipt, 
  Files, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Loader2,
  Plus
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { Suspense } from "react"
import { cn } from "@/lib/utils"

function DocumentsContent() {
  const searchParams = useSearchParams()
  const typeFilter = searchParams.get("type") as DocumentType | null
  
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>(typeFilter || "all")

  useEffect(() => {
    async function loadDocuments() {
      setLoading(true)
      const filters = activeTab !== "all" ? { type: activeTab as DocumentType } : {}
      const docs = await documentStorage.getAllDocuments(filters)
      setDocuments(docs)
      setLoading(false)
    }
    loadDocuments()
  }, [activeTab])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      const success = await documentStorage.deleteDocument(id)
      if (success) {
        setDocuments(docs => docs.filter(d => d.id !== id))
        toast.success("Document deleted successfully")
      } else {
        toast.error("Failed to delete document")
      }
    }
  }

  const filteredDocs = documents.filter(doc => 
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getDocIcon = (type: string) => {
    switch (type) {
      case "quotation": return <FileText className="w-5 h-5 text-orange-600" />
      case "contract": return <FileSignature className="w-5 h-5 text-emerald-600" />
      case "invoice": return <Receipt className="w-5 h-5 text-rose-600" />
      default: return <Files className="w-5 h-5 text-blue-600" />
    }
  }

  const getDocColor = (type: string) => {
     switch (type) {
      case "quotation": return "bg-orange-50 border-orange-100/50"
      case "contract": return "bg-emerald-50 border-emerald-100/50"
      case "invoice": return "bg-rose-50 border-rose-100/50"
      default: return "bg-blue-50 border-blue-100/50"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200/50 hover:bg-emerald-200">Paid</Badge>
      case "sent": return <Badge className="bg-blue-100 text-blue-700 border-blue-200/50 hover:bg-blue-200">Sent</Badge>
      default: return <Badge className="bg-secondary text-muted-foreground border-border hover:bg-secondary/80">Draft</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 text-foreground">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Documents</h1>
          <p className="text-muted-foreground text-lg mt-2">Manage and track your paperwork</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href="/editor?type=quotation" className="w-full sm:w-auto">
            <Button className="w-full h-12 rounded-[16px] text-base gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <Plus className="w-5 h-5" /> Create New
            </Button>
          </Link>
        </div>
      </header>

      {/* Tabs & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex bg-card p-1.5 rounded-[18px] shadow-sm border border-border overflow-x-auto no-scrollbar w-full lg:w-auto">
          {["all", "quotation", "contract", "invoice"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-[14px] text-sm font-semibold transition-all whitespace-nowrap",
                activeTab === tab 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}s
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search documents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-card border-border shadow-sm text-base focus-visible:ring-primary/20 rounded-[16px]" 
          />
        </div>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 animate-spin text-primary/50 mb-4" />
          <p className="text-muted-foreground font-medium">Loading your documents...</p>
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="group border border-border bg-card hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5 overflow-visible">
              <CardContent className="p-5">
                <div className="flex items-center gap-5">
                  {/* Icon Container */}
                  <div className={cn("w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-300 group-hover:scale-105", getDocColor(doc.doc_type))}>
                    {getDocIcon(doc.doc_type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground truncate text-lg tracking-tight group-hover:text-primary transition-colors">
                        {doc.title || "Untitled Document"}
                      </h3>
                      <div className="scale-90 origin-left">
                         {getStatusBadge(doc.status || "draft")}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                        {doc.client_name || "No Client"}
                      </span>
                      <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-border"></span>
                      <span>Updated {format(new Date(doc.updated_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Link href={`/editor?type=${doc.doc_type}&id=${doc.id}`}>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10">
                        <Edit className="w-5 h-5" />
                      </Button>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-[16px] border-border p-2">
                        <DropdownMenuItem className="gap-2 rounded-[10px] cursor-pointer py-2.5">
                          <Eye className="w-4 h-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 rounded-[10px] cursor-pointer py-2.5">
                          <Download className="w-4 h-4" /> Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 rounded-[10px] cursor-pointer py-2.5"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-card rounded-[32px] border-2 border-dashed border-border/60">
          <div className="w-20 h-20 bg-secondary/50 rounded-[24px] flex items-center justify-center mb-6">
            <Files className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No documents found</h3>
          <p className="text-muted-foreground mb-8 text-center max-w-sm text-base leading-relaxed">
            {activeTab === "all" 
              ? "You haven't created any documents yet. Start by creating a quotation or invoice."
              : `You don't have any ${activeTab}s yet.`}
          </p>
          <Link href="/editor?type=quotation">
            <Button size="lg" className="h-12 px-8 rounded-[16px] text-base gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
              <Plus className="w-5 h-5" /> Create First Document
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <DocumentsContent />
    </Suspense>
  )
}
