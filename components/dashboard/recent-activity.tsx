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
      color: "text-[#6366f1]",
      bg: "bg-[#f5f3ff]",
    },
    {
      id: 2,
      type: "sent",
      document: "Quotation #QT-2024-045",
      client: "TechStart Inc",
      timestamp: "4 hours ago",
      icon: Send,
      color: "text-[#2563eb]",
      bg: "bg-[#eff6ff]",
    },
    {
      id: 3,
      type: "paid",
      document: "Invoice #2024-002",
      client: "Design Studio",
      timestamp: "1 day ago",
      icon: CheckCircle2,
      color: "text-[#16a34a]",
      bg: "bg-[#f0fdf4]",
    },
    {
      id: 4,
      type: "downloaded",
      document: "Receipt #RCP-2024-012",
      client: "Global Ltd",
      timestamp: "1 day ago",
      icon: Download,
      color: "text-[#475569]",
      bg: "bg-[#f1f5f9]",
    },
    {
      id: 5,
      type: "viewed",
      document: "Contract #CT-2024-008",
      client: "StartupXYZ",
      timestamp: "2 days ago",
      icon: Eye,
      color: "text-[#475569]",
      bg: "bg-[#f1f5f9]",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[#1a1f36] uppercase tracking-wider">Recent Activity</h3>
        <Button variant="link" className="text-[#6366f1] text-[13px] h-auto p-0 font-medium">View all</Button>
      </div>
      
      <Card className="border-border shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-[#e6e9ef]">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-[#f7f9fc] transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.bg} ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1a1f36] truncate">
                    {activity.document}
                  </p>
                  <p className="text-[12px] text-[#4f566b] mt-0.5">
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} • {activity.client}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] text-[#8792a2] font-medium whitespace-nowrap">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
import { Button } from "@/components/ui/button"
