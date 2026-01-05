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

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { documentStorage } from "@/lib/document-storage"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

type DocumentType = "quotation" | "invoice" | "receipt" | "contract"

export function EditorLayout({ documentType: initialType }: { documentType: DocumentType }) {
  const [activeTab, setActiveTab] = useState<DocumentType>(initialType)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const docId = searchParams.get("id")
  const { user } = useAuth()

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

  // Load document or default settings
  useEffect(() => {
    async function initEditor() {
      if (docId) {
        // Mode: Edit existing document
        const doc = await documentStorage.getDocument(docId)
        if (doc) {
          setFormData({
            clientName: doc.client_name || "",
            clientEmail: doc.client_email || "",
            clientAddress: doc.client_address || "",
            items: doc.content?.items || [{ description: "", quantity: 1, unitPrice: 0 }],
            notes: doc.content?.notes || "",
            logo: null,
            signature: doc.signature_url || null,
            stamp: null,
            contractTerms: doc.content?.contractTerms || "",
            paymentTerms: doc.content?.paymentTerms || "",
            deliveryDate: doc.content?.deliveryDate || "",
            paymentStatus: createPaymentStatus(doc.status as any) as PaymentStatus,
          })
          setActiveTab(doc.doc_type)
        }
      } else if (user) {
        // Mode: Create new document - Load default settings
        try {
          const { data: settings } = await supabase
            .from('company_settings')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (settings) {
            setFormData(prev => ({
              ...prev,
              // We can pre-fill company info in the future if we have a "From" section in the form
              // For now, let's pre-fill the payment terms if it's an invoice
              paymentTerms: settings.default_payment_notes || "",
              notes: `Payment Details:\nBank: ${settings.bank_name || '—'}\nA/C: ${settings.account_number || '—'}\nFPS: ${settings.fps_id || '—'}`,
            }))
          }
        } catch (e) {
          console.error("Error loading default settings:", e)
        }
      }
      setLoading(false)
    }
    initEditor()
  }, [docId, user])

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save documents")
      return
    }

    setIsSaving(true)
    try {
      const docData = {
        id: docId || undefined,
        user_id: user.id,
        doc_type: activeTab,
        status: formData.paymentStatus.status === 'paid' ? 'paid' : 'draft',
        title: formData.clientName ? `${activeTab.toUpperCase()} - ${formData.clientName}` : `Untitled ${activeTab}`,
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        client_address: formData.clientAddress,
        content: {
          items: formData.items,
          notes: formData.notes,
          contractTerms: formData.contractTerms,
          paymentTerms: formData.paymentTerms,
          deliveryDate: formData.deliveryDate,
        },
        signature_url: formData.signature || undefined,
      }

      const savedDoc = await documentStorage.saveDocument(docData)
      if (savedDoc) {
        toast.success("Document saved successfully!")
        if (!docId) {
          router.replace(`/editor?type=${activeTab}&id=${savedDoc.id}`)
        }
      } else {
        throw new Error("Failed to save document")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to save document")
    } finally {
      setIsSaving(false)
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <EditorHeader documentType={activeTab} onSave={handleSave} isSaving={isSaving} />

      <div className="border-b border-border bg-card sticky top-16 z-40">
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
import { Loader2 } from "lucide-react"
