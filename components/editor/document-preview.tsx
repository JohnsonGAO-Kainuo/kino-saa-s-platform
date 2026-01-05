"use client"

import { Card } from "@/components/ui/card"
import type { PaymentStatus } from "@/lib/payment-utils"

type DocumentType = "quotation" | "invoice" | "receipt" | "contract"

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
}

interface DocumentPreviewProps {
  documentType: DocumentType
  formData: FormDataType
}

import React, { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import type { PaymentStatus } from "@/lib/payment-utils"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export function DocumentPreview({ documentType, formData }: DocumentPreviewProps) {
  const { user } = useAuth()
  const [companySettings, setCompanySettings] = useState<any>(null)
  const totalAmount = formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const paymentStatus = formData.paymentStatus

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

  // ... (keeping getDocumentTitle etc.)

  return (
    <Card className="bg-white text-black p-8 min-h-[800px] shadow-lg border-border/50 sticky top-0 relative">
      {/* ... (keeping status badges) */}

      <div className="max-w-full text-sm leading-relaxed relative z-10">
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-32 h-20 object-contain rounded" />
              ) : (
                <div className="text-2xl font-bold text-gray-800 tracking-tight uppercase">
                  {companySettings?.company_name || "KINO"}
                </div>
              )}
            </div>
            {/* ... */}
          </div>
        </div>

        {/* Company & Client Info */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div className="text-xs space-y-1">
            <p className="font-bold text-gray-900 mb-2 uppercase tracking-tight border-b border-gray-200 pb-1">From: | 發自:</p>
            <p className="font-bold text-[14px] text-gray-900">{companySettings?.company_name || "Your Company Name"}</p>
            <p className="text-gray-600 whitespace-pre-wrap">{companySettings?.company_address || "123 Business Street\nCity, State 12345"}</p>
            <p className="text-gray-600">{companySettings?.company_email || "company@example.com"}</p>
          </div>
          <div className="text-xs space-y-1">
            <p className="font-bold text-gray-900 mb-2 uppercase tracking-tight border-b border-gray-200 pb-1">To: | 收票人:</p>
            <p className="font-bold text-[14px] text-gray-900">{formData.clientName || "Client Name"}</p>
            <p className="text-gray-600 break-words">{formData.clientAddress || "Address"}</p>
            <p className="text-gray-600">{formData.clientEmail || "Email"}</p>
          </div>
        </div>

        {/* ... (keeping Items Table) */}

        {/* Payment Methods */}
        {(documentType === "invoice" || documentType === "receipt") && (
          <div className="mb-8 p-0 border-t border-b border-gray-200 py-4">
            <p className="font-bold text-gray-900 mb-4 text-[13px] uppercase tracking-tight">Payment Methods | 付款方式</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="border-l-2 border-gray-100 pl-4">
                <p className="font-bold text-gray-800 mb-1">Bank Transfer | 銀行轉賬</p>
                <p className="text-gray-600">Bank: {companySettings?.bank_name || 'HSBC Hong Kong'}</p>
                <p className="text-gray-600">Account: {companySettings?.account_number || '123-456789-012'}</p>
                {companySettings?.swift_code && <p className="text-gray-600">SWIFT: {companySettings.swift_code}</p>}
              </div>
              <div className="border-l-2 border-gray-100 pl-4">
                <p className="font-bold text-gray-800 mb-1">FPS | 快速支付系統</p>
                <p className="text-gray-600">ID: {companySettings?.fps_id || '123456789@hkicbc'}</p>
              </div>
            </div>
          </div>
        )}
        {/* ... */}
      </div>
    </Card>
  )
}
