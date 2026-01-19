"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles, Zap, Building2, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: "$0",
    period: "forever",
    features: [
      "2 documents per month",
      "Basic AI assistance",
      "PDF export",
      "Email support",
    ],
    limitations: [
      "No custom branding",
      "Limited templates",
    ],
    cta: "Get Started",
    ctaVariant: "outline" as const,
    popular: false,
    icon: Sparkles,
  },
  {
    name: "Pro",
    description: "Best for freelancers & small teams",
    price: "$5",
    period: "per month",
    features: [
      "Unlimited documents",
      "Advanced AI assistance",
      "Custom company branding",
      "Logo, stamp & signature upload",
      "Priority PDF export",
      "All document templates",
      "Priority email support",
      "Document history & drafts",
    ],
    limitations: [],
    cta: "Upgrade to Pro",
    ctaVariant: "default" as const,
    popular: true,
    icon: Zap,
  },
  {
    name: "Enterprise",
    description: "For larger organizations",
    price: "$25",
    period: "per month",
    features: [
      "Everything in Pro",
      "Team collaboration (up to 10 users)",
      "Admin dashboard",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom contract terms",
    ],
    limitations: [],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    popular: false,
    icon: Building2,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Choose your plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={cn(
                "relative flex flex-col border-2 transition-all duration-300 hover:shadow-xl",
                plan.popular 
                  ? "border-primary shadow-lg scale-105 z-10" 
                  : "border-border hover:border-border/80"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pt-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4",
                  plan.popular ? "bg-primary/10" : "bg-secondary"
                )}>
                  <plan.icon className={cn(
                    "w-7 h-7",
                    plan.popular ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="text-center mb-8">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">/{plan.period}</span>
                </div>
                
                <div className="space-y-4 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <div key={limitation} className="flex items-start gap-3 opacity-50">
                      <div className="w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <div className="w-1.5 h-0.5 bg-muted-foreground rounded" />
                      </div>
                      <span className="text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant={plan.ctaVariant}
                  className={cn(
                    "w-full mt-8 h-12 rounded-xl font-semibold",
                    plan.popular && "bg-primary hover:bg-primary/90 text-white shadow-lg"
                  )}
                  asChild
                >
                  <Link href={plan.name === "Enterprise" ? "mailto:sales@kino.app" : "/login"}>
                    {plan.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-2">Can I switch plans later?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be 
                charged the prorated difference. When downgrading, the change takes effect at the 
                end of your billing cycle.
              </p>
            </div>
            <div className="border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground text-sm">
                We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. 
                Enterprise customers can also pay via bank transfer.
              </p>
            </div>
            <div className="border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-2">Is there a free trial for Pro?</h3>
              <p className="text-muted-foreground text-sm">
                We don't offer a free trial, but our Free plan lets you explore the platform with 
                limited features. You can upgrade to Pro anytime when you need more.
              </p>
            </div>
            <div className="border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-2">What happens to my documents if I cancel?</h3>
              <p className="text-muted-foreground text-sm">
                Your documents remain accessible even after cancellation. You can still view and 
                export them, but you won't be able to create new documents beyond the Free plan limits.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-12 bg-primary/5 rounded-3xl border border-primary/10">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of freelancers and businesses who trust Kino for their document needs.
          </p>
          <Button size="lg" className="h-12 px-8 rounded-xl" asChild>
            <Link href="/login">Start for Free</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
