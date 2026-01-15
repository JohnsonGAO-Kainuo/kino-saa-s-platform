import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Send, X, Loader2, Bot, User, Languages, History, ChevronLeft } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { toast } from "sonner"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from "@/lib/utils"

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
  docId?: string | null
  focusedField?: { id: string; name: string } | null
  onClearFocus?: () => void
  initialContext?: any
}

export function AIAgentSidebar({ 
  currentDocType, 
  onDocumentGenerated, 
  initialContext, 
  docId,
  focusedField,
  onClearFocus
}: AIAgentSidebarProps) {
  const { language, t } = useLanguage()
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

  // Handle URL Query Params for initial prompt (from Dashboard Hero)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const initialPrompt = searchParams.get('prompt');
      
      if (initialPrompt && !messages.some(m => m.role === 'user' && m.content === initialPrompt)) {
        // Clear param to prevent re-triggering
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search.replace(/[\?&]prompt=[^&]+/, '').replace(/^&/, '?');
        window.history.replaceState({}, '', newUrl);
        
        setInput(initialPrompt);
        // Small delay to ensure state is ready
        setTimeout(() => {
          handleSend(initialPrompt); 
        }, 500);
      }
    }
  }, []);

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

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return
    const userMessage = textToSend.trim()
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setInput("")
    setIsLoading(true)

    try {
      // Gather external context from LocalStorage
      const savedClients = typeof window !== 'undefined' ? localStorage.getItem('kino_clients') : null;
      const savedItems = typeof window !== 'undefined' ? localStorage.getItem('kino_items') : null;
      
      const externalContext = {
        clients: savedClients ? JSON.parse(savedClients) : [],
        items: savedItems ? JSON.parse(savedItems) : []
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: focusedField 
            ? `[Focusing on ${focusedField.name}] ${userMessage}` 
            : userMessage,
          documentType: currentDocType,
          currentContext: initialContext || null,
          externalContext, // Pass this to the API
          uiLanguage: language,
          focusedField: focusedField?.id
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

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {view === 'history' ? (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView('chat')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {view === 'history' ? t("Chat History") : t("AI Intelligence")}
            </h3>
            {view === 'chat' && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
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
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={handleTranslateContent}>
                  <Languages className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setView('history')}>
                <History className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-muted/10 p-4">
        {view === 'history' ? (
          <div className="space-y-3">
            {history.length > 0 ? history.map(session => (
              <button key={session.id} onClick={() => loadSession(session)} className={cn("w-full text-left p-4 rounded-xl border transition-all", currentSessionId === session.id ? "bg-primary/5 border-primary" : "bg-card border-border hover:border-primary/50")}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-foreground truncate pr-4">{session.title}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(session.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 italic">
                  {session.messages[session.messages.length - 1]?.content.replace(/\*\*|\*|_|#|`/g, '')}
                </p>
              </button>
            )) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <History className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">{t("No history yet")}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[90%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${m.role === "user" ? "bg-card border-border" : "bg-primary border-primary"}`}>
                    {m.role === "user" ? <User className="w-4 h-4 text-muted-foreground" /> : <Bot className="w-4 h-4 text-primary-foreground" />}
                  </div>
                  <div className={cn("p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm", m.role === "user" ? "bg-card border border-border text-foreground rounded-tr-none" : "bg-primary text-primary-foreground rounded-tl-none")}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({children}) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                        li: ({children}) => <li className="marker:text-inherit">{children}</li>,
                        strong: ({children}) => <strong className={cn("font-bold", m.role === 'assistant' ? 'text-primary-foreground/90 border-b border-primary-foreground/20' : 'text-foreground')}>{children}</strong>,
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
                <div className="flex gap-3 items-center text-muted-foreground text-xs bg-muted/50 px-3 py-1.5 rounded-full border border-border">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t("Thinking...")}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {view === 'chat' && (
        <div className="p-4 bg-card border-t border-border">
          {focusedField && (
            <div className="mb-2 flex items-center justify-between bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[11px] font-bold text-primary">
                  {t("Focusing on")}: {focusedField.name}
                </span>
              </div>
              <button 
                onClick={onClearFocus}
                className="text-primary/60 hover:text-primary transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={t("Ask AI to draft or edit...")}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 pr-12 text-[13px] focus:ring-2 focus:ring-primary/20 outline-none h-[100px] resize-none placeholder:text-muted-foreground/50"
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="absolute right-3 bottom-3 p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 shadow-sm hover:bg-primary/90 transition-colors"><Send className="w-4 h-4" /></button>
          </div>
          <p className="mt-2 text-[10px] text-center text-muted-foreground/60">{t("Press Enter to send. Use Shift+Enter for new line.")}</p>
        </div>
      )}
    </div>
  )
}
