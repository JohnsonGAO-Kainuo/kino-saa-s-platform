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

export function DocumentPreview({ documentType, formData }: DocumentPreviewProps) {
  const totalAmount = formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const paymentStatus = formData.paymentStatus

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
  const stampUrl = formData.stamp ? URL.createObjectURL(formData.stamp) : null

  const isPaidReceipt = documentType === "receipt" && paymentStatus?.status === "paid"
  const isVoidedReceipt = documentType === "receipt" && paymentStatus?.status === "voided"

  if (documentType === "contract") {
    return (
      <Card className="bg-white text-black p-8 min-h-[800px] shadow-lg border-border/50 sticky top-0 relative">
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
          {/* Header */}
          <div className="border-b-2 border-gray-800 pb-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                {logoUrl ? (
                  <img
                    src={logoUrl || "/placeholder.svg"}
                    alt="Company Logo"
                    className="w-32 h-20 object-contain rounded"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="text-2xl font-bold text-gray-800">KINO</div>
                )}
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-gray-900">{title.en}</h1>
                <h1 className="text-2xl font-bold text-gray-700">{title.zh}</h1>
                <p className="text-xs text-gray-600 mt-1">Contract #{new Date().getFullYear()}-001</p>
              </div>
            </div>
          </div>

          {/* Parties Information */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="text-xs">
              <p className="font-bold text-gray-900 mb-1">FROM | 由以下機構:</p>
              <p className="font-semibold text-xs">Your Company Name</p>
              <p className="text-gray-600 text-xs">123 Business Street</p>
              <p className="text-gray-600 text-xs">City, State 12345</p>
            </div>
            <div className="text-xs">
              <p className="font-bold text-gray-900 mb-1">TO | 受協議方:</p>
              <p className="font-semibold text-xs">{formData.clientName || "Client Name"}</p>
              <p className="text-gray-600 text-xs break-words">{formData.clientAddress || "Address"}</p>
              <p className="text-gray-600 text-xs">{formData.clientEmail || "Email"}</p>
            </div>
          </div>

          {/* Contract Details */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">1. SCOPE OF WORK | 工作範圍</h2>
            <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
              {formData.contractTerms || "Scope of work to be defined..."}
            </div>
          </div>

          {/* Services/Items Section */}
          {formData.items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">2. SERVICES & DELIVERABLES | 服務及交付物</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-t-2 border-b-2 border-gray-800">
                    <th className="text-left py-2 font-bold text-gray-900 text-xs">Service | 服務</th>
                    <th className="text-right py-2 font-bold text-gray-900 text-xs w-20">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="py-3 text-gray-800 text-xs">{item.description || "—"}</td>
                      <td className="text-right py-3 font-semibold text-gray-900 text-xs">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Payment Terms */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. PAYMENT TERMS | 付款條款</h2>
            <p className="text-xs text-gray-700">{formData.paymentTerms || "Payment terms to be determined..."}</p>
            {formData.items.length > 0 && (
              <div className="mt-3 flex justify-end">
                <div className="w-48">
                  <div className="flex justify-between py-2 border-t-2 border-gray-800 font-bold text-gray-900">
                    <span className="text-xs">TOTAL | 總額:</span>
                    <span className="text-xs">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          {formData.deliveryDate && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-2">4. TIMELINE | 時間表</h2>
              <p className="text-xs text-gray-700">Expected Delivery: {formData.deliveryDate}</p>
            </div>
          )}

          {/* Signature Section */}
          <div className="pt-6 border-t-2 border-gray-800">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="font-semibold text-gray-900 text-xs mb-8">Company Representative | 公司代表</p>
                {formData.signature ? (
                  <img
                    src={formData.signature || "/placeholder.svg"}
                    alt="Signature"
                    className="h-12 object-contain mb-2"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="h-12 flex items-center justify-center text-gray-300 text-xs mb-2">
                    [Authorized Signature]
                  </div>
                )}
                <p className="text-xs text-gray-600">Signature | 簽名</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-xs mb-8">Client Representative | 客戶代表</p>
                <div className="h-12 flex items-center justify-center text-gray-300 text-xs border-b border-gray-800 mb-2">
                  [Client Signature]
                </div>
                <p className="text-xs text-gray-600">Signature | 簽名</p>
              </div>
            </div>

            {stampUrl && (
              <div className="mt-6 text-center">
                <img
                  src={stampUrl || "/placeholder.svg"}
                  alt="Company Stamp"
                  className="h-20 object-contain mx-auto"
                  crossOrigin="anonymous"
                />
                <p className="font-semibold text-gray-900 text-xs mt-2">Company Stamp | 公司印章</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center">
            <p className="text-xs text-gray-600">English | 繁體中文</p>
            <p className="text-xs text-gray-500 mt-1">This agreement is valid in both languages</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={`bg-white text-black p-8 min-h-[800px] shadow-lg border-border/50 sticky top-0 relative ${
        isPaidReceipt || isVoidedReceipt ? "bg-gradient-to-br from-white to-slate-50" : ""
      }`}
    >
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
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              {logoUrl ? (
                <img
                  src={logoUrl || "/placeholder.svg"}
                  alt="Company Logo"
                  className="w-32 h-20 object-contain rounded"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="text-2xl font-bold text-gray-800">KINO</div>
              )}
            </div>
            <div className="text-right">
              <div className="flex gap-4 justify-end">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{title.en}</h1>
                  <p className="text-xs text-gray-600 mt-1">#2024-001</p>
                </div>
                <div className="text-right">
                  <h1 className="text-2xl font-bold text-gray-700">{title.zh}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(documentType === "invoice" || documentType === "receipt") && paymentStatus && (
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
              {paymentStatus.status === "paid" && "Paid | 已付"}
              {paymentStatus.status === "voided" && "Voided | 作廢"}
              {paymentStatus.status === "unpaid" && "Unpaid | 待付"}
              {paymentStatus.status === "pending" && "Pending | 待填"}
            </div>
          </div>
        )}

        {/* Company & Client Info */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div className="text-xs space-y-1">
            <p className="font-bold text-gray-900 mb-2 uppercase tracking-tight border-b border-gray-200 pb-1">From: | 發自:</p>
            <p className="font-bold text-[14px] text-gray-900">Your Company Name</p>
            <p className="text-gray-600">123 Business Street</p>
            <p className="text-gray-600">City, State 12345</p>
            <p className="text-gray-600">company@example.com</p>
          </div>
          <div className="text-xs space-y-1">
            <p className="font-bold text-gray-900 mb-2 uppercase tracking-tight border-b border-gray-200 pb-1">To: | 收票人:</p>
            <p className="font-bold text-[14px] text-gray-900">{formData.clientName || "Client Name"}</p>
            <p className="text-gray-600 break-words">{formData.clientAddress || "Address"}</p>
            <p className="text-gray-600">{formData.clientEmail || "Email"}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-t-2 border-b-2 border-gray-800">
              <th className="text-left py-2 font-bold text-gray-900 text-xs">Description | 描述</th>
              <th className="text-right py-2 font-bold text-gray-900 text-xs w-16">Qty | 數量</th>
              <th className="text-right py-2 font-bold text-gray-900 text-xs w-20">Unit Price</th>
              <th className="text-right py-2 font-bold text-gray-900 text-xs w-20">Amount</th>
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

        {/* Total */}
        <div className="flex justify-end mb-6">
          <div className="w-48">
            <div className="flex justify-between py-2 border-t-2 border-gray-800 font-bold text-gray-900">
              <span className="text-xs">TOTAL | 總額:</span>
              <span className="text-xs">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {formData.notes && (
          <div className="mb-6 pt-4 border-t border-gray-300">
            <p className="font-bold text-gray-900 mb-2 text-xs">Notes | 備註:</p>
            <p className="text-xs text-gray-700 whitespace-pre-wrap">{formData.notes}</p>
          </div>
        )}

        {(documentType === "invoice" || documentType === "receipt") && (
          <div className="mb-8 p-0 border-t border-b border-gray-200 py-4">
            <p className="font-bold text-gray-900 mb-4 text-[13px] uppercase tracking-tight">Payment Methods | 付款方式</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="border-l-2 border-gray-100 pl-4">
                <p className="font-bold text-gray-800 mb-1">Bank Transfer | 銀行轉賬</p>
                <p className="text-gray-600">Bank: HSBC Hong Kong</p>
                <p className="text-gray-600">Account: 123-456789-012</p>
              </div>
              <div className="border-l-2 border-gray-100 pl-4">
                <p className="font-bold text-gray-800 mb-1">FPS | 快速支付系統</p>
                <p className="text-gray-600">ID: 123456789@hkicbc</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer with Stamp & Signature */}
        <div className="pt-6 border-t-2 border-gray-800">
          <div className="grid grid-cols-2 gap-8 text-center">
            <div>
              {stampUrl ? (
                <img
                  src={stampUrl || "/placeholder.svg"}
                  alt="Company Stamp"
                  className="h-16 object-contain mx-auto mb-2"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="h-16 flex items-center justify-center text-gray-300 text-xs mb-2">[Company Stamp]</div>
              )}
              <p className="font-semibold text-gray-900 text-xs">Company Stamp | 公司印章</p>
            </div>
            <div>
              {formData.signature ? (
                <img
                  src={formData.signature || "/placeholder.svg"}
                  alt="Signature"
                  className="h-16 object-contain mx-auto mb-2"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="h-16 flex items-center justify-center text-gray-300 text-xs mb-2">
                  [Authorized Signature]
                </div>
              )}
              <p className="font-semibold text-gray-900 text-xs">Authorized By | 授權簽署</p>
            </div>
          </div>
        </div>

        {/* Bilingual Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center">
          <p className="text-xs text-gray-600">English | 繁體中文</p>
          <p className="text-xs text-gray-500 mt-1">This document is valid in both languages</p>
        </div>
      </div>
    </Card>
  )
}
