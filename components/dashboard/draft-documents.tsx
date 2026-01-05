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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[#1a1f36] uppercase tracking-wider">Recent Drafts</h3>
      </div>
      
      <Card className="border-border shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
        <CardContent className="p-0">
          {activeDrafts.length > 0 ? (
            <div className="divide-y divide-[#e6e9ef]">
              {activeDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="group flex items-center justify-between p-4 hover:bg-[#f7f9fc] transition-colors cursor-pointer"
                  onClick={() => setSelectedDraft(draft.id)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#f7f9fc] flex items-center justify-center border border-border">
                      <Edit2 className="w-4 h-4 text-[#4f566b]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-[#1a1f36] text-[15px] truncate">
                          {draft.title || "Untitled Document"}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] font-bold uppercase tracking-tight">
                          {draft.type}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#4f566b]">
                        Last edited {new Date(draft.updatedAt).toLocaleDateString()} • {draft.clientName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/editor?type=${draft.type}&id=${draft.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 px-3 text-[#6366f1] hover:text-[#5658d2] hover:bg-[#6366f1]/10 font-medium text-[13px]">
                        Resume
                      </Button>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8792a2] hover:text-[#1a1f36] hover:bg-transparent">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="text-[13px]">Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-[13px] text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-[#f7f9fc] rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-[#8792a2]" />
              </div>
              <p className="text-[#4f566b] text-sm font-medium">No drafts found.</p>
              <p className="text-[#8792a2] text-xs mt-1">Start by creating a new document above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
