"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react"
import type { PaymentStatus } from "@/lib/payment-utils"
import { markAsPaid, undoPayment, voidReceipt, canUndoPayment, getPaymentStatusDisplay } from "@/lib/payment-utils"

interface PaymentStatusUIProps {
  documentType: "quotation" | "invoice" | "receipt" | "contract"
  currentStatus: PaymentStatus
  onStatusChange: (status: PaymentStatus) => void
  totalAmount: number
}

export function PaymentStatusUI({ documentType, currentStatus, onStatusChange, totalAmount }: PaymentStatusUIProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const isInvoiceOrReceipt = documentType === "invoice" || documentType === "receipt"

  useEffect(() => {
    if (!canUndoPayment(currentStatus)) {
      setTimeRemaining(0)
      return
    }

    const timer = setInterval(() => {
      const remaining = Math.ceil((currentStatus.undoUntil! - Date.now()) / 1000)
      if (remaining <= 0) {
        setTimeRemaining(0)
        clearInterval(timer)
      } else {
        setTimeRemaining(remaining)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [currentStatus])

  if (!isInvoiceOrReceipt) {
    return null
  }

  const displayStatus = getPaymentStatusDisplay(currentStatus)
  const canUndo = canUndoPayment(currentStatus)

  const handleMarkAsPaid = () => {
    onStatusChange(markAsPaid(currentStatus))
  }

  const handleUndo = () => {
    onStatusChange(undoPayment(currentStatus))
  }

  const handleVoid = () => {
    if (confirm("Mark this receipt as voided? This action cannot be undone.")) {
      onStatusChange(voidReceipt(currentStatus))
    }
  }

  return (
    <Card className="bg-card border-border p-4 mb-4">
      <div className="space-y-4">
        {/* Status Display */}
        <div className={`flex items-center justify-between p-3 rounded-lg ${displayStatus.bgColor}`}>
          <div className="flex items-center gap-3">
            {currentStatus.status === "paid" && <CheckCircle2 className={`w-5 h-5 ${displayStatus.color}`} />}
            {currentStatus.status === "pending" && <Clock className={`w-5 h-5 ${displayStatus.color}`} />}
            {currentStatus.status === "voided" && <XCircle className={`w-5 h-5 ${displayStatus.color}`} />}
            {currentStatus.status === "unpaid" && <AlertCircle className={`w-5 h-5 ${displayStatus.color}`} />}
            <div>
              <p className={`font-semibold ${displayStatus.color}`}>{displayStatus.label}</p>
              {currentStatus.paidAt && (
                <p className="text-xs text-gray-600">Paid on {new Date(currentStatus.paidAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">${totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {currentStatus.status === "unpaid" && (
            <Button onClick={handleMarkAsPaid} className="bg-green-600 hover:bg-green-700 text-white flex-1 min-w-fit">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as Paid
            </Button>
          )}

          {canUndo && (
            <Button
              onClick={handleUndo}
              variant="outline"
              className="flex-1 min-w-fit border-yellow-600 text-yellow-700 hover:bg-yellow-50 bg-transparent"
            >
              <Clock className="w-4 h-4 mr-2" />
              Undo ({timeRemaining}s)
            </Button>
          )}

          {currentStatus.status === "paid" && documentType === "receipt" && (
            <Button
              onClick={handleVoid}
              variant="outline"
              className="flex-1 min-w-fit border-red-600 text-red-700 hover:bg-red-50 bg-transparent"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Void Receipt
            </Button>
          )}
        </div>

        {/* Info Message */}
        {currentStatus.status === "unpaid" && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              Mark this {documentType === "invoice" ? "invoice" : "receipt"} as paid to auto-generate a receipt and
              update tracking.
            </p>
          </div>
        )}

        {canUndo && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">
              You can undo this payment for the next {timeRemaining} seconds. After that, the action cannot be reversed.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
