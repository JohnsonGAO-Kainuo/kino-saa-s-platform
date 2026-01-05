"use client"

import React, { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import type { PaymentStatus } from "@/lib/payment-utils"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

type DocumentType = "quotation" | "invoice" | "receipt" | "contract"
type LanguageMode = "bilingual" | "english" | "chinese"

interface FormDataType {
  clientName: string
  clientEmail: string
  clientAddress: string
  items: Array<{ description: string; quantity: number; unitPrice: number }>
  notes: string
  logo: File | null
  signature: string | null
  stamp: File | null
  contractTerms: string
  paymentTerms: string
  deliveryDate: string
  paymentStatus?: PaymentStatus
  languageMode?: LanguageMode
  logoPosition?: "left" | "center" | "right"
  logoWidth?: number
}

interface DocumentPreviewProps {
  documentType: DocumentType
  formData: FormDataType
}

export function DocumentPreview({ documentType, formData }: DocumentPreviewProps) {
  const { user } = useAuth()
  const [companySettings, setCompanySettings] = useState<any>(null)
  const totalAmount = formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const paymentStatus = formData.paymentStatus
  const languageMode = formData.languageMode || "bilingual"
  const logoPosition = formData.logoPosition || "left"
  const logoWidth = formData.logoWidth || 128
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
        return { en: "RECEIPT", zh: "收據" }
      case "contract":
        return { en: "SERVICE AGREEMENT", zh: "服務協議" }
    }
  }

  const title = getDocumentTitle()
  const logoUrl = formData.logo ? URL.createObjectURL(formData.logo) : null

  const isPaidReceipt = documentType === "receipt" && paymentStatus?.status === "paid"
  const isVoidedReceipt = documentType === "receipt" && paymentStatus?.status === "voided"

  // Base layout wrapper
  const DocumentWrapper = ({ children }: { children: React.ReactNode }) => (
    <Card className={`bg-white text-black p-8 min-h-[800px] shadow-lg border-border/50 sticky top-0 relative ${
      isPaidReceipt || isVoidedReceipt ? "bg-gradient-to-br from-white to-slate-50" : ""
    }`}>
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

  const Header = () => (
    <div className="border-b-2 border-gray-800 pb-6 mb-8">
      <div className={`flex flex-col md:flex-row justify-between items-start gap-6`}>
        <div className={`w-full md:w-auto flex ${
          logoPosition === "center" ? "justify-center" : 
          logoPosition === "right" ? "justify-end" : "justify-start"
        } ${logoPosition !== "left" ? "order-2 md:order-1" : ""}`}>
          {formData.logo ? (
            <img src={formData.logo} alt="Logo" style={{ width: `${logoWidth}px` }} className="h-auto object-contain rounded" />
          ) : companySettings?.logo_url ? (
            <img src={companySettings.logo_url} alt="Company Logo" style={{ width: `${logoWidth}px` }} className="h-auto object-contain rounded" />
          ) : (
            <div className="text-2xl font-bold text-gray-800 tracking-tight uppercase">
              {companySettings?.company_name || "KINO"}
            </div>
          )}
        </div>
        <div className={`w-full md:w-auto text-right ${logoPosition === "left" ? "order-1 md:order-2" : "order-1"}`}>
          <div className="flex flex-col gap-1 items-end">
            <h1 className="text-3xl font-bold text-gray-900">
              {languageMode === "chinese" ? title.zh : title.en}
            </h1>
            {languageMode === "bilingual" && (
              <h1 className="text-xl font-bold text-gray-700">{title.zh}</h1>
            )}
            <p className="text-xs text-gray-600 mt-1 font-mono">#{currentYear}-001</p>
          </div>
        </div>
      </div>
    </div>
  )

  const PartiesInfo = () => (
    <div className="grid grid-cols-2 gap-12 mb-10">
      <div className="text-xs space-y-1">
        <p className="font-bold text-gray-900 mb-2 uppercase tracking-tight border-b border-gray-200 pb-1">
          {t("From:", "發自:")}
        </p>
        <p className="font-bold text-[14px] text-gray-900">
          {companySettings?.company_name || t("Your Company Name", "您的公司名稱")}
        </p>
        <p className="text-gray-600 whitespace-pre-wrap">
          {companySettings?.company_address || t("123 Business Street\nCity, State 12345", "公司詳細地址\n城市，地區 12345")}
        </p>
        <p className="text-gray-600">
          {companySettings?.company_email || "company@example.com"}
        </p>
      </div>
      <div className="text-xs space-y-1">
        <p className="font-bold text-gray-900 mb-2 uppercase tracking-tight border-b border-gray-200 pb-1">
          {t("To:", "收票人:")}
        </p>
        <p className="font-bold text-[14px] text-gray-900">{formData.clientName || t("Client Name", "客戶名稱")}</p>
        <p className="text-gray-600 break-words">{formData.clientAddress || t("Address", "客戶地址")}</p>
        <p className="text-gray-600">{formData.clientEmail || t("Email", "電子郵件")}</p>
      </div>
    </div>
  )

  const StatusBadge = () => (
    (documentType === "invoice" || documentType === "receipt") && paymentStatus && (
      <div className="absolute top-24 right-8 z-20">
        <div
          className={`px-4 py-1.5 border-2 rounded text-sm font-bold uppercase tracking-widest transform rotate-12 ${
            paymentStatus.status === "paid"
              ? "text-green-600 border-green-600 bg-white"
              : paymentStatus.status === "voided"
                ? "text-red-600 border-red-600 bg-white"
                : "text-amber-600 border-amber-600 bg-white"
          }`}
          style={{ boxShadow: '0 0 0 1px white inset' }}
        >
          {paymentStatus.status === "paid" && t("Paid", "已付")}
          {paymentStatus.status === "voided" && t("Voided", "作廢")}
          {paymentStatus.status === "unpaid" && t("Unpaid", "待付")}
          {paymentStatus.status === "pending" && t("Pending", "待填")}
        </div>
      </div>
    )
  )

  const ItemsTable = () => (
    <table className="w-full mb-6">
      <thead>
        <tr className="border-t-2 border-b-2 border-gray-800">
          <th className="text-left py-2 font-bold text-gray-900 text-xs">
            {t("Description", "描述")}
          </th>
          <th className="text-right py-2 font-bold text-gray-900 text-xs w-16">
            {t("Qty", "數量")}
          </th>
          <th className="text-right py-2 font-bold text-gray-900 text-xs w-20">
            {languageMode === "chinese" ? "單價" : "Unit Price"}
          </th>
          <th className="text-right py-2 font-bold text-gray-900 text-xs w-20">
            {languageMode === "chinese" ? "金額" : "Amount"}
          </th>
        </tr>
      </thead>
      <tbody>
        {formData.items.map((item, index) => (
          <tr key={index} className="border-b border-gray-300">
            <td className="py-3 text-gray-800 text-xs">{item.description || "—"}</td>
            <td className="text-right py-3 text-gray-800 text-xs">{item.quantity}</td>
            <td className="text-right py-3 text-gray-800 text-xs">${item.unitPrice.toFixed(2)}</td>
            <td className="text-right py-3 font-semibold text-gray-900 text-xs">
              ${(item.quantity * item.unitPrice).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  const PaymentMethods = () => (
    (documentType === "invoice" || documentType === "receipt") && (
      <div className="mb-8 p-0 border-t border-b border-gray-200 py-4">
        <p className="font-bold text-gray-900 mb-4 text-[13px] uppercase tracking-tight">
          {t("Payment Methods", "付款方式")}
        </p>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="border-l-2 border-gray-100 pl-4">
            <p className="font-bold text-gray-800 mb-1">{t("Bank Transfer", "銀行轉賬")}</p>
            <p className="text-gray-600">{languageMode === "chinese" ? "銀行: " : "Bank: "}{companySettings?.bank_name || 'HSBC Hong Kong'}</p>
            <p className="text-gray-600">{languageMode === "chinese" ? "賬號: " : "Account: "}{companySettings?.account_number || '123-456789-012'}</p>
            {companySettings?.swift_code && <p className="text-gray-600">SWIFT: {companySettings.swift_code}</p>}
          </div>
          <div className="border-l-2 border-gray-100 pl-4">
            <p className="font-bold text-gray-800 mb-1">{t("FPS", "快速支付系統 (FPS)")}</p>
            <p className="text-gray-600">ID: {companySettings?.fps_id || '123456789@hkicbc'}</p>
          </div>
        </div>
      </div>
    )
  )

  const Footer = () => (
    <div className="pt-6 border-t-2 border-gray-800">
      <div className="grid grid-cols-2 gap-8 text-center">
        <div className="relative flex flex-col items-center">
          <div className="h-24 flex items-end justify-center mb-2 relative w-full">
            {formData.stamp ? (
              <img src={formData.stamp} alt="Stamp" className="h-24 w-24 object-contain z-10" />
            ) : companySettings?.stamp_url ? (
              <img src={companySettings.stamp_url} alt="Company Stamp" className="h-24 w-24 object-contain z-10" />
            ) : (
              <div className="h-16 flex items-center justify-center text-gray-300 text-xs mb-2 italic">[{t("Company Stamp", "公司印章")}]</div>
            )}
          </div>
          <p className="font-semibold text-gray-900 text-xs border-t border-gray-200 pt-2 w-32">{t("Company Stamp", "公司印章")}</p>
        </div>
        <div className="relative flex flex-col items-center">
          <div className="h-24 flex items-end justify-center mb-2 relative w-full">
            {formData.signature ? (
              <img src={formData.signature} alt="Signature" className="h-20 w-48 object-contain z-10 translate-y-2" />
            ) : companySettings?.signature_url ? (
              <img src={companySettings.signature_url} alt="Signature" className="h-20 w-48 object-contain z-10 translate-y-2" />
            ) : (
              <div className="h-16 flex items-center justify-center text-gray-300 text-xs mb-2 italic">[{t("Authorized Signature", "授權簽署")}]</div>
            )}
          </div>
          <p className="font-semibold text-gray-900 text-xs border-t border-gray-200 pt-2 w-32">{t("Authorized By", "授權簽署")}</p>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-gray-300 text-center">
        <p className="text-[10px] text-gray-400 italic">
          {t("End of Document", "文件完")}
        </p>
      </div>
    </div>
  )

  return (
    <DocumentWrapper>
      <StatusBadge />
      <Header />
      <PartiesInfo />
      <ItemsTable />
      
      <div className="flex justify-end mb-6">
        <div className="w-48">
          <div className="flex justify-between py-2 border-t-2 border-gray-800 font-bold text-gray-900">
            <span className="text-xs">{t("TOTAL", "總額")}:</span>
            <span className="text-xs">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {formData.notes && (
        <div className="mb-6 pt-4 border-t border-gray-300">
          <p className="font-bold text-gray-900 mb-2 text-xs">{t("Notes", "備註")}:</p>
          <p className="text-xs text-gray-700 whitespace-pre-wrap">{formData.notes}</p>
        </div>
      )}

      <PaymentMethods />
      <Footer />
    </DocumentWrapper>
  )
}
