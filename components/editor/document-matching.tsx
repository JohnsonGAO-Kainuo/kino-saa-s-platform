"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Link2, Unlink2 } from "lucide-react"
import type { DocumentType } from "@/lib/types"

interface LinkedDocument {
  id: string
  type: DocumentType
  title: string
  clientName: string
  createdAt: string
}

interface DocumentMatchingProps {
  currentDocument: {
    id: string
    type: DocumentType
    title: string
  }
  linkedDocuments: LinkedDocument[]
  suggestedNext: DocumentType[]
  onCreateRelated: (docType: DocumentType) => void
  onRemoveRelationship: (docId: string) => void
}

export function DocumentMatching({
  currentDocument,
  linkedDocuments,
  suggestedNext,
  onCreateRelated,
  onRemoveRelationship,
}: DocumentMatchingProps) {
  const getDocumentLabel = (type: DocumentType) => {
    switch (type) {
      case "quotation":
        return "Quotation 報價單"
      case "contract":
        return "Contract 服務協議"
      case "invoice":
        return "Invoice 發票"
      case "receipt":
        return "Receipt 收據"
    }
  }

  const getDocumentColor = (type: DocumentType) => {
    switch (type) {
      case "quotation":
        return "border-blue-500 bg-blue-500/10"
      case "contract":
        return "border-purple-500 bg-purple-500/10"
      case "invoice":
        return "border-amber-500 bg-amber-500/10"
      case "receipt":
        return "border-green-500 bg-green-500/10"
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">Document Workflow</CardTitle>
        <CardDescription>Link related documents for easy navigation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Document */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Current Document</h3>
          <div className={`border-2 rounded-lg p-4 ${getDocumentColor(currentDocument.type)}`}>
            <p className="text-xs font-semibold text-muted-foreground">{getDocumentLabel(currentDocument.type)}</p>
            <p className="text-sm font-medium text-foreground">{currentDocument.title}</p>
          </div>
        </div>

        {/* Linked Documents */}
        {linkedDocuments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Related Documents</h3>
            <div className="space-y-2">
              {linkedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{getDocumentLabel(doc.type)}</p>
                      <p className="text-sm text-foreground">{doc.title}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveRelationship(doc.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Unlink2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Next Documents */}
        {suggestedNext.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Next Steps</h3>
            <div className="grid grid-cols-2 gap-2">
              {suggestedNext.map((docType) => (
                <Button
                  key={docType}
                  onClick={() => onCreateRelated(docType)}
                  variant="outline"
                  className="gap-2 justify-start bg-transparent border-border hover:bg-accent/10 hover:border-accent"
                >
                  <Link2 className="w-4 h-4" />
                  <span className="text-xs">{getDocumentLabel(docType)}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
