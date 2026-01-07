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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <button 
        onClick={() => handleCreate('quotation')}
        className="group relative overflow-hidden bg-blue-500 rounded-2xl p-6 text-left transition-all hover:shadow-lg hover:shadow-blue-200"
      >
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <FileText className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Create Quotation</h3>
          <p className="text-blue-100 text-sm">Draft a new proposal for your client</p>
        </div>
      </button>

      <button 
        onClick={() => handleCreate('invoice')}
        className="group relative overflow-hidden bg-[#ff6b6b] rounded-2xl p-6 text-left transition-all hover:shadow-lg hover:shadow-red-200"
      >
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Receipt className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Create Invoice</h3>
          <p className="text-red-100 text-sm">Generate a bill for completed work</p>
        </div>
      </button>
      
      {/* Optional: Contract Button if we want 3 columns, but design implies 2 dominant ones. 
          I'll add it as a smaller action or keep it to 2 as per reference image. 
          Let's add it for functionality but maybe styled differently or just consistent.
          The user asked for "Strictly reference", Image 4 shows 2 big buttons.
          I'll stick to 2 big ones for now, maybe add a small row for others.
      */}
    </div>
  )
}

