"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Crown, Zap, ArrowRight } from "lucide-react"

export function SubscriptionCard() {
  const documentsUsed = 2
  const documentsLimit = 2 // Free tier limit
  const usagePercentage = (documentsUsed / documentsLimit) * 100

  return (
    <Card className="border-border shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] h-full flex flex-col bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#f7f9fc] border border-border flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#6366f1]" />
            </div>
            <div>
              <CardTitle className="text-[16px] font-semibold text-[#1a1f36]">Hobby Plan</CardTitle>
              <CardDescription className="text-[13px] text-[#4f566b]">Free for individuals</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[13px] font-medium">
              <span className="text-[#4f566b]">Usage</span>
              <span className="text-[#1a1f36]">
                {documentsUsed} / {documentsLimit} docs
              </span>
            </div>
            <Progress value={usagePercentage} className="h-1.5 bg-[#f7f9fc]" indicatorClassName="bg-[#6366f1]" />
            <p className="text-[12px] text-[#8792a2]">
              {documentsLimit - documentsUsed} documents remaining this month
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[12px] font-semibold text-[#8792a2] uppercase tracking-wider">Plan Highlights</p>
            <div className="space-y-2.5">
              {[
                "Unlimited documents",
                "Custom company branding",
                "Priority AI assistance",
                "Advanced PDF export",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-[13px] text-[#4f566b]">
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-border">
          <div className="flex items-baseline justify-center gap-1 mb-4">
            <span className="text-3xl font-bold text-[#1a1f36]">$5</span>
            <span className="text-[14px] text-[#4f566b]">/month</span>
          </div>
          <Button className="w-full h-10 bg-[#6366f1] hover:bg-[#5658d2] text-white font-medium shadow-sm transition-all">
            Upgrade to Pro
          </Button>
          <p className="text-[12px] text-[#8792a2] text-center mt-3">Simple pricing, cancel anytime</p>
        </div>
      </CardContent>
    </Card>
  )
}
