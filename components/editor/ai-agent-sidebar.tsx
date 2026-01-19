import { useState, useRef, useEffect, useCallback } from "react"
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

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('ai_chat_sessions')
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }
  }, [])

  // Robust session initialization
  useEffect(() => {
    const savedHistoryStr = localStorage.getItem('ai_chat_sessions')
    const historyArr: ChatSession[] = savedHistoryStr ? JSON.parse(savedHistoryStr) : []

    // Try to find or inherit session
    const inheritedId = localStorage.getItem('pending_session_inheritance');
    let session = historyArr.find(s => s.docId === docId);
    
    if (inheritedId && docId !== 'dashboard') {
      const inherited = historyArr.find(s => s.id === inheritedId);
      if (inherited) {
        inherited.docId = docId;
        localStorage.setItem('ai_chat_sessions', JSON.stringify(historyArr));
        localStorage.removeItem('pending_session_inheritance');
        session = inherited;
      }
    }

    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(session.id);
    } else {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
        id: newId,
        title: t("New Chat") || "New Chat",
        timestamp: Date.now(),
        messages: [{ role: "assistant", content: welcomeMessage }],
        docId: docId
      };
      const updatedHistory = [newSession, ...historyArr];
      setHistory(updatedHistory);
      setMessages(newSession.messages);
      setCurrentSessionId(newId);
      localStorage.setItem('ai_chat_sessions', JSON.stringify(updatedHistory));
    }
  }, [docId]);

  // Sync function to save messages immediately
  const saveMessagesImmediately = useCallback((newMessages: Message[]) => {
    if (!currentSessionId) return;
    const saved = localStorage.getItem('ai_chat_sessions');
    if (!saved) return;
    const historyArr: ChatSession[] = JSON.parse(saved);
    const updated = historyArr.map(s => 
      s.id === currentSessionId ? { ...s, messages: newMessages, timestamp: Date.now() } : s
    );
    localStorage.setItem('ai_chat_sessions', JSON.stringify(updated));
    setHistory(updated);
  }, [currentSessionId]);

  const handleSend = async (overrideInput?: string) => {
    const userMessage = (overrideInput || input).trim();
    if (!userMessage || isLoading) return;

    // 1. UPDATE UI AND STORAGE IMMEDIATELY
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    saveMessagesImmediately(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const savedClients = localStorage.getItem('kino_clients');
      const savedItems = localStorage.getItem('kino_items');
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: focusedField ? `[Focusing on ${focusedField.name}] ${userMessage}` : userMessage,
          documentType: currentDocType,
          currentContext: initialContext || null,
          externalContext: {
            clients: savedClients ? JSON.parse(savedClients) : [],
            items: savedItems ? JSON.parse(savedItems) : []
          },
          uiLanguage: language,
          focusedField: focusedField?.id
        })
      });

      const responseData = await response.json();
      
      // 2. UPDATE ASSISTANT RESPONSE
      const finalMessages: Message[] = [...newMessages, { role: "assistant", content: responseData.message }];
      setMessages(finalMessages);
      saveMessagesImmediately(finalMessages);
      
      if (responseData.action === 'update_document' && responseData.data) {
        if (docId === 'dashboard' && currentSessionId) {
          localStorage.setItem('pending_session_inheritance', currentSessionId);
        }
        onDocumentGenerated(responseData.data);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (rest of the component for history view and markdown)
  // Re-writing full for brevity and to avoid issues
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
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setView('history')}>
              <History className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-muted/10 p-4">
        {view === 'history' ? (
          <div className="space-y-3">
            {history.map(session => (
              <button key={session.id} onClick={() => { setMessages(session.messages); setCurrentSessionId(session.id); setView('chat'); }} className={cn("w-full text-left p-4 rounded-xl border transition-all", currentSessionId === session.id ? "bg-primary/5 border-primary" : "bg-card border-border hover:border-primary/50")}>
                <span className="text-sm font-bold block truncate">{session.title}</span>
                <p className="text-[10px] text-muted-foreground">{new Date(session.timestamp).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[90%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${m.role === "user" ? "bg-card border-border" : "bg-primary border-primary"}`}>
                    {m.role === "user" ? <User className="w-4 h-4 text-muted-foreground" /> : <Bot className="w-4 h-4 text-primary-foreground" />}
                  </div>
                  <div className={cn("p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm", m.role === "user" ? "bg-card border border-border text-foreground rounded-tr-none" : "bg-primary text-primary-foreground rounded-tl-none")}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 items-center text-muted-foreground text-xs bg-muted/50 px-3 py-1.5 rounded-full border border-border w-fit">
                <Loader2 className="w-3 h-3 animate-spin" />
                {t("Thinking...")}
              </div>
            )}
          </div>
        )}
      </div>

      {view === 'chat' && (
        <div className="p-4 bg-card border-t border-border">
          {focusedField && (
            <div className="mb-3 flex items-center justify-between bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20">
              <span className="text-[11px] font-bold text-primary">{t("Focusing on")}: {focusedField.name}</span>
              <button onClick={onClearFocus} className="text-primary/60 hover:text-primary"><X className="w-3 h-3" /></button>
            </div>
          )}
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={t("Ask AI to draft or edit...")}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 pr-12 text-[13px] focus:ring-2 focus:ring-primary/20 outline-none h-[100px] resize-none"
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="absolute right-3 bottom-3 p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  )
}
