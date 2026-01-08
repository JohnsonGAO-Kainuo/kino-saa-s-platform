"use client"

import { FileText, FileSignature, Receipt, Files } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

interface StatCardProps {
  labelKey: string
  value: string | number
  icon: any
  color: "blue" | "orange" | "green" | "purple"
  href: string
}

export function StatsCards({ stats }: { stats: { total: number, quotations: number, contracts: number, invoices: number } }) {
  const { t } = useLanguage()
  
  const cards: StatCardProps[] = [
    { labelKey: "Total Documents", value: stats.total, icon: Files, color: "blue", href: "/documents" },
    { labelKey: "Quotations", value: stats.quotations, icon: FileText, color: "orange", href: "/documents?type=quotation" },
    { labelKey: "Contracts", value: stats.contracts, icon: FileSignature, color: "green", href: "/documents?type=contract" },
    { labelKey: "Invoices", value: stats.invoices, icon: Receipt, color: "purple", href: "/documents?type=invoice" },
  ]

  const colorStyles = {
    blue: "bg-blue-500 hover:bg-blue-600",
    orange: "bg-orange-500 hover:bg-orange-600",
    green: "bg-emerald-500 hover:bg-emerald-600",
    purple: "bg-purple-500 hover:bg-purple-600",
  }

  const iconStyles = {
    blue: "bg-white/20 text-white",
    orange: "bg-white/20 text-white",
    green: "bg-white/20 text-white",
    purple: "bg-white/20 text-white",
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, index) => (
        <Link 
          key={index} 
          href={card.href}
          className={`${colorStyles[card.color]} rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg transition-all hover:-translate-y-1 block text-white`}
        >
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <p className="text-white/80 text-[10px] md:text-sm font-medium mb-1 truncate">{t(card.labelKey)}</p>
              <h3 className="text-xl md:text-3xl font-bold">{card.value}</h3>
            </div>
            <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl ${iconStyles[card.color]} backdrop-blur-sm shrink-0`}>
              <card.icon className="w-4 h-4 md:w-6 md:h-6" />
            </div>
          </div>
          <div className="mt-2 md:mt-4 flex items-center text-white/70 text-[10px] md:text-xs">
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-white mr-2 hidden sm:inline-block">
              {t('View All')}
            </span>
            <span className="truncate">{t('click to manage')}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

