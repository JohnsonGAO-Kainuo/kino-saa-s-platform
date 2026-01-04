"use client"

import { Suspense } from "react"
import { EditorLayout } from "@/components/editor/editor-layout"
import { useSearchParams } from "next/navigation"

function EditorContent() {
  const searchParams = useSearchParams()
  const type = (searchParams.get("type") as "quotation" | "invoice" | "receipt" | "contract") || "quotation"

  return <EditorLayout documentType={type} />
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={<div className="w-full h-screen bg-background flex items-center justify-center">Loading editor...</div>}
    >
      <EditorContent />
    </Suspense>
  )
}
