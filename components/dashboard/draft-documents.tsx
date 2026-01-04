"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Plus, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DraftDoc {
  id: string
  type: "quotation" | "invoice" | "receipt" | "contract"
  title: string
  clientName: string
  createdAt: string
  updatedAt: string
  status: "draft" | "sent" | "archived"
}

interface DraftDocumentsProps {
  drafts: DraftDoc[]
}

export function DraftDocuments({ drafts }: DraftDocumentsProps) {
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null)

  const activeDrafts = drafts.filter((d) => d.status === "draft")

  return (
    <div className="space-y-6">
      {/* Active Drafts */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
          <div>
            <CardTitle className="text-base font-semibold">Drafts</CardTitle>
          </div>
          <Link href="/editor?type=quotation">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {activeDrafts.length > 0 ? (
            <div className="divide-y divide-border/50">
              {activeDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="group flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedDraft(draft.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground text-sm truncate">
                        {draft.title || "Untitled Document"}
                      </h3>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-medium capitalize">
                        {draft.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last edited {new Date(draft.updatedAt).toLocaleDateString()} • {draft.clientName}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Link href={`/editor?type=${draft.type}&id=${draft.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-primary">
                        Edit
                      </Button>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No drafts found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
