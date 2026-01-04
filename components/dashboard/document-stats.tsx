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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
            </div>
            
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              {stat.trend === "up" && (
                <span className="flex items-center text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  {stat.change}
                </span>
              )}
              {stat.trend === "neutral" && (
                <span className="flex items-center text-gray-600 font-medium bg-gray-50 px-1.5 py-0.5 rounded">
                  {stat.change}
                </span>
              )}
              <span className="text-muted-foreground">{stat.period}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
