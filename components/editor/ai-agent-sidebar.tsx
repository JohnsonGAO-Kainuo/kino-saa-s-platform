"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Send, X, Maximize2, Minimize2, Loader2, Bot, User, MessageSquare } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AIAgentSidebarProps {
  currentDocType: string
  onDocumentGenerated: (content: any) => void
  isOpen: boolean
  onToggle: (open: boolean) => void
}

export function AIAgentSidebar({ currentDocType, onDocumentGenerated, isOpen, onToggle, initialContext }: AIAgentSidebarProps & { initialContext?: any }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `您好！我是您的智能商務助手。🚀

我可以幫您：
1. **秒速生成**: 只要說“幫我寫一份網頁開發的報價單”，我就能為您擬好草稿。
2. **精確修改**: 生成後如果不滿意，您可以說“把價格提高10%”或“增加一項UI設計”。
3. **識別信息**: 您可以粘貼客戶的需求或發票內容，我會自動為您提取並填充。

請問您今天要處理什麼文檔？`,
    },
  ])

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          documentType: currentDocType,
          currentContext: initialContext || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const responseData = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: responseData.message,
        },
      ]);
      
      if (responseData.action === 'update_document' && responseData.data) {
        onDocumentGenerated(responseData.data);
      }
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `抱歉，我遇到了點問題: ${error.message || '請稍後再試。'}`,
        },
      ]);
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          if (typeof onToggle === 'function') {
            onToggle(true);
          }
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#6366f1] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#5658d2] transition-all z-50 group"
      >
        <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    )
  }

  return (
    <div 
      className={`fixed right-0 top-[64px] h-[calc(100vh-64px)] bg-white border-l border-[#e6e9ef] shadow-xl transition-all duration-500 ease-in-out z-40 flex flex-col ${
        isExpanded ? "w-[500px]" : "w-[400px]"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#f7f9fc] flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#6366f1]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1a1f36]">AI Intelligence</h3>
            <p className="text-[11px] text-[#4f566b] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Smart Agent Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-[#4f566b]" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-[#4f566b]" 
            onClick={() => {
              if (typeof onToggle === 'function') onToggle(false);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#fcfdfe]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                m.role === "user" ? "bg-white border-[#e6e9ef]" : "bg-[#6366f1] border-[#6366f1]"
              }`}>
                {m.role === "user" ? <User className="w-4 h-4 text-[#4f566b]" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                m.role === "user" 
                  ? "bg-white border border-[#e6e9ef] text-[#1a1f36] rounded-tr-none" 
                  : "bg-[#6366f1] text-white rounded-tl-none"
              }`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center text-[#4f566b] text-[12px] bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-100">
              <Loader2 className="w-3 h-3 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-[#f7f9fc]">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={`Draft my ${currentDocType}...`}
            className="w-full bg-[#f7f9fc] border border-[#e6e9ef] rounded-xl px-4 py-3 pr-12 text-[13px] focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] outline-none transition-all resize-none h-[100px]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 bottom-3 p-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#5658d2] disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-center text-[#a3acb9]">
          Press Enter to send. Use Shift+Enter for new line.
        </p>
      </div>
    </div>
  )
}
