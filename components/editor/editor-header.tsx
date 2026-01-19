"use client"

import { Button } from "@/components/ui/button"
import { Download, Share2, Loader2, Check, ZoomIn, ZoomOut, Maximize } from "lucide-react"
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
    <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group">
            <span className="text-xl transition-transform group-hover:-translate-x-1">←</span> Dashboard
          </Link>
          
          <div className="h-4 w-[1px] bg-border hidden md:block" />

          {/* Improved Save Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full border border-border/50">
            {isSaving ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Syncing...</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Auto-saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unsaved</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1 mr-4 bg-muted/20 p-1 rounded-lg">
            <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-[10px] font-black w-8 text-center text-muted-foreground">100%</span>
            <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-border hover:bg-secondary gap-2 hidden sm:flex">
            <Share2 className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-wider">Share</span>
          </Button>
          
          <Button
            size="sm"
            className="h-10 px-6 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all gap-2"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export PDF</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
