"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { EditorTabs } from "./editor-tabs"
import { DocumentPreview } from "./document-preview"
import { EditorHeader } from "./editor-header"
import { AIAgentSidebar } from "./ai-agent-sidebar"
import { EditorForm } from "./editor-form"
import type { PaymentStatus } from "@/lib/payment-utils"
import { createPaymentStatus } from "@/lib/payment-utils"
import { useSearchParams, useRouter } from "next/navigation"
import { documentStorage } from "@/lib/document-storage"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { Loader2, Sparkles, Layout, FileSearch } from "lucide-react"
import { useLanguage, type Language } from "@/lib/language-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type DocumentType = "quotation" | "invoice" | "receipt" | "contract"

export function EditorLayout({ documentType: initialType }: { documentType: DocumentType }) {
  const [activeTab, setActiveTab] = useState<DocumentType>(initialType)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [focusedField, setFocusedField] = useState<{ id: string; name: string } | null>(null)
  const [sidebarMode, setSidebarMode] = useState<'ai' | 'form'>('ai')
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const docId = searchParams.get("id")
  const { user } = useAuth()
  const { t } = useLanguage()
  
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
    currency: "HKD",
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
      setLoading(true)
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
            currency: doc.content?.currency || "HKD",
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
            .from('kino.company_settings')
            .select('*')
            .eq('user_id', user.id)
            .single()

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
          ...formData,
          items: formData.items,
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
    }, 5000)

    return () => clearTimeout(timer)
  }, [formData, handleSave, user, loading])

  // Proactive Learning: Save new Clients and Items to LocalStorage
  const learnFromAI = useCallback((content: any) => {
    if (typeof window === 'undefined') return;

    if (content.clientName) {
      const savedClientsStr = localStorage.getItem('kino_clients');
      const clients = savedClientsStr ? JSON.parse(savedClientsStr) : [];
      const exists = clients.some((c: any) => c.name.toLowerCase() === content.clientName.toLowerCase());
      
      if (!exists) {
        const newClient = {
          id: crypto.randomUUID(),
          name: content.clientName,
          email: content.clientEmail || "",
          address: content.clientAddress || "",
          phone: "",
          status: "Active"
        };
        localStorage.setItem('kino_clients', JSON.stringify([newClient, ...clients]));
      }
    }

    if (content.items && Array.isArray(content.items)) {
      const savedItemsStr = localStorage.getItem('kino_items');
      const items = savedItemsStr ? JSON.parse(savedItemsStr) : [];
      
      content.items.forEach((newItem: any) => {
        if (newItem.description) {
          const exists = items.some((i: any) => i.name.toLowerCase() === newItem.description.toLowerCase());
          if (!exists) {
            const learnedItem = {
              id: crypto.randomUUID(),
              name: newItem.description,
              description: newItem.description,
              price: Number(newItem.unitPrice) || 0,
              unit: "Unit"
            };
            items.unshift(learnedItem);
          }
        }
      });
      localStorage.setItem('kino_items', JSON.stringify(items.slice(0, 100)));
    }
  }, []);

  const handleDocumentGenerated = (generatedContent: any) => {
    setFormData((prev) => {
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

      if (generatedContent.items && Array.isArray(generatedContent.items) && generatedContent.items.length > 0) {
        newData.items = generatedContent.items.map((item: any) => ({
          id: crypto.randomUUID(),
          description: item.description || "",
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          subItems: Array.isArray(item.subItems) ? item.subItems : []
        }));
      }

      return newData;
    });

    learnFromAI(generatedContent);
    toast.success(t("Document updated by AI!", "文件已由 AI 更新！"));
  }

  const handleFocusField = (fieldId: string) => {
    const fieldNames: Record<string, string> = {
      companyName: t("Company Name", "公司名稱"),
      companyAddress: t("Company Address", "公司地址"),
      clientName: t("Client Name", "客戶名稱"),
      clientAddress: t("Client Address", "客戶地址"),
      notes: t("Notes", "備註"),
      'items-section': t("Items List", "項目清單")
    }
    
    setFocusedField({ id: fieldId, name: fieldNames[fieldId] || fieldId })

    const element = document.getElementById(fieldId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.focus()
      element.classList.add('ring-4', 'ring-primary/30')
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-primary/30')
      }, 2000)
    }
  }

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev }
      if (field.includes('.')) {
        const parts = field.split('.')
        let current: any = newData
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i]
          if (Array.isArray(current) && !isNaN(parseInt(part))) {
            current = current[parseInt(part)]
          } else {
            current = current[part]
          }
        }
        const lastPart = parts[parts.length - 1]
        current[lastPart] = value
      } else {
        ;(newData as any)[field] = value
      }
      return newData
    })
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <EditorHeader 
        documentType={activeTab} 
        onSave={() => handleSave(false)} 
        isSaving={isSaving} 
        lastSaved={lastSaved}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Dynamic Workspace Panel */}
        <div className="w-[420px] border-r border-border bg-card/30 hidden md:flex flex-col h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative">
          
          {/* Panel Mode Switcher */}
          <div className="p-2 border-b border-border bg-muted/20 flex gap-1">
            <Button 
              variant={sidebarMode === 'ai' ? 'default' : 'ghost'} 
              size="sm" 
              className={cn("flex-1 h-9 rounded-[10px] gap-2 text-xs", sidebarMode === 'ai' ? "shadow-sm" : "text-muted-foreground")}
              onClick={() => setSidebarMode('ai')}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Assistant
            </Button>
            <Button 
              variant={sidebarMode === 'form' ? 'default' : 'ghost'} 
              size="sm" 
              className={cn("flex-1 h-9 rounded-[10px] gap-2 text-xs", sidebarMode === 'form' ? "shadow-sm" : "text-muted-foreground")}
              onClick={() => setSidebarMode('form')}
            >
              <Layout className="w-3.5 h-3.5" />
              Manual Edit
            </Button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {sidebarMode === 'ai' ? (
              <AIAgentSidebar 
                currentDocType={activeTab} 
                onDocumentGenerated={handleDocumentGenerated}
                initialContext={formData}
                focusedField={focusedField}
                onClearFocus={() => setFocusedField(null)}
                docId={docId}
              />
            ) : (
              <div className="h-full overflow-y-auto p-6 scrollbar-hide">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground">Manual Editor</h2>
                  <p className="text-xs text-muted-foreground mt-1">Structure your document details manually.</p>
                </div>
                <EditorForm 
                  documentType={activeTab} 
                  formData={formData} 
                  onChange={(data) => setFormData(data)} 
                  onFocusField={handleFocusField}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Document Preview (WYSIWYG) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/30 relative">
          <div className="border-b border-border bg-card/80 backdrop-blur z-10">
            <div className="max-w-4xl mx-auto px-6">
              <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-12 flex justify-center scrollbar-hide">
            <div className="a4-paper-container shadow-2xl transition-transform duration-300">
              {loading ? (
                <div className="w-[210mm] h-[297mm] bg-white rounded-sm shadow-xl flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                  <div className="text-center space-y-1">
                    <p className="font-bold text-foreground">Loading Document...</p>
                    <p className="text-xs text-muted-foreground">Fetching your latest data</p>
                  </div>
                </div>
              ) : (
                <DocumentPreview 
                  documentType={activeTab} 
                  formData={formData} 
                  onFieldChange={handleFieldChange}
                  onFieldClick={handleFocusField} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
