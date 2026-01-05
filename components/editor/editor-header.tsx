"use client"

import { Button } from "@/components/ui/button"
import { Download, Save, Share2, Loader2, Check } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { generatePDF } from "@/lib/pdf-export"

interface EditorHeaderProps {
  documentType: "quotation" | "invoice" | "receipt" | "contract"
  onSave?: () => void
  isSaving?: boolean
  lastSaved?: Date | null
}

export function EditorHeader({ documentType, onSave, isSaving, lastSaved }: EditorHeaderProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const fileName = `${documentType}-${new Date().getTime()}`
      await generatePDF(documentType, {}, fileName)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export PDF. Please ensure all images are loaded and try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <span className="text-lg">←</span> Dashboard
          </Link>
          
          {lastSaved && (
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-muted-foreground bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
              <Check className="w-3 h-3 text-green-500" />
              <span>Auto-saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          )}
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
            <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
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
