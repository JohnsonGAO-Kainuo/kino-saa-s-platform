import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DocumentStats } from "@/components/dashboard/document-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SubscriptionCard } from "@/components/dashboard/subscription-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { DraftDocuments } from "@/components/dashboard/draft-documents"

export default function DashboardPage() {
  const mockDrafts = [
    {
      id: "draft_001",
      type: "quotation" as const,
      title: "Website Redesign - Acme Corp",
      clientName: "Acme Corporation",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-18",
      status: "draft" as const,
    },
    {
      id: "draft_002",
      type: "contract" as const,
      title: "Web Development Services Agreement",
      clientName: "TechStart Inc",
      createdAt: "2024-01-16",
      updatedAt: "2024-01-17",
      status: "draft" as const,
    },
    {
      id: "draft_003",
      type: "invoice" as const,
      title: "Invoice #2024-001",
      clientName: "Acme Corporation",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-10",
      status: "archived" as const,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section: Stats and Subscription */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <DocumentStats />
          </div>
          <div>
            <SubscriptionCard />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        <div className="mb-8">
          <DraftDocuments drafts={mockDrafts} />
        </div>

        {/* Activity Feed */}
        <div>
          <RecentActivity />
        </div>
      </main>
    </div>
  )
}
