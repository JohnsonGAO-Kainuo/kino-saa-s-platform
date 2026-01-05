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
      description: "Send professional quotes",
      color: "text-[#2563eb]",
      bg: "bg-[#eff6ff]",
      borderColor: "border-[#bfdbfe]",
    },
    {
      icon: FileSignature,
      label: "Contract",
      href: "/editor?type=contract",
      description: "Legal service agreements",
      color: "text-[#7c3aed]",
      bg: "bg-[#f5f3ff]",
      borderColor: "border-[#ddd6fe]",
    },
    {
      icon: DollarSign,
      label: "Invoice",
      href: "/editor?type=invoice",
      description: "Bill your clients easily",
      color: "text-[#16a34a]",
      bg: "bg-[#f0fdf4]",
      borderColor: "border-[#bbf7d0]",
    },
    {
      icon: Receipt,
      label: "Receipt",
      href: "/editor?type=receipt",
      description: "Confirm payments instantly",
      color: "text-[#ea580c]",
      bg: "bg-[#fff7ed]",
      borderColor: "border-[#fed7aa]",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[#1a1f36] uppercase tracking-wider">Create New</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action) => (
          <Link key={action.label} href={action.href} className="group">
            <Card className="border-border shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-all duration-200 bg-white group-active:scale-[0.98]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg ${action.bg} ${action.color} border ${action.borderColor} transition-colors`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-[#1a1f36] flex items-center gap-1 group-hover:text-primary transition-colors">
                      {action.label}
                      <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </h4>
                    <p className="text-[13px] text-[#4f566b]">
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
