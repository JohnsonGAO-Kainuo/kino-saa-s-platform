"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    label: "Create New",
    sublabel: "Document",
    href: "/editor?type=quotation",
    color: "bg-[#3b82f6]",
  },
  {
    label: "Create New",
    sublabel: "Invoice",
    href: "/editor?type=invoice",
    color: "bg-[#ec4899]",
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {actions.map((action) => (
        <Link key={action.sublabel} href={action.href} className="group">
          <Card className={`${action.color} border-none shadow-sm h-32 text-white hover:opacity-95 transition-opacity active:scale-[0.98]`}>
            <CardContent className="h-full p-6 flex flex-col justify-center items-center gap-2">
              <div className="bg-white/20 p-2 rounded-full">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium opacity-90">{action.label}</p>
                <h3 className="text-xl font-bold">{action.sublabel}</h3>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
