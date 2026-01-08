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
import { useLanguage, type Language } from "@/lib/language-context"

type DocumentType = "quotation" | "invoice" | "receipt" | "contract"

export function EditorLayout({ documentType: initialType }: { documentType: DocumentType }) {
  const [activeTab, setActiveTab] = useState<DocumentType>(initialType)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [agentOpen, setAgentOpen] = useState(false)
  const [agentExpanded, setAgentExpanded] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const docId = searchParams.get("id")
  const { user } = useAuth()
  const { t } = useLanguage()
  
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
    clientSignature: null as string | null,
    contractTerms: "",
    paymentTerms: "",
    deliveryDate: "",
    paymentStatus: createPaymentStatus() as PaymentStatus,
    languageMode: "single" as "single" | "bilingual",
    primaryLanguage: "en" as Language,
    secondaryLanguage: "zh-TW" as Language,
    logoPosition: "left" as "left" | "center" | "right",
    logoWidth: 128,
    templateId: "standard" as "standard" | "corporate" | "modern",
    signatureOffset: { x: 0, y: 0 },
    stampOffset: { x: 0, y: 0 },
    clientSignatureOffset: { x: 0, y: 0 },
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
            companyPhone: doc.content?.companyPhone || "",
            bankName: doc.content?.bankName || "",
            accountNumber: doc.content?.accountNumber || "",
            fpsId: doc.content?.fpsId || "",
            paypalEmail: doc.content?.paypalEmail || "",
            clientName: doc.client_name || "",
            clientEmail: doc.client_email || "",
            clientAddress: doc.client_address || "",
            items: doc.content?.items || [{ description: "", quantity: 1, unitPrice: 0 }],
            notes: doc.content?.notes || "",
            logo: doc.content?.logo || null,
            signature: doc.signature_url || null,
            stamp: doc.content?.stamp || null,
            clientSignature: doc.content?.clientSignature || null,
            contractTerms: doc.content?.contractTerms || "",
            paymentTerms: doc.content?.paymentTerms || "",
            deliveryDate: doc.content?.deliveryDate || "",
            paymentStatus: createPaymentStatus(doc.status as any) as PaymentStatus,
            languageMode: doc.content?.languageMode || "single",
            primaryLanguage: doc.content?.primaryLanguage || "en",
            secondaryLanguage: doc.content?.secondaryLanguage || "zh-TW",
            logoPosition: doc.content?.logoPosition || "left",
            logoWidth: doc.content?.logoWidth || 128,
            templateId: doc.content?.templateId || "standard",
            signatureOffset: doc.content?.signatureOffset || { x: 0, y: 0 },
            stampOffset: doc.content?.stampOffset || { x: 0, y: 0 },
            clientSignatureOffset: doc.content?.clientSignatureOffset || { x: 0, y: 0 },
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

          // Universal industry defaults
          const defaultPaymentTerms = "1. Payment is due within 15 days of issue date.\n2. Please include invoice number in payment description.\n3. Late payments may be subject to a 2% monthly interest fee."
          const defaultContractTerms = "1. Scope of Work: As detailed in the project description above.\n2. Timeline: Project will commence upon receipt of initial deposit.\n3. Confidentiality: Both parties agree to keep all project information confidential.\n4. Termination: Either party may terminate with 30 days written notice."
          const defaultNotes = "Thank you for choosing our services! We look forward to a successful collaboration."

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
              paymentTerms: settings.default_payment_notes || defaultPaymentTerms,
              contractTerms: settings.default_contract_terms || defaultContractTerms,
              notes: settings.default_invoice_notes || defaultNotes,
            }))
          } else {
            // Fallback to universal defaults if no settings found
            setFormData(prev => ({
              ...prev,
              paymentTerms: defaultPaymentTerms,
              contractTerms: defaultContractTerms,
              notes: defaultNotes,
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
          primaryLanguage: formData.primaryLanguage,
          secondaryLanguage: formData.secondaryLanguage,
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
    console.log("AI Generated Content Received:", JSON.stringify(generatedContent, null, 2));
    
    setFormData((prev) => {
      // Create a fresh object to ensure state update
      const newData = { ...prev };

      if (generatedContent.clientName) newData.clientName = generatedContent.clientName;
      if (generatedContent.clientEmail) newData.clientEmail = generatedContent.clientEmail;
      if (generatedContent.clientAddress) newData.clientAddress = generatedContent.clientAddress;
      if (generatedContent.notes) newData.notes = generatedContent.notes;
      if (generatedContent.contractTerms) newData.contractTerms = generatedContent.contractTerms;
      if (generatedContent.paymentTerms) newData.paymentTerms = generatedContent.paymentTerms;
      if (generatedContent.deliveryDate) newData.deliveryDate = generatedContent.deliveryDate;
      if (generatedContent.currency) newData.currency = generatedContent.currency;
      if (generatedContent.signature) newData.signature = generatedContent.signature;
      if (generatedContent.stamp) newData.stamp = generatedContent.stamp;
      if (generatedContent.clientSignature) newData.clientSignature = generatedContent.clientSignature;

      // Ensure items are updated correctly
      if (generatedContent.items && Array.isArray(generatedContent.items) && generatedContent.items.length > 0) {
        console.log("Updating items with:", generatedContent.items);
        newData.items = generatedContent.items.map((item: any) => ({
          id: crypto.randomUUID(), // Always give new items unique IDs
          description: item.description || "",
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          subItems: Array.isArray(item.subItems) ? item.subItems : []
        }));
      }

      return newData;
    });

    toast.success(t("Document updated by AI!", "文件已由 AI 更新！"));
  }

  const handlePaymentStatusChange = (newStatus: PaymentStatus) => {
    setFormData((prev) => ({
      ...prev,
      paymentStatus: newStatus,
    }))
  }

  const totalAmount = formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const handleFocusField = (fieldId: string) => {
    const element = document.getElementById(fieldId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.focus()
      // Add a brief highlight effect
      element.classList.add('ring-4', 'ring-yellow-400', 'ring-opacity-50')
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-yellow-400', 'ring-opacity-50')
      }, 2000)
    }
  }

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

      <main className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area - Slides left when agent opens */}
        <div 
          className={`flex-1 overflow-hidden transition-all duration-500 ease-in-out ${
            agentOpen 
              ? agentExpanded ? 'mr-[500px]' : 'mr-[400px]' 
              : 'mr-0'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Left: Form */}
            <div className="overflow-y-auto bg-white border-r border-gray-100 p-6 lg:p-10 scrollbar-hide">
              <div className="max-w-2xl mx-auto space-y-6">
                 {(activeTab === "invoice" || activeTab === "receipt") && (
                  <PaymentStatusUI
                    documentType={activeTab}
                    currentStatus={formData.paymentStatus}
                    onStatusChange={handlePaymentStatusChange}
                    totalAmount={totalAmount}
                  />
                )}
                <EditorForm documentType={activeTab} formData={formData} onChange={setFormData} onFocusField={handleFocusField} />
              </div>
            </div>

            {/* Right: Preview - A4 Format */}
            <div className="overflow-y-auto bg-gray-50/50 p-8 flex justify-center relative" id="document-preview-container">
               <div className="absolute top-4 right-4 z-10">
                  <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 shadow-sm border border-gray-100">
                    Live Preview
                  </div>
               </div>
              <div className="a4-paper-container shadow-2xl">
                <DocumentPreview documentType={activeTab} formData={formData} onFieldClick={handleFocusField} />
              </div>
            </div>
          </div>
        </div>

        {/* AI Agent Sidebar - Slides in from right */}
        <AIAgentSidebar 
          currentDocType={activeTab} 
          onDocumentGenerated={handleDocumentGenerated}
          isOpen={agentOpen}
          onToggle={(val) => setAgentOpen(val)}
          onExpandChange={setAgentExpanded}
          initialContext={formData}
          docId={docId}
        />
      </main>
    </div>
  )
}
