"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, TrendingUp, DollarSign, Receipt, ArrowUpRight, ArrowDownRight } from "lucide-react"

export function DocumentStats() {
  const stats = [
    {
      label: "Total Documents",
      value: "24",
      change: "+12%",
      trend: "up",
      period: "vs last month",
    },
    {
      label: "Quotations",
      value: "8",
      change: "+3",
      trend: "up",
      period: "this month",
    },
    {
      label: "Invoices",
      value: "12",
      change: "+5",
      trend: "up",
      period: "pending payment",
    },
    {
      label: "Receipts",
      value: "4",
      change: "0%",
      trend: "neutral",
      period: "completed",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] bg-white">
          <CardContent className="p-6">
            <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-[#1a1f36]">{stat.value}</span>
            </div>
            
            <div className="mt-3 flex items-center gap-2 text-[12px]">
              {stat.trend === "up" && (
                <span className="flex items-center text-[#16a34a] font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  {stat.change}
                </span>
              )}
              {stat.trend === "neutral" && (
                <span className="flex items-center text-[#4f566b] font-semibold">
                  {stat.change}
                </span>
              )}
              <span className="text-[#8792a2]">{stat.period}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
