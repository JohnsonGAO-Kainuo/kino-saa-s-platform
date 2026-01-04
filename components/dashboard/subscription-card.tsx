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
    <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-yellow-500/10 border-amber-500/30 h-full flex flex-col relative overflow-hidden shadow-lg">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-400/20 to-amber-500/20 rounded-full blur-2xl" />

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Free Plan</CardTitle>
              <CardDescription className="text-xs">Upgrade to unlock more</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between relative z-10">
        {/* Usage Stats */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Documents Used</span>
              <span className="text-sm font-bold text-amber-600">
                {documentsUsed} / {documentsLimit}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" indicatorClassName="bg-gradient-to-r from-amber-500 to-orange-600" />
            <p className="text-xs text-muted-foreground mt-1.5">
              {documentsLimit - documentsUsed} documents remaining
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pro Features</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-sm text-muted-foreground">Unlimited documents</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-sm text-muted-foreground">Custom branding</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-sm text-muted-foreground">Priority AI generation</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-sm text-muted-foreground">Email sending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="border-t border-amber-500/20 pt-4 space-y-3">
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                $5
              </span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cancel anytime</p>
          </div>
          <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all group">
            Upgrade to Pro
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
