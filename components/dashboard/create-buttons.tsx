"use client"

import { Plus, FileText, FileSignature, Receipt } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"

export function CreateButtons() {
  const router = useRouter()
  const { t } = useLanguage()

  const handleCreate = (type: string) => {
    // In a real app, this might create a draft ID first or just navigate
    router.push(`/editor?type=${type}`)
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <button 
        onClick={() => handleCreate('quotation')}
        className="group relative overflow-hidden bg-blue-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-left transition-all hover:shadow-lg hover:shadow-blue-200"
      >
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <FileText className="w-20 md:w-32 h-20 md:h-32 text-white" />
        </div>
        <div className="relative z-10">
          <div className="w-8 md:w-10 h-8 md:h-10 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Plus className="w-4 md:w-5 h-4 md:h-5 text-white" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-white mb-0.5 md:mb-1 leading-tight">{t('Quotation')}</h3>
          <p className="text-blue-100 text-[10px] md:text-xs line-clamp-2">{t('Draft a new proposal')}</p>
        </div>
      </button>

      <button 
        onClick={() => handleCreate('contract')}
        className="group relative overflow-hidden bg-emerald-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-left transition-all hover:shadow-lg hover:shadow-emerald-200"
      >
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <FileSignature className="w-20 md:w-32 h-20 md:h-32 text-white" />
        </div>
        <div className="relative z-10">
          <div className="w-8 md:w-10 h-8 md:h-10 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Plus className="w-4 md:w-5 h-4 md:h-5 text-white" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-white mb-0.5 md:mb-1 leading-tight">{t('Contract')}</h3>
          <p className="text-emerald-100 text-[10px] md:text-xs line-clamp-2">{t('Prepare a legal agreement')}</p>
        </div>
      </button>

      <button 
        onClick={() => handleCreate('invoice')}
        className="group relative overflow-hidden bg-[#ff6b6b] rounded-xl md:rounded-2xl p-4 md:p-6 text-left transition-all hover:shadow-lg hover:shadow-red-200"
      >
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Receipt className="w-20 md:w-32 h-20 md:h-32 text-white" />
        </div>
        <div className="relative z-10">
          <div className="w-8 md:w-10 h-8 md:h-10 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Plus className="w-4 md:w-5 h-4 md:h-5 text-white" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-white mb-0.5 md:mb-1 leading-tight">{t('Invoice')}</h3>
          <p className="text-red-100 text-[10px] md:text-xs line-clamp-2">{t('Bill for completed work')}</p>
        </div>
      </button>

      <button 
        onClick={() => handleCreate('receipt')}
        className="group relative overflow-hidden bg-purple-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-left transition-all hover:shadow-lg hover:shadow-purple-200"
      >
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Receipt className="w-20 md:w-32 h-20 md:h-32 text-white" />
        </div>
        <div className="relative z-10">
          <div className="w-8 md:w-10 h-8 md:h-10 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Plus className="w-4 md:w-5 h-4 md:h-5 text-white" />
          </div>
          <h3 className="text-base md:text-lg font-bold text-white mb-0.5 md:mb-1 leading-tight">{t('Receipt')}</h3>
          <p className="text-purple-100 text-[10px] md:text-xs line-clamp-2">{t('Issue a payment proof')}</p>
        </div>
      </button>
    </div>
  )
}

