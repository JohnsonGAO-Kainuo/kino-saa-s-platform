"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Eye, Send, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "created",
      document: "Invoice #2024-001",
      client: "Acme Corp",
      timestamp: "2 hours ago",
      icon: FileText,
      status: "draft",
    },
    {
      id: 2,
      type: "sent",
      document: "Quotation #QT-2024-045",
      client: "TechStart Inc",
      timestamp: "4 hours ago",
      icon: Send,
      status: "pending",
    },
    {
      id: 3,
      type: "paid",
      document: "Invoice #2024-002",
      client: "Design Studio",
      timestamp: "1 day ago",
      icon: CheckCircle2,
      status: "success",
    },
    {
      id: 4,
      type: "downloaded",
      document: "Receipt #RCP-2024-012",
      client: "Global Ltd",
      timestamp: "1 day ago",
      icon: Download,
      status: "neutral",
    },
    {
      id: 5,
      type: "viewed",
      document: "Contract #CT-2024-008",
      client: "StartupXYZ",
      timestamp: "2 days ago",
      icon: Eye,
      status: "neutral",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-green-600 bg-green-50"
      case "pending": return "text-blue-600 bg-blue-50"
      case "draft": return "text-gray-600 bg-gray-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs h-8">View all</Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-border/50">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 py-4 hover:bg-muted/30 transition-colors px-2 -mx-2 rounded-md">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.document}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground">
                    {activity.type} • {activity.client}
                  </p>
                </div>
              </div>

              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.timestamp}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
import { Button } from "@/components/ui/button"
