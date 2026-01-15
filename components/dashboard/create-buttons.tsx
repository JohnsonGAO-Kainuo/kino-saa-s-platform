"use client"

import { Plus, FileText, FileSignature, Receipt, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"

export function CreateButtons() {
  const router = useRouter()
  const { t } = useLanguage()

  const handleCreate = (type: string) => {
    router.push(`/editor?type=${type}`)
  }

  const buttons = [
    {
      type: 'quotation',
      title: 'Quotation',
      desc: 'Draft a new proposal',
      icon: FileText,
      accent: 'blue'
    },
    {
      type: 'contract',
      title: 'Contract',
      desc: 'Prepare a legal agreement',
      icon: FileSignature,
      accent: 'emerald'
    },
    {
      type: 'invoice',
      title: 'Invoice',
      desc: 'Bill for completed work',
      icon: Receipt,
      accent: 'orange' // Matching brand
    },
    {
      type: 'receipt',
      title: 'Receipt',
      desc: 'Issue a payment proof',
      icon: Receipt,
      accent: 'purple'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {buttons.map((btn) => (
        <button 
          key={btn.type}
          onClick={() => handleCreate(btn.type)}
          className="group relative flex flex-col items-start bg-card border border-border rounded-[26px] p-1 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-primary/40"
        >
          {/* Inner Content Container */}
          <div className="w-full bg-[#FDFDFB] rounded-[22px] p-5 h-full flex flex-col border border-transparent group-hover:border-primary/5 transition-colors">
            
            {/* Header / Icon */}
            <div className="flex justify-between w-full mb-6">
              <div className="w-12 h-12 bg-white rounded-2xl border border-[#EBE7E0] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300 group-hover:shadow-md">
                <btn.icon className="w-6 h-6 text-foreground" strokeWidth={1.5} />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F6F3EE] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Plus className="w-4 h-4" />
              </div>
            </div>

            {/* Text */}
            <div className="mt-auto text-left">
              <h3 className="text-[17px] font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{t(btn.title)}</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{t(btn.desc)}</p>
            </div>
            
            {/* Action text appearing on hover */}
            <div className="h-0 overflow-hidden group-hover:h-6 transition-all duration-300 mt-0 group-hover:mt-3">
              <div className="flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-wider">
                Create New <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
