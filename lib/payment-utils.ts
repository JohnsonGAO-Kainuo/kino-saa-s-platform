// Payment status and workflow utilities

export interface PaymentStatus {
  status: "unpaid" | "pending" | "paid" | "voided"
  paidAt?: string
  paymentMethod?: string
  referenceNumber?: string
  undoUntil?: number // timestamp for undo window
}

export const UNDO_WINDOW_MS = 10000 // 10 seconds

export function createPaymentStatus(status: "unpaid" | "pending" = "unpaid"): PaymentStatus {
  return { status }
}

export function markAsPaid(paymentStatus: PaymentStatus): PaymentStatus {
  return {
    ...paymentStatus,
    status: "paid",
    paidAt: new Date().toISOString(),
    undoUntil: Date.now() + UNDO_WINDOW_MS,
  }
}

export function undoPayment(paymentStatus: PaymentStatus): PaymentStatus {
  if (paymentStatus.undoUntil && Date.now() <= paymentStatus.undoUntil) {
    return createPaymentStatus("unpaid")
  }
  return paymentStatus
}

export function voidReceipt(paymentStatus: PaymentStatus): PaymentStatus {
  return {
    ...paymentStatus,
    status: "voided",
    paidAt: undefined,
  }
}

export function canUndoPayment(paymentStatus: PaymentStatus): boolean {
  return paymentStatus.status === "paid" && !!(paymentStatus.undoUntil && Date.now() <= paymentStatus.undoUntil)
}

export function getPaymentStatusDisplay(status: PaymentStatus): { label: string; color: string; bgColor: string } {
  switch (status.status) {
    case "paid":
      return { label: "已全額支付 | Fully Paid", color: "text-green-700", bgColor: "bg-green-100" }
    case "pending":
      return { label: "待支付 | Pending", color: "text-yellow-700", bgColor: "bg-yellow-100" }
    case "voided":
      return { label: "已作廢 | Voided", color: "text-red-700", bgColor: "bg-red-100" }
    default:
      return { label: "未支付 | Unpaid", color: "text-gray-700", bgColor: "bg-gray-100" }
  }
}
