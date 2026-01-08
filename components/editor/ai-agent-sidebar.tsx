import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Send, X, Maximize2, Minimize2, Loader2, Bot, User, MessageSquare, Languages, History, ChevronLeft } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { toast } from "sonner"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: "user" | "assistant"
  content: string
}

interface ChatSession {
  id: string
  title: string
  timestamp: number
  messages: Message[]
  docId?: string | null
}

interface AIAgentSidebarProps {
  currentDocType: string
  onDocumentGenerated: (content: any) => void
  isOpen: boolean
  onToggle: (open: boolean) => void
  onExpandChange?: (expanded: boolean) => void
  docId?: string | null
}

export function AIAgentSidebar({ currentDocType, onDocumentGenerated, isOpen, onToggle, onExpandChange, initialContext, docId }: AIAgentSidebarProps & { initialContext?: any }) {
  const { language, t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [view, setView] = useState<'chat' | 'history'>('chat')
  const [history, setHistory] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  
  const [messages, setMessages] = useState<Message[]>([])

  const welcomeMessage = t('AI Welcome Message')

  // Load overall history
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai_chat_sessions')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to load history", e)
      }
    }
  }, [])

  // Initialize/Load current session
  useEffect(() => {
    const savedHistoryStr = localStorage.getItem('ai_chat_sessions')
    const historyArr: ChatSession[] = savedHistoryStr ? JSON.parse(savedHistoryStr) : []

    if (docId) {
      // 1. Check if there's an inherited session from Dashboard
      const inheritedSessionId = localStorage.getItem('pending_session_inheritance');
      if (inheritedSessionId && docId !== 'dashboard') {
        const updatedHistory = historyArr.map(s => 
          s.id === inheritedSessionId ? { ...s, docId: docId } : s
        );
        localStorage.setItem('ai_chat_sessions', JSON.stringify(updatedHistory));
        localStorage.removeItem('pending_session_inheritance');
        
        const inheritedSession = updatedHistory.find(s => s.id === inheritedSessionId);
        if (inheritedSession) {
          setMessages(inheritedSession.messages);
          setCurrentSessionId(inheritedSession.id);
          setHistory(updatedHistory);
          return;
        }
      }

      // 2. Find session for this specific document
      const existingSession = historyArr.find(s => s.docId === docId)
      if (existingSession) {
        setMessages(existingSession.messages)
        setCurrentSessionId(existingSession.id)
        return
      }
      
      // 3. If we are on dashboard, check if there's a dashboard session
      if (docId === 'dashboard') {
        const dashboardSession = historyArr.find(s => s.docId === 'dashboard')
        if (dashboardSession) {
          setMessages(dashboardSession.messages)
          setCurrentSessionId(dashboardSession.id)
          return
        }
      }
    }

    // Create new session if none found
    const newId = Date.now().toString()
    const newSession: ChatSession = {
      id: newId,
      title: t("New Chat"),
      timestamp: Date.now(),
      messages: [{ role: "assistant", content: welcomeMessage }],
      docId: docId
    }
    setMessages(newSession.messages)
    setCurrentSessionId(newId)
    
    const newHistory = [newSession, ...historyArr]
    setHistory(newHistory)
    localStorage.setItem('ai_chat_sessions', JSON.stringify(newHistory))
  }, [docId])

  // Update history when messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      const savedHistoryStr = localStorage.getItem('ai_chat_sessions')
      const historyArr: ChatSession[] = savedHistoryStr ? JSON.parse(savedHistoryStr) : []
      
      const updatedHistory = historyArr.map(s => 
        s.id === currentSessionId ? { ...s, messages, timestamp: Date.now() } : s
      )
      
      setHistory(updatedHistory)
      localStorage.setItem('ai_chat_sessions', JSON.stringify(updatedHistory))
    }
  }, [messages, currentSessionId])

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, view])

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages)
    setCurrentSessionId(session.id)
    setView('chat')
  }

  const handleTranslateContent = async () => {
    if (!initialContext || isLoading) return
    setIsLoading(true)
    const targetLang = language === 'en' ? 'Traditional Chinese (Hong Kong)' : 'English'
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Translate the entire document content to ${targetLang}.`,
          documentType: currentDocType,
          currentContext: initialContext
        })
      });
      const responseData = await response.json()
      if (responseData.action === 'update_document' && responseData.data) {
        onDocumentGenerated(responseData.data)
        setMessages(prev => [...prev, { role: "assistant", content: t("Translated!") }])
      }
    } catch (e) {
      toast.error("Translation failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const userMessage = input.trim()
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          documentType: currentDocType,
          currentContext: initialContext || null,
          uiLanguage: language
        })
      });

      const responseData = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: responseData.message }]);
      
      if (responseData.action === 'update_document' && responseData.data) {
        if (docId === 'dashboard' && currentSessionId) {
          localStorage.setItem('pending_session_inheritance', currentSessionId);
        }
        onDocumentGenerated(responseData.data);
      } else if (responseData.action === 'navigate_to_editor') {
        if (docId === 'dashboard' && currentSessionId) {
          localStorage.setItem('pending_session_inheritance', currentSessionId);
        }
        if (responseData.data) {
          onDocumentGenerated(responseData.data);
        } else if (initialContext) {
          onDocumentGenerated(initialContext);
        } else {
          onDocumentGenerated({});
        }
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false)
    }
  }

  const handleExpandToggle = () => {
    const nextState = !isExpanded
    setIsExpanded(nextState)
    onExpandChange?.(nextState)
  }

  return (
    <>
      {/* Floating Toggle Button (Visible when closed) */}
      {!isOpen && (
        <Button
          onClick={() => onToggle(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#6366f1] text-white shadow-2xl hover:bg-[#5658d2] z-50 group transition-all hover:scale-110 active:scale-95"
          size="icon"
        >
          <div className="relative">
            <Bot className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#6366f1] animate-pulse" />
          </div>
          <span className="absolute right-16 bg-white text-[#1a1f36] px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl border border-[#e6e9ef] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            {t("Need help? Ask AI", "需要幫助？問問 AI")}
          </span>
        </Button>
      )}

      {/* Sidebar Container */}
      <div className={`fixed right-0 top-[64px] h-[calc(100vh-64px)] bg-white border-l border-[#e6e9ef] shadow-xl transition-all duration-500 ease-in-out z-40 flex flex-col ${isExpanded ? "w-full md:w-[500px]" : "w-full md:w-[400px]"} ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-4 border-b border-[#f7f9fc] flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          {view === 'history' ? (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView('chat')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#6366f1]" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-[#1a1f36]">
              {view === 'history' ? t("Chat History") : t("AI Intelligence")}
            </h3>
            {view === 'chat' && (
              <p className="text-[11px] text-[#4f566b] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                {t("Smart Agent Active")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {view === 'chat' && (
            <>
              {initialContext && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#6366f1]" onClick={handleTranslateContent}>
                  <Languages className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4f566b]" onClick={() => setView('history')}>
                <History className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4f566b]" onClick={handleExpandToggle}>
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4f566b]" onClick={() => onToggle(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#fcfdfe]">
        {view === 'history' ? (
          <div className="p-4 space-y-3">
            {history.length > 0 ? history.map(session => (
              <button key={session.id} onClick={() => loadSession(session)} className={`w-full text-left p-4 rounded-xl border transition-all ${currentSessionId === session.id ? "bg-[#6366f1]/5 border-[#6366f1]" : "bg-white border-[#e6e9ef] hover:border-[#6366f1]"}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[14px] font-bold text-[#1a1f36] truncate pr-4">{session.title}</span>
                  <span className="text-[10px] text-[#a3acb9]">{new Date(session.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-[12px] text-[#4f566b] line-clamp-2 italic">
                  {session.messages[session.messages.length - 1]?.content.replace(/\*\*|\*|_|#|`/g, '')}
                </p>
              </button>
            )) : (
              <div className="flex flex-col items-center justify-center py-20 text-[#a3acb9]">
                <History className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">{t("No history yet")}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${m.role === "user" ? "bg-white border-[#e6e9ef]" : "bg-[#6366f1] border-[#6366f1]"}`}>
                    {m.role === "user" ? <User className="w-4 h-4 text-[#4f566b]" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${m.role === "user" ? "bg-white border-[#e6e9ef] text-[#1a1f36] rounded-tr-none" : "bg-[#6366f1] text-white rounded-tl-none"}`}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({children}) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                        li: ({children}) => <li className="marker:text-inherit">{children}</li>,
                        strong: ({children}) => <strong className={`font-bold ${m.role === 'assistant' ? 'text-white border-b border-white/20' : 'text-[#1a1f36]'}`}>{children}</strong>,
                        code: ({children}) => <code className="bg-black/10 px-1 rounded font-mono text-[11px]">{children}</code>
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 items-center text-[#4f566b] text-[12px] bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-100">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t("Thinking...")}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {view === 'chat' && (
        <div className="p-4 bg-white border-t border-[#f7f9fc]">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={t("Ask AI to draft or edit...")}
              className="w-full bg-[#f7f9fc] border border-[#e6e9ef] rounded-xl px-4 py-3 pr-12 text-[13px] focus:ring-2 focus:ring-[#6366f1]/20 outline-none h-[100px] resize-none"
            />
            <button onClick={handleSend} disabled={!input.trim() || isLoading} className="absolute right-3 bottom-3 p-2 bg-[#6366f1] text-white rounded-lg disabled:bg-slate-200 shadow-sm"><Send className="w-4 h-4" /></button>
          </div>
          <p className="mt-2 text-[10px] text-center text-[#a3acb9]">{t("Press Enter to send. Use Shift+Enter for new line.")}</p>
        </div>
      )}
    </div>
    </>
  )
}
