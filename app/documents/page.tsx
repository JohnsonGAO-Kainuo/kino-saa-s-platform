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
  Filter, 
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
      case "quotation": return <FileText className="w-5 h-5 text-orange-500" />
      case "contract": return <FileSignature className="w-5 h-5 text-emerald-500" />
      case "invoice": return <Receipt className="w-5 h-5 text-purple-500" />
      default: return <Files className="w-5 h-5 text-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-green-100 text-green-700 border-none">Paid</Badge>
      case "sent": return <Badge className="bg-blue-100 text-blue-700 border-none">Sent</Badge>
      default: return <Badge className="bg-gray-100 text-gray-700 border-none">Draft</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-4 md:p-8 text-slate-900">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Documents</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track all your generated documents</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href="/editor?type=quotation" className="w-full sm:w-auto">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11 md:h-10">
              <Plus className="w-4 h-4" /> Create New
            </Button>
          </Link>
        </div>
      </header>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
          {["all", "quotation", "contract", "invoice"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? "bg-blue-50 text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}s
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search documents or clients..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-none shadow-sm h-11 md:h-10 focus-visible:ring-blue-500" 
          />
        </div>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
          <p className="text-slate-500">Loading your documents...</p>
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="border-none shadow-sm hover:shadow-md transition-all group bg-white overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                    {getDocIcon(doc.doc_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-0.5">
                      <h3 className="font-bold text-slate-900 truncate text-sm md:text-base">{doc.title || "Untitled Document"}</h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(doc.status || "draft")}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        {doc.client_name || "No Client"}
                      </span>
                      <span className="hidden sm:inline-block">•</span>
                      <span>Updated {format(new Date(doc.updated_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/editor?type=${doc.doc_type}&id=${doc.id}`}>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="w-4 h-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Download className="w-4 h-4" /> Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
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
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Files className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No documents found</h3>
          <p className="text-slate-500 mb-6 text-center max-w-xs">
            {activeTab === "all" 
              ? "You haven't created any documents yet. Start by creating a quotation or invoice."
              : `You don't have any ${activeTab}s yet.`}
          </p>
          <Link href="/editor?type=quotation">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Create Your First Document
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
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <DocumentsContent />
    </Suspense>
  )
}

