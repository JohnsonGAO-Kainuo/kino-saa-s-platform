"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Archive, Save, Trash2, Eye } from "lucide-react"

interface DraftDocument {
  id: string
  type: string
  title: string
  lastModified: string
  clientName: string
}

interface DraftsPanelProps {
  drafts: DraftDocument[]
  onSelect: (draftId: string) => void
  onSave: () => void
  onArchive: (draftId: string) => void
  onDelete: (draftId: string) => void
}

export function DraftsPanel({ drafts, onSelect, onSave, onArchive, onDelete }: DraftsPanelProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">Drafts</CardTitle>
        <CardDescription>Save and manage your document drafts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={onSave} className="w-full gap-2 bg-accent hover:bg-accent/90">
          <Save className="w-4 h-4" />
          Save as Draft
        </Button>

        {drafts.length > 0 ? (
          <div className="space-y-2">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-accent">{draft.type.toUpperCase()}</p>
                      <p className="text-sm font-medium text-foreground">{draft.title || "Untitled"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{draft.clientName}</p>
                    <p className="text-xs text-muted-foreground">{draft.lastModified}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelect(draft.id)}
                      className="text-muted-foreground hover:text-accent"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onArchive(draft.id)}
                      className="text-muted-foreground hover:text-accent"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(draft.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No drafts yet. Create one to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
