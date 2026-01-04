"use client"

import { Button } from "@/components/ui/button"
import { Download, Save, Share2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { generatePDF } from "@/lib/pdf-export"

interface EditorHeaderProps {
  documentType: "quotation" | "invoice" | "receipt" | "contract"
  onSave?: () => void
  isSaving?: boolean
}

export function EditorHeader({ documentType, onSave, isSaving }: EditorHeaderProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (documentType === 'contract') {
      alert("PDF export for contracts coming soon!")
      return
    }
    setIsExporting(true)
    try {
      const fileName = `${documentType}-${new Date().getTime()}`
      await generatePDF(documentType as any, {}, fileName)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <span className="text-lg">←</span> Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export PDF"}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
import { Loader2 } from "lucide-react"
