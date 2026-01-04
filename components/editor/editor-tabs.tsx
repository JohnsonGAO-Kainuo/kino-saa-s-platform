"use client"

import type React from "react"
import { FileText, DollarSign, Receipt, FileSignature } from "lucide-react"

type DocumentType = "quotation" | "invoice" | "receipt" | "contract"

interface EditorTabsProps {
  activeTab: DocumentType
  onTabChange: (tab: DocumentType) => void
}

export function EditorTabs({ activeTab, onTabChange }: EditorTabsProps) {
  const tabs: { type: DocumentType; label: string; icon: React.ReactNode }[] = [
    { type: "quotation", label: "Quotation", icon: <FileText className="w-4 h-4" /> },
    { type: "contract", label: "Contract", icon: <FileSignature className="w-4 h-4" /> },
    { type: "invoice", label: "Invoice", icon: <DollarSign className="w-4 h-4" /> },
    { type: "receipt", label: "Receipt", icon: <Receipt className="w-4 h-4" /> },
  ]

  return (
    <div className="flex gap-2 py-4 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.type}
          onClick={() => onTabChange(tab.type)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === tab.type
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-card"
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
