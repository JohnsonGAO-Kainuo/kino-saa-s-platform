"use client"

import { Plus, FileText, FileSignature, Receipt } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"

export function CreateButtons() {
  const router = useRouter()
  const { t } = useLanguage()

  const handleCreate = (type: string) => {
    router.push(`/editor?type=${type}`)
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <button 
        onClick={() => handleCreate('quotation')}
        className="group relative overflow-hidden bg-card border border-border rounded-[22px] p-5 md:p-6 text-left transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
      >
        <div className="flex flex-col h-full justify-between relative z-10">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{t('Quotation')}</h3>
            <p className="text-muted-foreground text-[10px] md:text-xs leading-relaxed line-clamp-2">{t('Draft a new proposal')}</p>
          </div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
      </button>

      <button 
        onClick={() => handleCreate('contract')}
        className="group relative overflow-hidden bg-card border border-border rounded-[22px] p-5 md:p-6 text-left transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
      >
        <div className="flex flex-col h-full justify-between relative z-10">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <FileSignature className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{t('Contract')}</h3>
            <p className="text-muted-foreground text-[10px] md:text-xs leading-relaxed line-clamp-2">{t('Prepare a legal agreement')}</p>
          </div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
      </button>

      <button 
        onClick={() => handleCreate('invoice')}
        className="group relative overflow-hidden bg-card border border-border rounded-[22px] p-5 md:p-6 text-left transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
      >
        <div className="flex flex-col h-full justify-between relative z-10">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Receipt className="w-5 h-5 md:w-6 md:h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{t('Invoice')}</h3>
            <p className="text-muted-foreground text-[10px] md:text-xs leading-relaxed line-clamp-2">{t('Bill for completed work')}</p>
          </div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
      </button>

      <button 
        onClick={() => handleCreate('receipt')}
        className="group relative overflow-hidden bg-card border border-border rounded-[22px] p-5 md:p-6 text-left transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
      >
        <div className="flex flex-col h-full justify-between relative z-10">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Receipt className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{t('Receipt')}</h3>
            <p className="text-muted-foreground text-[10px] md:text-xs leading-relaxed line-clamp-2">{t('Issue a payment proof')}</p>
          </div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
