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
    blue: "text-blue-600 bg-blue-50",
    orange: "text-orange-600 bg-orange-50",
    green: "text-emerald-600 bg-emerald-50",
    purple: "text-purple-600 bg-purple-50",
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, index) => (
        <Link 
          key={index} 
          href={card.href}
          className="bg-card border border-border rounded-[22px] p-5 md:p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 block group"
        >
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <p className="text-muted-foreground text-[10px] md:text-sm font-medium mb-1 truncate group-hover:text-primary transition-colors">{t(card.labelKey)}</p>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{card.value}</h3>
            </div>
            <div className={`p-2 md:p-3 rounded-xl ${colorStyles[card.color]} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-muted-foreground text-[10px] md:text-xs">
            <span className="bg-secondary px-2 py-1 rounded-full text-foreground mr-2 hidden sm:inline-block font-medium group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              {t('View All')}
            </span>
            <span className="truncate opacity-70">{t('click to manage')}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
