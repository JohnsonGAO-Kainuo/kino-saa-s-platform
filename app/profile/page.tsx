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
import { Loader2, UserCircle, Building2, CreditCard, Paintbrush, Save, Upload, X, Check, Image as ImageIcon, ArrowLeft } from 'lucide-react'
import { removeImageBackground, dataURLtoFile } from '@/lib/image-utils'
import Link from 'next/link'

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [settings, setSettings] = useState<any>({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    bank_name: '',
    account_number: '',
    fps_id: '',
    swift_code: '',
    default_payment_notes: '',
    logo_url: '',
    signature_url: '',
    stamp_url: '',
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
      toast.error('Failed to load profile')
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
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature' | 'stamp') {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(prev => ({ ...prev, [type]: true }))
    try {
      let finalFile = file
      if (type === 'signature' || type === 'stamp') {
        const transparentDataUrl = await removeImageBackground(file)
        finalFile = dataURLtoFile(transparentDataUrl, `${type}.png`)
      }

      const fileName = `${user.id}/${type}_${Date.now()}.png`
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, finalFile, { upsert: true, contentType: 'image/png' })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(fileName)
      setSettings(prev => ({ ...prev, [`${type}_url`]: publicUrl }))
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded!`)
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`)
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }))
    }
  }

  const ImageUploadBox = ({ type, url, label }: { type: 'logo' | 'signature' | 'stamp', url: string, label: string }) => (
    <div className="space-y-2">
      <Label className="text-[13px] font-medium text-[#1a1f36]">{label}</Label>
      <div className="relative group border-2 border-dashed border-[#e6e9ef] hover:border-[#6366f1] rounded-xl p-4 transition-all bg-[#f7f9fc]">
        {url ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-full h-32 bg-white rounded-lg flex items-center justify-center p-2 shadow-inner overflow-hidden">
              <img src={url} alt={label} className="max-w-full max-h-full object-contain" />
              <button 
                onClick={() => setSettings(prev => ({ ...prev, [`${type}_url`]: '' }))}
                className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-red-50 text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-[#16a34a] font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> Ready for use
            </p>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center py-8 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#6366f1]/10 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5 text-[#6366f1]" />
            </div>
            <span className="text-[13px] font-medium text-[#1a1f36]">Upload {type}</span>
            <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, type)} disabled={uploading[type]} />
          </label>
        )}
        {uploading[type] && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <Loader2 className="w-6 h-6 animate-spin text-[#6366f1]" />
          </div>
        )}
      </div>
    </div>
  )

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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-border flex items-center justify-center shrink-0">
              <UserCircle className="w-8 h-8 text-[#6366f1]" />
            </div>
            <div>
              <Link href="/" className="flex items-center gap-2 text-[#4f566b] hover:text-[#1a1f36] text-xs mb-1 transition-colors">
                <ArrowLeft className="w-3 h-3" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight leading-none">Business Profile</h1>
              <p className="text-[#4f566b] text-sm mt-1">{user?.email}</p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#6366f1] hover:bg-[#5658d2] text-white gap-2 shadow-sm h-10 px-6"
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
              <h2 className="text-sm font-semibold uppercase tracking-wider">Business Identity</h2>
            </div>
            <Card className="border-border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">Registered Business Name</Label>
                    <Input 
                      value={settings.company_name}
                      onChange={e => setSettings({...settings, company_name: e.target.value})}
                      placeholder="e.g. Kainuo Innovision Ltd"
                      className="border-[#e6e9ef] h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">Business Email (Public)</Label>
                    <Input 
                      value={settings.company_email}
                      onChange={e => setSettings({...settings, company_email: e.target.value})}
                      placeholder="contact@yourbusiness.com"
                      className="border-[#e6e9ef] h-10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-[#1a1f36]">Official Business Address</Label>
                  <Textarea 
                    value={settings.company_address}
                    onChange={e => setSettings({...settings, company_address: e.target.value})}
                    placeholder="This address will appear on all documents"
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
              <h2 className="text-sm font-semibold uppercase tracking-wider">Default Payment Methods</h2>
            </div>
            <Card className="border-border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">Bank Name</Label>
                    <Input value={settings.bank_name} onChange={e => setSettings({...settings, bank_name: e.target.value})} placeholder="e.g. HSBC Hong Kong" className="border-[#e6e9ef] h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">Account Number</Label>
                    <Input value={settings.account_number} onChange={e => setSettings({...settings, account_number: e.target.value})} placeholder="123-456789-001" className="border-[#e6e9ef] h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">FPS ID / Identifier</Label>
                    <Input value={settings.fps_id} onChange={e => setSettings({...settings, fps_id: e.target.value})} placeholder="Mobile or Email" className="border-[#e6e9ef] h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">SWIFT / BIC Code</Label>
                    <Input value={settings.swift_code} onChange={e => setSettings({...settings, swift_code: e.target.value})} placeholder="Optional for international" className="border-[#e6e9ef] h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Branding & Assets */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#4f566b] mb-2 px-1">
              <Paintbrush className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Visual Identity</h2>
            </div>
            <Card className="border-border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ImageUploadBox type="logo" url={settings.logo_url} label="Official Logo" />
                  <ImageUploadBox type="signature" url={settings.signature_url} label="Digital Signature" />
                  <ImageUploadBox type="stamp" url={settings.stamp_url} label="Company Stamp" />
                </div>
                <div className="mt-6 pt-6 border-t border-[#f7f9fc]">
                  <div className="flex items-start gap-3 bg-[#f0f9ff] p-4 rounded-xl border border-blue-100">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-blue-900">How this works</p>
                      <p className="text-[12px] text-blue-800 leading-relaxed mt-0.5">
                        These details will be used as the default for all new documents you create. 
                        We automatically process your signature and stamp to remove white backgrounds for a professional look.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}
