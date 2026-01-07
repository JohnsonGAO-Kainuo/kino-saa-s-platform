"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, Files, FileCheck, Receipt } from "lucide-react"

const stats = [
  {
    label: "Total Documents",
    value: "3,227",
    color: "bg-[#6366f1]",
    icon: FileText,
  },
  {
    label: "Quotations",
    value: "4,554",
    color: "bg-[#f59e0b]",
    icon: Files,
  },
  {
    label: "Contracts",
    value: "1,253",
    color: "bg-[#10b981]",
    icon: FileCheck,
  },
  {
    label: "Invoices",
    value: "1,900",
    color: "bg-[#8b5cf6]",
    icon: Receipt,
  },
]

export function DocumentStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={`${stat.color} border-none shadow-sm text-white`}>
          <CardContent className="p-5 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium opacity-90">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <stat.icon className="w-5 h-5 text-white" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
