"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, FileSignature, Receipt, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { Document } from "@/lib/types"
import Link from "next/link"

export function RecentActivity({ documents }: { documents: Document[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'quotation': return { icon: FileText, color: "text-orange-500", bg: "bg-orange-50" };
      case 'contract': return { icon: FileSignature, color: "text-emerald-500", bg: "bg-emerald-50" };
      case 'invoice': return { icon: Receipt, color: "text-purple-500", bg: "bg-purple-50" };
      default: return { icon: FileText, color: "text-blue-500", bg: "bg-blue-50" };
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wider">Recent Activity</h3>
        <Link href="/documents">
          <Button variant="link" className="text-primary text-[13px] h-auto p-0 font-medium hover:text-primary/80">View all</Button>
        </Link>
      </div>
      
      <Card className="border border-border shadow-sm bg-card overflow-hidden rounded-[22px]">
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {documents.length > 0 ? (
              documents.map((doc) => {
                const { icon: Icon, color, bg } = getIcon(doc.doc_type);
                return (
                  <Link key={doc.id} href={`/editor?type=${doc.doc_type}&id=${doc.id}`} className="block">
                    <div className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-foreground truncate">
                          {doc.title || `Untitled ${doc.doc_type}`}
                        </p>
                        <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
                          {doc.client_name || 'No client'}
                        </p>
                      </div>

                      <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

