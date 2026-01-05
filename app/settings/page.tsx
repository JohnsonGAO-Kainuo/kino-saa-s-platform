"use client"

import React, { useEffect, useState } from 'react'
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { Loader2, Building2, CreditCard, Paintbrush, Save } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    bank_name: '',
    account_number: '',
    fps_id: '',
    swift_code: '',
    default_payment_notes: '',
  })

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (data) setSettings(data)
    } catch (error: any) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('company_settings')
        .upsert({
          user_id: user?.id,
          ...settings,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      toast.success('Settings saved successfully!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <DashboardHeader />
      
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight">Settings</h1>
            <p className="text-[#4f566b] text-sm mt-1">Manage your company profile and payment details.</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#6366f1] hover:bg-[#5658d2] text-white gap-2 shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>

        <div className="space-y-8">
          {/* Company Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#4f566b] mb-2 px-1">
              <Building2 className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Company Information</h2>
            </div>
            <Card className="border-border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">Company Name</Label>
                    <Input 
                      value={settings.company_name}
                      onChange={e => setSettings({...settings, company_name: e.target.value})}
                      placeholder="e.g. Kainuo Innovision Ltd"
                      className="border-[#e6e9ef] focus:ring-[#6366f1]/10 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">Business Email</Label>
                    <Input 
                      value={settings.company_email}
                      onChange={e => setSettings({...settings, company_email: e.target.value})}
                      placeholder="billing@company.com"
                      className="border-[#e6e9ef] h-10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-[#1a1f36]">Office Address</Label>
                  <Textarea 
                    value={settings.company_address}
                    onChange={e => setSettings({...settings, company_address: e.target.value})}
                    placeholder="Enter your full business address"
                    className="border-[#e6e9ef] min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Payment & Bank Details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#4f566b] mb-2 px-1">
              <CreditCard className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Payment & Bank Details</h2>
            </div>
            <Card className="border-border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">Bank Name</Label>
                    <Input 
                      value={settings.bank_name}
                      onChange={e => setSettings({...settings, bank_name: e.target.value})}
                      placeholder="e.g. HSBC Hong Kong"
                      className="border-[#e6e9ef] h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">Account Number</Label>
                    <Input 
                      value={settings.account_number}
                      onChange={e => setSettings({...settings, account_number: e.target.value})}
                      placeholder="123-456789-001"
                      className="border-[#e6e9ef] h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">FPS ID / Identifier</Label>
                    <Input 
                      value={settings.fps_id}
                      onChange={e => setSettings({...settings, fps_id: e.target.value})}
                      placeholder="e.g. 12345678 or email"
                      className="border-[#e6e9ef] h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">SWIFT / BIC Code (Optional)</Label>
                    <Input 
                      value={settings.swift_code}
                      onChange={e => setSettings({...settings, swift_code: e.target.value})}
                      placeholder="e.g. HSBC HK HH XXX"
                      className="border-[#e6e9ef] h-10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-[#f7f9fc]">
                  <Label className="text-[13px] font-medium text-[#1a1f36]">Default Payment Instructions</Label>
                  <Textarea 
                    value={settings.default_payment_notes}
                    onChange={e => setSettings({...settings, default_payment_notes: e.target.value})}
                    placeholder="e.g. Please include Invoice # in transfer reference."
                    className="border-[#e6e9ef] min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Branding (Placeholder for now) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#4f566b] mb-2 px-1">
              <Paintbrush className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Branding & Assets</h2>
            </div>
            <Card className="border-border border-dashed shadow-none bg-transparent">
              <CardContent className="p-8 text-center">
                <p className="text-[#8792a2] text-sm">Logo and Stamp upload coming soon in Phase 3.</p>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}

