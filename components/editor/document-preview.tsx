"use client"

import React, { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import type { PaymentStatus } from "@/lib/payment-utils"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Building2, User, Pen } from 'lucide-react'

type DocumentType = "quotation" | "invoice" | "receipt" | "contract"
type LanguageMode = "bilingual" | "english" | "chinese"

interface FormDataType {
  // Company info (can override profile defaults)
  companyName?: string
  companyEmail?: string
  companyAddress?: string
  companyPhone?: string
  bankName?: string
  accountNumber?: string
  fpsId?: string
  paypalEmail?: string
  // Client info
  clientName: string
  clientEmail: string
  clientAddress: string
  // Document content
  items: Array<{ 
    description: string
    subItems?: string[]
    quantity: number
    unitPrice: number 
  }>
  notes: string
  // Assets
  logo: string | null
  signature: string | null
  stamp: string | null
  // Contract specific
  contractTerms: string
  paymentTerms: string
  deliveryDate: string
  paymentStatus?: PaymentStatus
  // Display settings
  languageMode?: LanguageMode
  logoPosition?: "left" | "center" | "right"
  logoWidth?: number
  templateId?: "standard" | "corporate" | "modern"
  // Asset positioning
  signatureOffset?: { x: number; y: number }
  stampOffset?: { x: number; y: number }
}

interface DocumentPreviewProps {
  documentType: DocumentType
  formData: FormDataType
  onFieldClick?: (fieldId: string) => void
}

export function DocumentPreview({ documentType, formData, onFieldClick }: DocumentPreviewProps) {
  const { user } = useAuth()
  const [companySettings, setCompanySettings] = useState<any>(null)
  const totalAmount = formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const paymentStatus = formData.paymentStatus
  const languageMode = formData.languageMode || "bilingual"
  const logoPosition = formData.logoPosition || "left"
  const logoWidth = formData.logoWidth || 128
  const templateId = formData.templateId || "standard"
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    async function fetchSettings() {
      if (user) {
        const { data } = await supabase
          .from('company_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()
        if (data) setCompanySettings(data)
      }
    }
    fetchSettings()
  }, [user])

  const t = (en: string, zh: string) => {
    if (languageMode === "english") return en
    if (languageMode === "chinese") return zh
    return `${en} | ${zh}`
  }

  const getDocumentTitle = () => {
    switch (documentType) {
      case "quotation":
        return { en: "QUOTATION", zh: "報價單" }
      case "invoice":
        return { en: "INVOICE", zh: "發票" }
      case "receipt":
        return { en: "OFFICIAL RECEIPT", zh: "正式收據" }
      case "contract":
        return { en: "CONTRACT", zh: "合約" }
      default:
        return { en: "DOCUMENT", zh: "文件" }
    }
  }

  const title = getDocumentTitle() || { en: "DOCUMENT", zh: "文件" }

  const isPaidReceipt = documentType === "receipt" && paymentStatus?.status === "paid"
  const isVoidedReceipt = documentType === "receipt" && paymentStatus?.status === "voided"

  const StatusBadge = () => {
    if (!paymentStatus || documentType === "quotation" || documentType === "contract") return null
    
    return (
      <div className="absolute top-8 right-8 z-20">
        <div className={`px-4 py-1.5 rounded-full border-2 font-bold text-xs tracking-widest uppercase rotate-12 shadow-sm ${
          paymentStatus.status === 'paid' 
            ? 'bg-green-50 border-green-600 text-green-600' 
            : paymentStatus.status === 'voided'
            ? 'bg-red-50 border-red-600 text-red-600'
            : 'bg-orange-50 border-orange-600 text-orange-600'
        }`}>
          {paymentStatus.status}
        </div>
      </div>
    )
  }

  // Styles based on Template
  const styles = {
    standard: {
      card: "bg-white text-black p-8 min-h-[800px] shadow-lg border-border/50 sticky top-0 relative",
      header: "border-b-2 border-gray-800 pb-6 mb-8",
      accentLine: "border-t-2 border-gray-800",
      itemRow: "border-b border-gray-300",
      sectionHeader: "font-bold text-gray-900 mb-2 uppercase tracking-tight border-b border-gray-200 pb-1"
    },
    corporate: {
      card: "bg-white text-black p-10 min-h-[842px] shadow-lg border-t-8 border-[#1a1f36] sticky top-0 relative",
      header: "flex justify-between items-start mb-12",
      accentLine: "border-t border-gray-400",
      itemRow: "border-b border-gray-100",
      sectionHeader: "bg-gray-50 px-2 py-1 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3"
    },
    modern: {
      card: "bg-white text-black p-8 min-h-[800px] shadow-lg sticky top-0 relative overflow-hidden",
      header: "flex justify-between items-center mb-8 bg-[#6366f1]/5 -mx-8 px-8 py-6 border-b border-[#6366f1]/10",
      accentLine: "border-t-2 border-[#6366f1]",
      itemRow: "border-b border-slate-50",
      sectionHeader: "text-[#6366f1] text-[12px] font-black uppercase tracking-tighter mb-2"
    }
  }[templateId]

  const DocumentWrapper = ({ children }: { children: React.ReactNode }) => (
    <Card id="document-preview-card" className={`${styles.card} ${
      isPaidReceipt || isVoidedReceipt ? "bg-gradient-to-br from-white to-slate-50" : ""
    }`}>
      {templateId === 'modern' && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366f1]/10 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />
      )}
      {isPaidReceipt && (
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
          <div className="text-8xl font-bold text-green-700 transform -rotate-45">PAID</div>
        </div>
      )}
      {isVoidedReceipt && (
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
          <div className="text-8xl font-bold text-red-700 transform -rotate-45">VOID</div>
        </div>
      )}
      <div className="max-w-full text-sm leading-relaxed relative z-10">
        {children}
      </div>
    </Card>
  )

  const Header = () => {
    const Logo = () => (
      <div 
        className={`flex ${
          logoPosition === "center" ? "justify-center" : 
          logoPosition === "right" ? "justify-end" : "justify-start"
        } cursor-pointer hover:ring-2 hover:ring-[#6366f1] rounded p-1 transition-all group relative min-h-[60px] min-w-[120px]`}
        onClick={() => document.getElementById('logo-upload')?.click()}
      >
        <div className="absolute inset-0 bg-[#6366f1]/5 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded z-20">
          <span className="text-[10px] font-bold text-[#6366f1]">CLICK TO UPLOAD</span>
        </div>
        {formData.logo ? (
          <img 
            src={formData.logo} 
            alt="Logo" 
            style={{ width: `${logoWidth}px` }} 
            className="h-auto object-contain rounded" 
            crossOrigin="anonymous"
          />
        ) : (companySettings?.logo_url && !companySettings.logo_url.includes('kino')) ? (
          <img 
            src={companySettings.logo_url} 
            alt="Company Logo" 
            style={{ width: `${logoWidth}px` }} 
            className="h-auto object-contain rounded" 
            crossOrigin="anonymous"
          />
        ) : (
          <div className={`flex flex-col items-${logoPosition === 'center' ? 'center' : logoPosition === 'right' ? 'end' : 'start'} border-2 border-dashed border-gray-200 p-4 rounded bg-gray-50/50 w-full`}>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {t("UPLOAD LOGO", "點擊上傳標誌")}
            </div>
          </div>
        )}
      </div>
    )

    const Title = () => {
      const docNumber = `${documentType === "quotation" ? "QT" : 
                           documentType === "contract" ? "CTR" :
                           documentType === "invoice" ? "INV" : "RC"}-${currentYear}001`
      const currentDate = new Date().toISOString().split('T')[0]
      const validUntilDate = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]

      return (
        <div className="text-right">
          <div className="flex flex-col gap-1 items-end">
            <h1 className={`font-bold ${templateId === 'modern' ? 'text-4xl text-[#1a1f36]' : 'text-3xl text-gray-900'}`}>
              {languageMode === "chinese" ? title.zh : title.en}
            </h1>
            {languageMode === "bilingual" && (
              <h1 className={`font-bold ${templateId === 'modern' ? 'text-2xl text-gray-400' : 'text-xl text-gray-700'}`}>
                {title.zh}
              </h1>
            )}
            
            <div className="mt-4 space-y-1 text-right">
              <div className="flex justify-end items-center gap-4 text-[11px]">
                <span className="font-bold text-gray-900 uppercase tracking-wide">
                  {documentType === "quotation" || documentType === "contract" ? 
                    (languageMode === "chinese" ? "報價單號" : "QUOTATION NO.") : 
                   documentType === "invoice" ? 
                    (languageMode === "chinese" ? "發票號碼" : "INVOICE NO.") : 
                    (languageMode === "chinese" ? "收據號碼" : "RECEIPT NO.")}
                </span>
                <span className="font-mono text-gray-600">{docNumber}</span>
              </div>
              
              <div className="flex justify-end items-center gap-4 text-[11px]">
                <span className="font-bold text-gray-900 uppercase tracking-wide">
                  {languageMode === "chinese" ? "日期" : "DATE"}
                </span>
                <span className="font-mono text-gray-600">{currentDate}</span>
              </div>

              {(documentType === "quotation" || documentType === "contract") && (
                <div className="flex justify-end items-center gap-4 text-[11px]">
                  <span className="font-bold text-gray-900 uppercase tracking-wide">
                    {languageMode === "chinese" ? "有效期至" : "VALID UNTIL"}
                  </span>
                  <span className="font-mono text-gray-600">{validUntilDate}</span>
                </div>
              )}

              {documentType === "receipt" && (
                <div className="flex justify-end items-center gap-4 text-[11px]">
                  <span className="font-bold text-gray-900 uppercase tracking-wide">
                    {languageMode === "chinese" ? "關聯發票" : "REF. INVOICE"}
                  </span>
                  <span className="font-mono text-gray-600">INV-{currentYear}001</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    if (templateId === 'corporate') {
      return (
        <div className="mb-12">
          <div className="flex justify-between items-start mb-8">
            <Logo />
            <Title />
          </div>
          <div className={styles.accentLine} />
        </div>
      )
    }

    return (
      <div className={styles.header}>
        <div className={`flex flex-col md:flex-row justify-between items-start gap-6 w-full`}>
          <div className={`w-full md:w-auto ${logoPosition !== "left" ? "order-2 md:order-1" : ""}`}>
            <Logo />
          </div>
          <div className={`w-full md:w-auto ${logoPosition === "left" ? "order-1 md:order-2" : "order-1"}`}>
            <Title />
          </div>
        </div>
      </div>
    )
  }

  const PartiesInfo = () => {
    // Use formData overrides if available, otherwise fall back to company settings
    const displayCompanyName = formData.companyName || companySettings?.company_name || t("[Your Company Name]", "[您的公司名稱]")
    const displayCompanyAddress = formData.companyAddress || companySettings?.company_address || t("[Your Business Address]", "[您的公司地址]")
    const displayCompanyEmail = formData.companyEmail || companySettings?.company_email || t("[company@example.com]", "[公司電郵]")

    return (
      <div className={`grid grid-cols-2 gap-12 mb-10 ${templateId === 'modern' ? 'bg-slate-50/50 p-6 rounded-2xl border border-slate-100' : ''}`}>
        <div 
          className="text-xs space-y-1 cursor-pointer hover:bg-yellow-50 rounded p-2 transition-all border-2 border-transparent hover:border-yellow-200"
          onClick={() => onFieldClick?.('companyAddress')}
        >
          <p className="text-yellow-600 font-bold mb-1 uppercase tracking-widest text-[10px] border-b border-yellow-100 pb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" /> {t("FROM", "發件人")}
          </p>
          <p className="font-black text-gray-900 uppercase text-sm">
            {displayCompanyName}
          </p>
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
            {displayCompanyAddress}
          </p>
        </div>
        <div 
          className="text-xs space-y-1 cursor-pointer hover:bg-yellow-50 rounded p-2 transition-all border-2 border-transparent hover:border-yellow-200"
          onClick={() => onFieldClick?.('clientAddress')}
        >
          <p className="text-yellow-600 font-bold mb-1 uppercase tracking-widest text-[10px] border-b border-yellow-100 pb-1 flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> {documentType === "receipt" ? t("RECEIVED FROM", "茲收到") : t("BILL TO", "致")}
          </p>
          <p className="font-black text-[14px] text-gray-900 mt-2">{formData.clientName || t("[Client Name]", "[客戶名稱]")}</p>
          <p className="text-gray-600 break-words leading-relaxed">{formData.clientAddress || t("[Client Address]", "[客戶地址]")}</p>
        </div>
      </div>
    )
  }

  const TermsAndConditions = () => {
    if (documentType !== "quotation" && documentType !== "contract") return null

    const terms = documentType === "contract" ? formData.contractTerms : formData.paymentTerms

    return (
      <div 
        className="mt-10 pt-6 border-t border-gray-200 cursor-pointer hover:bg-yellow-50 rounded p-1 transition-all"
        onClick={() => onFieldClick?.('contractTerms')}
      >
        <p className="font-bold text-xs text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1">
          <Pen className="w-3 h-3 text-yellow-500" /> {t("TERMS & CONDITIONS /", "條款及細則")}
        </p>
        <div className="text-[10px] text-gray-600 space-y-2 leading-relaxed">
          {terms ? (
            <div className="whitespace-pre-wrap">{terms}</div>
          ) : (
            <ul className="list-disc pl-4 space-y-1">
              <li>{t("Validity: This quotation is valid for 30 days from the date of issue.", "有效期：本報價單自發出之日起 30 天內有效。")}</li>
              <li>{t("Payment Terms: Full payment is required before service delivery.", "付款條款：服務交付前需全額付款。")}</li>
              <li>{t("Confidentiality: All information in this document is confidential.", "保密協議：本文件中的所有信息均屬保密。")}</li>
            </ul>
          )}
        </div>
      </div>
    )
  }

  const ItemsTable = () => (
    <table className="w-full mb-6 cursor-pointer hover:bg-slate-50 transition-all rounded" onClick={() => onFieldClick?.('items-section')}>
      <thead>
        <tr className={templateId === 'corporate' ? 'bg-gray-100' : styles.accentLine}>
          <th className={`text-left py-2 font-bold text-xs ${templateId === 'corporate' ? 'px-2 text-gray-600' : 'text-gray-900'}`}>
            {t("Description", "描述")}
          </th>
          <th className={`text-right py-2 font-bold text-xs w-16 ${templateId === 'corporate' ? 'px-2 text-gray-600' : 'text-gray-900'}`}>
            {t("Qty", "數量")}
          </th>
          <th className={`text-right py-2 font-bold text-xs w-20 ${templateId === 'corporate' ? 'px-2 text-gray-600' : 'text-gray-900'}`}>
            {languageMode === "chinese" ? "單價" : "Unit Price"}
          </th>
          <th className={`text-right py-2 font-bold text-xs w-20 ${templateId === 'corporate' ? 'px-2 text-gray-600' : 'text-gray-900'}`}>
            {languageMode === "chinese" ? "金額" : "Amount"}
          </th>
        </tr>
      </thead>
      <tbody className={templateId === 'corporate' ? 'border-b border-gray-400' : ''}>
        {formData.items.map((item, index) => (
          <React.Fragment key={index}>
            <tr className={styles.itemRow}>
              <td className={`py-3 text-xs ${templateId === 'corporate' ? 'px-2 font-semibold' : 'text-gray-900 font-semibold'}`}>
                {item.description || "—"}
              </td>
              <td className={`text-right py-3 text-xs ${templateId === 'corporate' ? 'px-2' : 'text-gray-800'}`}>{item.quantity}</td>
              <td className={`text-right py-3 text-xs ${templateId === 'corporate' ? 'px-2' : 'text-gray-800'}`}>${item.unitPrice.toFixed(2)}</td>
              <td className={`text-right py-3 font-semibold text-xs ${templateId === 'corporate' ? 'px-2' : 'text-gray-900'}`}>
                ${(item.quantity * item.unitPrice).toFixed(2)}
              </td>
            </tr>
            {item.subItems && item.subItems.length > 0 && item.subItems.map((subItem, subIndex) => (
              <tr key={`${index}-sub-${subIndex}`} className="border-none">
                <td colSpan={4} className={`py-1 text-[10px] text-gray-500 italic ${templateId === 'corporate' ? 'px-2 pl-6' : 'pl-4'}`}>
                  • {subItem}
                </td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  )

  const PaymentMethods = () => {
    // Use formData values first (user override), then fall back to company settings
    const bankName = formData.bankName || companySettings?.bank_name
    const accountNumber = formData.accountNumber || companySettings?.account_number
    const fpsId = formData.fpsId || companySettings?.fps_id
    const paypalEmail = formData.paypalEmail || companySettings?.paypal_email

    return (documentType === "invoice" || documentType === "receipt") && (
      <div className={`mb-8 py-4 ${templateId === 'modern' ? 'bg-[#6366f1]/5 rounded-2xl p-6 border-none' : 'border-t border-b border-gray-200'}`}>
        <p className={styles.sectionHeader}>
          {t("Payment Methods", "付款方式")}
        </p>
        <div className="grid grid-cols-2 gap-4 text-xs">
          {bankName && accountNumber && (
            <div className={`${templateId === 'modern' ? '' : 'border-l-2 border-gray-100 pl-4'}`}>
              <p className="font-bold text-gray-800 mb-1">{t("Bank Transfer", "銀行轉賬")}</p>
              <p className="text-gray-600">{languageMode === "chinese" ? "銀行: " : "Bank: "}{bankName}</p>
              <p className="text-gray-600">{languageMode === "chinese" ? "賬號: " : "Account: "}{accountNumber}</p>
            </div>
          )}
          {fpsId && (
            <div className={`${templateId === 'modern' ? '' : 'border-l-2 border-gray-100 pl-4'}`}>
              <p className="font-bold text-gray-800 mb-1">{t("FPS", "快速支付系統 (FPS)")}</p>
              <p className="text-gray-600">ID: {fpsId}</p>
            </div>
          )}
          {paypalEmail && (
            <div className={`${templateId === 'modern' ? '' : 'border-l-2 border-gray-100 pl-4'}`}>
              <p className="font-bold text-gray-800 mb-1">PayPal</p>
              <p className="text-gray-600">{paypalEmail}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const Footer = () => {
    // 1. Quotation & Invoice usually don't need signatures
    if (documentType === "quotation" || documentType === "invoice") {
      return (
        <div className="mt-12 text-center pt-8 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 italic">
            {t("Thank you for your business!", "多謝惠顧！")}
          </p>
          <p className="text-[10px] text-gray-300 mt-2">
            {t("End of Document", "文件完")}
          </p>
        </div>
      )
    }

    // 2. Receipt needs Company Signature & Stamp
    if (documentType === "receipt") {
      const stampX = formData.stampOffset?.x || 0
      const stampY = formData.stampOffset?.y || 0
      const sigX = formData.signatureOffset?.x || 0
      const sigY = formData.signatureOffset?.y || 0

      return (
        <div className="pt-8 mt-8 border-t-2 border-gray-800">
          <div className="flex justify-end">
            <div className="relative flex flex-col items-center min-w-[240px]">
              <div className="h-28 flex items-center justify-center relative w-full mb-2">
                {/* Stamp - Absolute positioned behind/next to signature */}
                <div 
                  className="absolute right-4 top-0 opacity-80"
                  style={{ transform: `translate(${stampX}px, ${stampY}px)` }}
                >
                  {formData.stamp ? (
                    <img src={formData.stamp} alt="Stamp" className="h-24 w-24 object-contain" crossOrigin="anonymous" />
                  ) : companySettings?.stamp_url && (
                    <img src={companySettings.stamp_url} alt="Company Stamp" className="h-24 w-24 object-contain" crossOrigin="anonymous" />
                  )}
                </div>
                {/* Signature */}
                <div 
                  className="z-10"
                  style={{ transform: `translate(${sigX}px, ${sigY}px)` }}
                >
                  {formData.signature ? (
                    <img src={formData.signature} alt="Signature" className="h-20 w-48 object-contain" crossOrigin="anonymous" />
                  ) : companySettings?.signature_url && (
                    <img src={companySettings.signature_url} alt="Signature" className="h-20 w-48 object-contain" crossOrigin="anonymous" />
                  )}
                </div>
              </div>
              <div className="w-full border-t border-gray-900 pt-2 text-center">
                <p className="font-bold text-[11px] uppercase tracking-tight text-gray-900">
                  {t("AUTHORIZED SIGNATURE & CHOP", "授權簽名及公司蓋章")}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center">
            <p className="text-[10px] text-gray-300 italic">{t("End of Document", "文件完")}</p>
          </div>
        </div>
      )
    }

    // 3. Contract needs Dual Signatures
    if (documentType === "contract") {
      const stampX = formData.stampOffset?.x || 0
      const stampY = formData.stampOffset?.y || 0
      const sigX = formData.signatureOffset?.x || 0
      const sigY = formData.signatureOffset?.y || 0

      return (
        <div className="pt-8 mt-12 border-t-2 border-gray-800">
          <div className="grid grid-cols-2 gap-12">
            {/* Client Side */}
            <div className="flex flex-col items-center">
              <div className="h-28 flex items-end justify-center mb-2 w-full">
                <div className="h-16 flex items-center justify-center text-gray-300 text-[10px] italic">
                  [{t("Client Signature & Date", "客戶簽署及日期")}]
                </div>
              </div>
              <div className="w-full border-t border-gray-900 pt-2 text-center">
                <p className="font-bold text-[10px] uppercase tracking-tight text-gray-900">
                  {t("ACCEPTED BY (CLIENT)", "客戶確認")}
                </p>
                <p className="text-[10px] text-gray-600 mt-1 truncate max-w-full">
                  {formData.clientName || t("Client Name", "客戶名稱")}
                </p>
              </div>
            </div>

            {/* Company Side */}
            <div className="flex flex-col items-center">
              <div className="h-28 flex items-center justify-center relative w-full mb-2">
                <div 
                  className="absolute right-0 top-0 opacity-80"
                  style={{ transform: `translate(${stampX}px, ${stampY}px)` }}
                >
                  {formData.stamp ? (
                    <img src={formData.stamp} alt="Stamp" className="h-24 w-24 object-contain" crossOrigin="anonymous" />
                  ) : companySettings?.stamp_url && (
                    <img src={companySettings.stamp_url} alt="Company Stamp" className="h-24 w-24 object-contain" crossOrigin="anonymous" />
                  )}
                </div>
                <div 
                  className="z-10"
                  style={{ transform: `translate(${sigX}px, ${sigY}px)` }}
                >
                  {formData.signature ? (
                    <img src={formData.signature} alt="Signature" className="h-20 w-48 object-contain" crossOrigin="anonymous" />
                  ) : companySettings?.signature_url && (
                    <img src={companySettings.signature_url} alt="Signature" className="h-20 w-48 object-contain" crossOrigin="anonymous" />
                  )}
                </div>
              </div>
              <div className="w-full border-t border-gray-900 pt-2 text-center">
                <p className="font-bold text-[10px] uppercase tracking-tight text-gray-900">
                  {t("ISSUED BY (COMPANY)", "發出人")}
                </p>
                <p className="text-[10px] text-gray-600 mt-1 truncate max-w-full">
                  {companySettings?.company_name || "[Your Company Name]"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center">
            <p className="text-[10px] text-gray-300 italic">{t("End of Document", "文件完")}</p>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <DocumentWrapper>
      <StatusBadge />
      <Header />
      <PartiesInfo />
      <ItemsTable />
      
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-1">
          {documentType !== "receipt" ? (
            <>
              <div className="flex justify-between py-1 text-xs">
                <span className="font-bold text-gray-900">{t("SUBTOTAL", "小計")}:</span>
                <span className="text-gray-900">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-xs">
                <span className="font-bold text-gray-900">{t("TAX / VAT (0%)", "稅額 (0%)")}:</span>
                <span className="text-gray-900">$0.00</span>
              </div>
              <div className={`flex justify-between py-2 font-bold text-gray-900 border-t-2 border-gray-800 mt-2 ${templateId === 'modern' ? 'text-[#6366f1] bg-[#6366f1]/5 px-3 rounded-lg border-none' : ''}`}>
                <span className="text-sm">{t("TOTAL", "總計")} (HKD):</span>
                <span className="text-sm">${totalAmount.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between py-1 text-xs">
                <span className="font-bold text-gray-900">{t("TOTAL PROJECT VALUE", "項目總額")}:</span>
                <span className="text-gray-900">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-xs">
                <span className="font-bold text-gray-900">{t("AMOUNT RECEIVED", "實收金額")}:</span>
                <span className="text-gray-900">${totalAmount.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between py-2 font-bold text-gray-900 border-t-2 border-gray-800 mt-2 ${templateId === 'modern' ? 'text-[#6366f1] bg-[#6366f1]/5 px-3 rounded-lg border-none' : ''}`}>
                <span className="text-sm">{t("BALANCE DUE", "剩餘款項")} (HKD):</span>
                <span className="text-sm">0.00</span>
              </div>
            </>
          )}
        </div>
      </div>

      {formData.notes && (
        <div className={`mb-6 pt-4 ${templateId === 'modern' ? 'border-none bg-slate-50 p-4 rounded-xl' : 'border-t border-gray-300'}`}>
          <p className={styles.sectionHeader}>{t("Notes", "備註")}:</p>
          <p className="text-xs text-gray-700 whitespace-pre-wrap">{formData.notes}</p>
        </div>
      )}

      <PaymentMethods />
      <TermsAndConditions />
      <Footer />
    </DocumentWrapper>
  )
}
