"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface HKPaymentModuleProps {
  showPaymentMethods?: boolean
}

export function HKPaymentModule({ showPaymentMethods = true }: HKPaymentModuleProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const paymentMethods = [
    {
      method: "Bank Transfer",
      methodZH: "銀行轉賬",
      details: [
        { label: "Bank", value: "HSBC Hong Kong" },
        { label: "Account", value: "123-456789-012" },
        { label: "Account Name", value: "KINO DIGITAL LIMITED" },
      ],
    },
    {
      method: "FPS (Fast Payment System)",
      methodZH: "FPS快速支付系統",
      details: [{ label: "ID", value: "123456789@hkicbc" }],
    },
  ]

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!showPaymentMethods) {
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-blue-900">Payment Methods | 付款方式</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.map((method, idx) => (
          <div key={idx} className="space-y-2">
            <p className="font-semibold text-sm text-blue-900">
              {method.method} | {method.methodZH}
            </p>
            <div className="bg-white rounded-lg p-3 space-y-2 border border-blue-100">
              {method.details.map((detail, detailIdx) => (
                <div key={detailIdx} className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">{detail.label}:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-slate-100 px-2 py-1 rounded font-mono text-slate-900">{detail.value}</code>
                    <button onClick={() => handleCopy(detail.value)} className="text-blue-600 hover:text-blue-700">
                      {copied === detail.value ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-blue-200">
          All payments in HKD. Please reference invoice number in your transfer.
        </p>
      </CardContent>
    </Card>
  )
}
