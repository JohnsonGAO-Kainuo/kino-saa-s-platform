"use client"

import { useState } from "react"
import { Send, Loader2, Plus, Copy, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateDocumentWithAI, type DocumentGenerationPrompt } from "@/lib/ai-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function AIDocumentGenerator() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [generatedType, setGeneratedType] = useState<"quotation" | "invoice" | "receipt" | "contract">("quotation")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const documentTypes: Array<"quotation" | "invoice" | "receipt" | "contract"> = [
    "quotation",
    "contract",
    "invoice",
    "receipt",
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError(null)
    setGeneratedContent(null)

    try {
      const generationPrompt: DocumentGenerationPrompt = {
        documentType: generatedType,
        description: prompt,
        includeTerms: generatedType === "quotation" || generatedType === "contract",
      }

      const content = await generateDocumentWithAI(generationPrompt)
      setGeneratedContent(content)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate document")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCreateDraft = () => {
    if (generatedContent) {
      // Store the generated content in session storage for quick access
      sessionStorage.setItem(`generated_${generatedType}`, JSON.stringify(generatedContent))
      // Redirect to editor
      window.location.href = `/editor?type=${generatedType}&prefill=true`
    }
  }

  return (
    <Card className="bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-blue-700/50 mb-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-blue-100">AI Document Generator</CardTitle>
              <CardDescription className="text-slate-400">Create professional documents in seconds</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Document Type Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Document Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {documentTypes.map((type) => (
              <button
                key={type}
                onClick={() => setGeneratedType(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  generatedType === type
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600"
                } border`}
              >
                {type === "quotation"
                  ? "Quote"
                  : type === "contract"
                    ? "Contract"
                    : type === "invoice"
                      ? "Invoice"
                      : "Receipt"}
              </button>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">Describe your {generatedType}</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`E.g., "Website development ${generatedType} for a tech startup. Include 3 pages, testing, deployment, and 3 months support. Price $5000..."`}
            className="w-full h-28 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                Generate {generatedType.charAt(0).toUpperCase() + generatedType.slice(1)}
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
              <CardDescription className="text-slate-400">Ready to create your draft</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-slate-900 rounded p-3 max-h-48 overflow-y-auto border border-slate-700">
                <pre className="text-xs text-slate-300 whitespace-pre-wrap break-words">
                  {JSON.stringify(generatedContent, null, 2)}
                </pre>
              </div>
              <div className="flex gap-2">
                <Link href={`/editor?type=${generatedType}&prefill=true`} className="flex-1">
                  <Button onClick={handleCreateDraft} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Draft
                  </Button>
                </Link>
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
        <div className="p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg text-sm">
          <p className="text-xs text-blue-200 font-medium">Tips for best results:</p>
          <ul className="text-xs text-blue-100 mt-2 space-y-1 list-disc list-inside">
            <li>Be specific about services, deliverables, and scope</li>
            <li>Mention budget, timeline, and client type if relevant</li>
            <li>Include special terms, payment conditions, or requirements</li>
            <li>The AI will intelligently generate bilingual content</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
