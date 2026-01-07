"use client"

import { Plus, FileText, FileSignature, Receipt } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreateButtons() {
  const router = useRouter()

  const handleCreate = (type: string) => {
    // In a real app, this might create a draft ID first or just navigate
    router.push(`/editor?type=${type}`)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <button 
        onClick={() => handleCreate('quotation')}
        className="group relative overflow-hidden bg-blue-500 rounded-2xl p-6 text-left transition-all hover:shadow-lg hover:shadow-blue-200"
      >
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <FileText className="w-32 h-32 text-white" />
        </div>
        <div className="relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1 leading-tight">Quotation</h3>
          <p className="text-blue-100 text-xs line-clamp-2">Draft a new proposal</p>
        </div>
      </button>

      <button 
        onClick={() => handleCreate('contract')}
        className="group relative overflow-hidden bg-emerald-500 rounded-2xl p-6 text-left transition-all hover:shadow-lg hover:shadow-emerald-200"
      >
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <FileSignature className="w-32 h-32 text-white" />
        </div>
        <div className="relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1 leading-tight">Contract</h3>
          <p className="text-emerald-100 text-xs line-clamp-2">Prepare a legal agreement</p>
        </div>
      </button>

      <button 
        onClick={() => handleCreate('invoice')}
        className="group relative overflow-hidden bg-[#ff6b6b] rounded-2xl p-6 text-left transition-all hover:shadow-lg hover:shadow-red-200"
      >
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Receipt className="w-32 h-32 text-white" />
        </div>
        <div className="relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1 leading-tight">Invoice</h3>
          <p className="text-red-100 text-xs line-clamp-2">Bill for completed work</p>
        </div>
      </button>

      <button 
        onClick={() => handleCreate('receipt')}
        className="group relative overflow-hidden bg-purple-500 rounded-2xl p-6 text-left transition-all hover:shadow-lg hover:shadow-purple-200"
      >
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Receipt className="w-32 h-32 text-white" />
        </div>
        <div className="relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1 leading-tight">Receipt</h3>
          <p className="text-purple-100 text-xs line-clamp-2">Issue a payment proof</p>
        </div>
      </button>
    </div>
  )
}

