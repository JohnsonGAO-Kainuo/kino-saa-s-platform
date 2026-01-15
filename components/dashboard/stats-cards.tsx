"use client"

import { FileText, FileSignature, Receipt, Files, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

interface StatCardProps {
  labelKey: string
  value: string | number
  icon: any
  tag?: string
  href: string
}

export function StatsCards({ stats }: { stats: { total: number, quotations: number, contracts: number, invoices: number } }) {
  const { t } = useLanguage()
  
  const cards: StatCardProps[] = [
    { labelKey: "Total Documents", value: stats.total, icon: Files, tag: "All Time", href: "/documents" },
    { labelKey: "Quotations", value: stats.quotations, icon: FileText, tag: "Drafts", href: "/documents?type=quotation" },
    { labelKey: "Contracts", value: stats.contracts, icon: FileSignature, tag: "Legal", href: "/documents?type=contract" },
    { labelKey: "Invoices", value: stats.invoices, icon: Receipt, tag: "Pending", href: "/documents?type=invoice" },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {cards.map((card, index) => (
        <Link 
          key={index} 
          href={card.href}
          className="group relative flex flex-col justify-between h-[150px] bg-card border border-border rounded-[24px] p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:border-border-hover overflow-hidden"
        >
          {/* Top Row */}
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-[14px] bg-[#F6F3EE] border border-[#EBE7E0] flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 shadow-sm">
              <card.icon className="w-5 h-5" strokeWidth={2} />
            </div>
            {card.tag && (
               <span className="px-2.5 py-1 rounded-full bg-[#F6F3EE] text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                {card.tag}
              </span>
            )}
          </div>

          {/* Bottom Row */}
          <div className="mt-auto relative z-10">
            <p className="text-[13px] font-medium text-muted-foreground mb-1 group-hover:text-foreground/70 transition-colors">{t(card.labelKey)}</p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl font-bold text-foreground tracking-tight">{card.value}</h3>
            </div>
          </div>
          
          {/* Hover Decoration */}
          <div className="absolute right-[-20px] bottom-[-20px] opacity-0 group-hover:opacity-5 transition-opacity duration-500">
             <card.icon className="w-32 h-32" />
          </div>
          
          <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
             <ArrowUpRight className="w-4 h-4 text-primary" />
          </div>
        </Link>
      ))}
    </div>
  )
}
