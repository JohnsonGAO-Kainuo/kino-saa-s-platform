"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Crown, Zap, ArrowRight, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"

interface SubscriptionData {
  planType: 'free' | 'pro' | 'enterprise'
  documentsUsed: number
  documentsLimit: number
}

export function SubscriptionCard() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionData>({
    planType: 'free',
    documentsUsed: 0,
    documentsLimit: 2
  })

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get subscription data
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('plan_type')
          .eq('user_id', user.id)
          .single()

        // Count documents this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString())

        const planType = subData?.plan_type || 'free'
        const limit = planType === 'pro' ? 999 : planType === 'enterprise' ? 999 : 2

        setSubscription({
          planType: planType as 'free' | 'pro' | 'enterprise',
          documentsUsed: count || 0,
          documentsLimit: limit
        })
      } catch (error) {
        console.error('Error fetching subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const usagePercentage = Math.min((subscription.documentsUsed / subscription.documentsLimit) * 100, 100)
  const isPro = subscription.planType === 'pro' || subscription.planType === 'enterprise'

  if (loading) {
    return (
      <Card className="border-border shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] h-full flex flex-col bg-white items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  return (
    <Card className="border-border shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] h-full flex flex-col bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#f7f9fc] border border-border flex items-center justify-center">
              {isPro ? (
                <Zap className="w-5 h-5 text-[#6366f1]" />
              ) : (
                <Crown className="w-5 h-5 text-[#6366f1]" />
              )}
            </div>
            <div>
              <CardTitle className="text-[16px] font-semibold text-[#1a1f36]">
                {isPro ? 'Pro Plan' : t('Hobby Plan')}
              </CardTitle>
              <CardDescription className="text-[13px] text-[#4f566b]">
                {isPro ? t('Unlimited documents') : t('Free for individuals')}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[13px] font-medium">
              <span className="text-[#4f566b]">{t('Usage')}</span>
              <span className="text-[#1a1f36]">
                {subscription.documentsUsed} / {isPro ? '∞' : subscription.documentsLimit} docs
              </span>
            </div>
            {!isPro && (
              <>
                <Progress value={usagePercentage} className="h-1.5 bg-[#f7f9fc]" indicatorClassName="bg-[#6366f1]" />
                <p className="text-[12px] text-[#8792a2]">
                  {subscription.documentsLimit - subscription.documentsUsed} {t('documents remaining this month')}
                </p>
              </>
            )}
          </div>

          {!isPro && (
            <div className="space-y-3">
              <p className="text-[12px] font-semibold text-[#8792a2] uppercase tracking-wider">{t('Plan Highlights')}</p>
              <div className="space-y-2.5">
                {[
                  t("Unlimited documents"),
                  t("Custom company branding"),
                  t("Priority AI assistance"),
                  t("Advanced PDF export"),
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5 text-[13px] text-[#4f566b]">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!isPro && (
          <div className="pt-6 mt-6 border-t border-border">
            <div className="flex items-baseline justify-center gap-1 mb-4">
              <span className="text-3xl font-bold text-[#1a1f36]">$5</span>
              <span className="text-[14px] text-[#4f566b]">/month</span>
            </div>
            <Button 
              className="w-full h-10 bg-[#6366f1] hover:bg-[#5658d2] text-white font-medium shadow-sm transition-all"
              asChild
            >
              <Link href="/pricing">
                {t('Upgrade to Pro')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <p className="text-[12px] text-[#8792a2] text-center mt-3">{t('Simple pricing, cancel anytime')}</p>
          </div>
        )}

        {isPro && (
          <div className="pt-6 mt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-[#16a34a]">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Pro Plan Active</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
