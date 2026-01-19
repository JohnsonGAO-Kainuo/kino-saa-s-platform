"use client"

import { useState } from "react"
import { Send, ArrowRight, Sparkles, FileText, FileSignature, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"

export default function DashboardHero() {
  const router = useRouter()
  const { t: translate } = useLanguage()
  const [prompt, setPrompt] = useState("")
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)

  const handleGenerate = () => {
    if (!prompt.trim()) return
    const type = activeTemplate || "quotation"
    router.push(`/editor?type=${type}&prompt=${encodeURIComponent(prompt)}`)
  }

  const templates = [
    {
      id: "quotation",
      label: "Quotation",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100/50",
      border: "border-blue-200",
      desc: "Proposals & Estimates"
    },
    {
      id: "invoice",
      label: "Invoice",
      icon: Receipt,
      color: "text-orange-600",
      bg: "bg-orange-100/50",
      border: "border-orange-200",
      desc: "Billing & Payments"
    },
    {
      id: "contract",
      label: "Contract",
      icon: FileSignature,
      color: "text-emerald-600",
      bg: "bg-emerald-100/50",
      border: "border-emerald-200",
      desc: "Legal Agreements"
    }
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-5xl mx-auto px-4">
      
      {/* Hero Text */}
      <div className="text-center space-y-6 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border shadow-sm mb-4">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-semibold text-muted-foreground">{translate("AI-Powered Document Assistant") || "AI-Powered Document Assistant"}</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
          What do you want to <br/>
          <span className="text-primary relative inline-block">
            create today?
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
          Describe your document in plain language, and our AI will draft it instantly. No complex forms, just chat.
        </p>
      </div>

      {/* Main Input Area */}
      <div className="w-full max-w-3xl relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-[28px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
        <div className="relative bg-white rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-border/50 p-2 flex items-center transition-all focus-within:shadow-[0_12px_60px_rgba(245,85,3,0.15)] focus-within:border-primary/30">
          <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g., Create an invoice for web design services to Acme Corp for $2,500..."
            className="flex-1 h-16 px-6 text-lg bg-transparent border-none outline-none placeholder:text-muted-foreground/60 text-foreground w-full"
            autoFocus
          />
          <Button 
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className="h-14 px-8 rounded-[20px] bg-primary hover:bg-primary/90 text-white text-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            Generate <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
        
        {/* Suggested Prompts - Hints */}
        <div className="absolute -bottom-10 left-0 w-full flex justify-center gap-3">
          <button onClick={() => setPrompt("Quote for Website Redesign")} className="text-xs bg-white/50 hover:bg-white border border-border/50 rounded-full px-3 py-1.5 text-muted-foreground transition-all">
            "Quote for Website Redesign"
          </button>
          <button onClick={() => setPrompt("Invoice to Acme for $500")} className="text-xs bg-white/50 hover:bg-white border border-border/50 rounded-full px-3 py-1.5 text-muted-foreground transition-all">
            "Invoice to Acme for $500"
          </button>
          <button onClick={() => setPrompt("Contract for Marketing Services")} className="text-xs bg-white/50 hover:bg-white border border-border/50 rounded-full px-3 py-1.5 text-muted-foreground transition-all">
            "Contract for Marketing Services"
          </button>
        </div>
      </div>

      {/* Templates / Quick Starts */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setActiveTemplate(template.id)}
            className={cn(
              "group relative flex flex-col items-center p-6 rounded-[24px] border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white",
              activeTemplate === template.id 
                ? `border-primary ring-4 ring-primary/10 shadow-lg scale-105 z-10` 
                : "border-transparent hover:border-border shadow-sm hover:bg-white"
            )}
          >
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", template.bg)}>
              <template.icon className={cn("w-8 h-8", template.color)} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">{template.label}</h3>
            <p className="text-sm text-muted-foreground">{template.desc}</p>
            
            {activeTemplate === template.id && (
              <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full animate-ping" />
            )}
          </button>
        ))}
      </div>

      {/* Trust / Stats (Simplified) */}
      <div className="mt-20 flex items-center gap-8 text-sm text-muted-foreground/60">
        <span>Trusted by 1,000+ Freelancers</span>
        <span className="w-1 h-1 bg-border rounded-full" />
        <span>Generated 50,000+ Documents</span>
      </div>
    </div>
  )
}
