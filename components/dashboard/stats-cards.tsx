import { FileText, FileSignature, Receipt, Files } from "lucide-react"
import Link from "next/link"

interface StatCardProps {
  label: string
  value: string | number
  icon: any
  color: "blue" | "orange" | "green" | "purple"
  href: string
}

export function StatsCards({ stats }: { stats: { total: number, quotations: number, contracts: number, invoices: number } }) {
  const cards: StatCardProps[] = [
    { label: "Total Documents", value: stats.total, icon: Files, color: "blue", href: "/documents" },
    { label: "Quotations", value: stats.quotations, icon: FileText, color: "orange", href: "/documents?type=quotation" },
    { label: "Contracts", value: stats.contracts, icon: FileSignature, color: "green", href: "/documents?type=contract" },
    { label: "Invoices", value: stats.invoices, icon: Receipt, color: "purple", href: "/documents?type=invoice" },
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Link 
          key={index} 
          href={card.href}
          className={`${colorStyles[card.color]} rounded-2xl p-6 shadow-lg transition-all hover:-translate-y-1 block text-white`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">{card.label}</p>
              <h3 className="text-3xl font-bold">{card.value}</h3>
            </div>
            <div className={`p-2 rounded-xl ${iconStyles[card.color]} backdrop-blur-sm`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-white/70 text-xs">
            <span className="bg-white/20 px-2 py-0.5 rounded text-white mr-2">
              View All
            </span>
            <span>click to manage</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

