"use client"

import { useState } from "react"
import { EditorTabs } from "./editor-tabs"
import { EditorForm } from "./editor-form"
import { DocumentPreview } from "./document-preview"
import { EditorHeader } from "./editor-header"
import { AIAgentSidebar } from "./ai-agent-sidebar"
import { PaymentStatusUI } from "./payment-status-ui"
import type { PaymentStatus } from "@/lib/payment-utils"
import { createPaymentStatus } from "@/lib/payment-utils"

type DocumentType = "quotation" | "invoice" | "receipt" | "contract"

export function EditorLayout({ documentType: initialType }: { documentType: DocumentType }) {
  const [activeTab, setActiveTab] = useState<DocumentType>(initialType)
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    items: [{ description: "", quantity: 1, unitPrice: 0 }],
    notes: "",
    logo: null as File | null,
    signature: null as string | null,
    stamp: null as File | null,
    contractTerms: "",
    paymentTerms: "",
    deliveryDate: "",
    paymentStatus: createPaymentStatus() as PaymentStatus,
  })

  const handleDocumentGenerated = (generatedContent: any) => {
    setFormData((prev) => ({
      ...prev,
      clientName: generatedContent.client_name || prev.clientName,
      clientEmail: generatedContent.client_email || prev.clientEmail,
      items: generatedContent.items || prev.items,
      notes: generatedContent.notes || prev.notes,
      contractTerms: generatedContent.terms || prev.contractTerms,
    }))
  }

  const handlePaymentStatusChange = (newStatus: PaymentStatus) => {
    setFormData((prev) => ({
      ...prev,
      paymentStatus: newStatus,
    }))
  }

  const totalAmount = formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <EditorHeader documentType={activeTab} />

      <div className="border-b border-border bg-card/50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-4 sm:p-6 lg:p-8">
            {/* Left: Form */}
            <div className="overflow-y-auto pr-4 -mr-4">
              {(activeTab === "invoice" || activeTab === "receipt") && (
                <PaymentStatusUI
                  documentType={activeTab}
                  currentStatus={formData.paymentStatus}
                  onStatusChange={handlePaymentStatusChange}
                  totalAmount={totalAmount}
                />
              )}
              <EditorForm documentType={activeTab} formData={formData} onChange={setFormData} />
            </div>

            {/* Right: Preview */}
            <div className="overflow-y-auto" id="document-preview">
              <DocumentPreview documentType={activeTab} formData={formData} />
            </div>
          </div>
        </div>

        <AIAgentSidebar currentDocType={activeTab} onDocumentGenerated={handleDocumentGenerated} />
      </main>
    </div>
  )
}
