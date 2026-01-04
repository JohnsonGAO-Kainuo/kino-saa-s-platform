"use client"

import { Button } from "@/components/ui/button"
import { Download, Save, Share2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { generatePDF } from "@/lib/pdf-export"

interface EditorHeaderProps {
  documentType: "quotation" | "invoice" | "receipt"
}

export function EditorHeader({ documentType }: EditorHeaderProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const fileName = `${documentType}-${new Date().getTime()}`
      await generatePDF(documentType, {}, fileName)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-foreground hover:text-accent transition-colors">
            ← Back
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
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
