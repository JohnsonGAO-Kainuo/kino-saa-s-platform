"use client"

import { useState } from "react"
import { Send, Loader2, Plus, Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateDocumentWithAI, type DocumentGenerationPrompt } from "@/lib/ai-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AIAgentSidebarProps {
  currentDocType: "quotation" | "invoice" | "receipt" | "contract"
  onDocumentGenerated: (content: any) => void
  companyLogo?: string
}

export function AIAgentSidebar({ currentDocType, onDocumentGenerated, companyLogo }: AIAgentSidebarProps) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError(null)
    setGeneratedContent(null)

    try {
      const generationPrompt: DocumentGenerationPrompt = {
        documentType: currentDocType,
        description: prompt,
        includeTerms: currentDocType === "quotation" || currentDocType === "contract",
      }

      const content = await generateDocumentWithAI(generationPrompt)
      setGeneratedContent(content)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate document")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyGenerated = () => {
    if (generatedContent) {
      onDocumentGenerated(generatedContent)
      setPrompt("")
      setGeneratedContent(null)
    }
  }

  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="w-96 bg-gradient-to-b from-slate-900 to-slate-800 border-l border-slate-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          AI Agent
        </h2>
        <p className="text-sm text-slate-400 mt-1">Generate {currentDocType}s with AI</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Input Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">Describe your {currentDocType}</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`E.g., "Website development service for ${currentDocType}. Include 3 pages development, testing, deployment, and 3 months support. Price should be comprehensive..."`}
            className="w-full h-24 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generate Document
              </>
            )}
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Generated Content Preview */}
        {generatedContent && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Generated Content
              </CardTitle>
              <CardDescription className="text-slate-400">Review and apply to your document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-slate-900 rounded p-3 max-h-40 overflow-y-auto">
                <pre className="text-xs text-slate-300 whitespace-pre-wrap break-words">
                  {JSON.stringify(generatedContent, null, 2)}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApplyGenerated} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Apply to Draft
                </Button>
                <Button
                  onClick={handleCopyContent}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg text-sm">
          <p className="text-xs text-blue-200 font-medium">Tips:</p>
          <ul className="text-xs text-blue-100 mt-2 space-y-1 list-disc list-inside">
            <li>Be specific about services/products</li>
            <li>Mention pricing preferences</li>
            <li>Include client type if relevant</li>
            <li>Specify any special terms needed</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
