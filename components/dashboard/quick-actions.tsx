"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, DollarSign, Receipt, FileSignature, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      icon: FileText,
      label: "Quotation",
      href: "/editor?type=quotation",
      description: "Create quote",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "hover:border-blue-200",
      hoverBg: "hover:bg-blue-50/50"
    },
    {
      icon: FileSignature,
      label: "Contract",
      href: "/editor?type=contract",
      description: "Draft agreement",
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "hover:border-purple-200",
      hoverBg: "hover:bg-purple-50/50"
    },
    {
      icon: DollarSign,
      label: "Invoice",
      href: "/editor?type=invoice",
      description: "Generate invoice",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "hover:border-green-200",
      hoverBg: "hover:bg-green-50/50"
    },
    {
      icon: Receipt,
      label: "Receipt",
      href: "/editor?type=receipt",
      description: "Create receipt",
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "hover:border-orange-200",
      hoverBg: "hover:bg-orange-50/50"
    },
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link key={action.label} href={action.href} className="group">
            <Card className={`border border-border shadow-sm hover:shadow-md transition-all duration-200 h-full ${action.border}`}>
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${action.bg} ${action.color} transition-colors`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                
                <div className="mt-auto">
                  <h4 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {action.label}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
