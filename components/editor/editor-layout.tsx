"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { EditorTabs } from "./editor-tabs"
import { EditorForm } from "./editor-form"
import { DocumentPreview } from "./document-preview"
import { EditorHeader } from "./editor-header"
import { AIAgentSidebar } from "./ai-agent-sidebar"
import { PaymentStatusUI } from "./payment-status-ui"
import type { PaymentStatus } from "@/lib/payment-utils"
import { createPaymentStatus } from "@/lib/payment-utils"
import { useSearchParams, useRouter } from "next/navigation"
import { documentStorage } from "@/lib/document-storage"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

type DocumentType = "quotation" | "invoice" | "receipt" | "contract"

export function EditorLayout({ documentType: initialType }: { documentType: DocumentType }) {
  const [activeTab, setActiveTab] = useState<DocumentType>(initialType)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const docId = searchParams.get("id")
  const { user } = useAuth()
  
  // Use a ref to store the current docId to avoid stale closures in auto-save
  const currentDocId = useRef<string | null>(docId)

  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companyAddress: "",
    companyPhone: "",
    bankName: "",
    accountNumber: "",
    fpsId: "",
    paypalEmail: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    items: [{ description: "", subItems: [], quantity: 1, unitPrice: 0 }] as Array<{
      description: string
      subItems?: string[]
      quantity: number
      unitPrice: number
    }>,
    notes: "",
    logo: null as string | null,
    signature: null as string | null,
    stamp: null as string | null,
    contractTerms: "",
    paymentTerms: "",
    deliveryDate: "",
    paymentStatus: createPaymentStatus() as PaymentStatus,
    languageMode: "bilingual" as "bilingual" | "english" | "chinese",
    logoPosition: "left" as "left" | "center" | "right",
    logoWidth: 128,
    templateId: "standard" as "standard" | "corporate" | "modern",
    signatureOffset: { x: 0, y: 0 },
    stampOffset: { x: 0, y: 0 },
  })

  // Load document or default settings
  useEffect(() => {
    async function initEditor() {
      if (docId) {
        const doc = await documentStorage.getDocument(docId)
        if (doc) {
          setFormData({
            companyName: doc.content?.companyName || "",
            companyEmail: doc.content?.companyEmail || "",
            companyAddress: doc.content?.companyAddress || "",
            clientName: doc.client_name || "",
            clientEmail: doc.client_email || "",
            clientAddress: doc.client_address || "",
            items: doc.content?.items || [{ description: "", quantity: 1, unitPrice: 0 }],
            notes: doc.content?.notes || "",
            logo: doc.content?.logo || null,
            signature: doc.signature_url || null,
            stamp: doc.content?.stamp || null,
            contractTerms: doc.content?.contractTerms || "",
            paymentTerms: doc.content?.paymentTerms || "",
            deliveryDate: doc.content?.deliveryDate || "",
            paymentStatus: createPaymentStatus(doc.status as any) as PaymentStatus,
            languageMode: doc.content?.languageMode || "bilingual",
            logoPosition: doc.content?.logoPosition || "left",
            logoWidth: doc.content?.logoWidth || 128,
            templateId: doc.content?.templateId || "standard",
            signatureOffset: doc.content?.signatureOffset || { x: 0, y: 0 },
            stampOffset: doc.content?.stampOffset || { x: 0, y: 0 },
          })
          setActiveTab(doc.doc_type)
          currentDocId.current = doc.id
        }
      } else if (user) {
        try {
          const { data: settings } = await supabase
            .from('company_settings')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (settings) {
            setFormData(prev => ({
              ...prev,
              companyName: settings.company_name || "",
              companyEmail: settings.company_email || "",
              companyAddress: settings.company_address || "",
              companyPhone: settings.company_phone || "",
              bankName: settings.bank_name || "",
              accountNumber: settings.account_number || "",
              fpsId: settings.fps_id || "",
              paypalEmail: settings.paypal_email || "",
              paymentTerms: settings.default_payment_notes || "",
              contractTerms: settings.default_contract_terms || "",
              notes: settings.default_invoice_notes || "",
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

  const handleSave = useCallback(async (isAuto = false) => {
    if (!user) return

    if (!isAuto) setIsSaving(true)
    
    try {
      const docData = {
        id: currentDocId.current || undefined,
        user_id: user.id,
        doc_type: activeTab,
        status: formData.paymentStatus.status === 'paid' ? 'paid' : 'draft',
        title: formData.clientName ? `${activeTab.toUpperCase()} - ${formData.clientName}` : `Untitled ${activeTab}`,
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        client_address: formData.clientAddress,
        content: {
          companyName: formData.companyName,
          companyEmail: formData.companyEmail,
          companyAddress: formData.companyAddress,
          companyPhone: formData.companyPhone,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          fpsId: formData.fpsId,
          paypalEmail: formData.paypalEmail,
          items: formData.items,
          notes: formData.notes,
          contractTerms: formData.contractTerms,
          paymentTerms: formData.paymentTerms,
          deliveryDate: formData.deliveryDate,
          languageMode: formData.languageMode,
          logoPosition: formData.logoPosition,
          logoWidth: formData.logoWidth,
          templateId: formData.templateId,
          signatureOffset: formData.signatureOffset,
          stampOffset: formData.stampOffset,
          logo: formData.logo,
          stamp: formData.stamp,
        },
        signature_url: formData.signature || undefined,
      }

      const savedDoc = await documentStorage.saveDocument(docData)
      if (savedDoc) {
        setLastSaved(new Date())
        if (!currentDocId.current) {
          currentDocId.current = savedDoc.id
          router.replace(`/editor?type=${activeTab}&id=${savedDoc.id}`, { scroll: false })
        }
        if (!isAuto) toast.success("Document saved successfully!")
      }
    } catch (error) {
      console.error(error)
      if (!isAuto) toast.error("Failed to save document")
    } finally {
      if (!isAuto) setIsSaving(false)
    }
  }, [user, activeTab, formData, router])

  // Auto-save logic
  useEffect(() => {
    if (!user || loading) return

    const timer = setTimeout(() => {
      handleSave(true)
    }, 5000) // Auto-save every 5 seconds after last change

    return () => clearTimeout(timer)
  }, [formData, handleSave, user, loading])

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
      <EditorHeader 
        documentType={activeTab} 
        onSave={() => handleSave(false)} 
        isSaving={isSaving} 
        lastSaved={lastSaved}
      />

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
