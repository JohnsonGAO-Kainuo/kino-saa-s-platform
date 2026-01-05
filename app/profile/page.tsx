"use client"

import React, { useEffect, useState } from 'react'
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { toast } from 'sonner'
import { Loader2, UserCircle, Building2, CreditCard, Paintbrush, Save, Upload, X, Check, Image as ImageIcon, ArrowLeft, Plus, Star, Trash2, Edit2 } from 'lucide-react'
import { removeImageBackground, dataURLtoFile } from '@/lib/image-utils'
import { getUserAssets, uploadAsset, setDefaultAsset, deleteAsset, renameAsset, type UserAsset } from '@/lib/asset-management'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

export default function ProfilePage() {
  const { user } = useAuth()
  const { t } = useLanguage()
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
    paypal_email: '',
    default_payment_notes: '',
    default_contract_terms: '',
    default_invoice_notes: '',
  })

  // Asset management states
  const [logos, setLogos] = useState<UserAsset[]>([])
  const [signatures, setSignatures] = useState<UserAsset[]>([])
  const [stamps, setStamps] = useState<UserAsset[]>([])
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadType, setUploadType] = useState<'logo' | 'signature' | 'stamp'>('logo')
  const [newAssetName, setNewAssetName] = useState('')
  const [newAssetFile, setNewAssetFile] = useState<File | null>(null)
  const [setAsDefault, setSetAsDefault] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSettings()
      fetchAssets()
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
      toast.error(t('Failed to load profile', '載入資料失敗'))
    } finally {
      setLoading(false)
    }
  }

  async function fetchAssets() {
    if (!user) return
    const [logosData, signaturesData, stampsData] = await Promise.all([
      getUserAssets(user.id, 'logo'),
      getUserAssets(user.id, 'signature'),
      getUserAssets(user.id, 'stamp'),
    ])
    setLogos(logosData)
    setSignatures(signaturesData)
    setStamps(stampsData)
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
      toast.success(t('Profile updated successfully!', '資料已更新！'))
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleUploadAsset() {
    if (!newAssetFile || !newAssetName || !user) return

    setUploading(prev => ({ ...prev, [uploadType]: true }))
    try {
      let fileToUpload = newAssetFile
      
      // Apply background removal for signatures and stamps
      if (uploadType === 'signature' || uploadType === 'stamp') {
        const transparentDataUrl = await removeImageBackground(newAssetFile)
        fileToUpload = dataURLtoFile(transparentDataUrl, `${uploadType}.png`)
      }

      const result = await uploadAsset(user.id, fileToUpload, uploadType, newAssetName, setAsDefault)
      
      if (result) {
        toast.success(t('Asset uploaded successfully!', '資產已上傳！'))
        await fetchAssets()
        setUploadDialogOpen(false)
        setNewAssetName('')
        setNewAssetFile(null)
        setSetAsDefault(true)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error: any) {
      toast.error(t('Upload failed', '上傳失敗'))
    } finally {
      setUploading(prev => ({ ...prev, [uploadType]: false }))
    }
  }

  async function handleSetDefault(assetId: string, assetType: 'logo' | 'signature' | 'stamp') {
    if (!user) return
    const success = await setDefaultAsset(user.id, assetId, assetType)
    if (success) {
      toast.success(t('Default asset updated', '預設資產已更新'))
      await fetchAssets()
    } else {
      toast.error(t('Failed to update default', '更新失敗'))
    }
  }

  async function handleDelete(assetId: string) {
    if (!user) return
    const success = await deleteAsset(user.id, assetId)
    if (success) {
      toast.success(t('Asset deleted', '資產已刪除'))
      await fetchAssets()
    } else {
      toast.error(t('Failed to delete', '刪除失敗'))
    }
  }

  const AssetGallery = ({ assets, type }: { assets: UserAsset[], type: 'logo' | 'signature' | 'stamp' }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {assets.map((asset) => (
        <div key={asset.id} className="relative group border-2 border-border rounded-xl p-4 bg-white hover:border-[#6366f1] transition-all">
          <div className="aspect-square bg-slate-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
            <img src={asset.asset_url} alt={asset.asset_name} className="max-w-full max-h-full object-contain" />
          </div>
          <p className="text-xs font-medium text-gray-900 truncate mb-2">{asset.asset_name}</p>
          
          <div className="flex items-center gap-1">
            {asset.is_default ? (
              <div className="flex items-center gap-1 text-[10px] text-[#16a34a] bg-green-50 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-current" />
                {t('Default', '預設')}
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSetDefault(asset.id, type)}
                className="text-[10px] h-6 px-2"
              >
                <Star className="w-3 h-3 mr-1" />
                {t('Set Default', '設為預設')}
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(asset.id)}
              className="text-[10px] h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ))}
      
      <button
        onClick={() => {
          setUploadType(type)
          setUploadDialogOpen(true)
        }}
        className="border-2 border-dashed border-border rounded-xl p-4 bg-slate-50 hover:border-[#6366f1] hover:bg-[#6366f1]/5 transition-all flex flex-col items-center justify-center aspect-square"
      >
        <Plus className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-xs font-medium text-gray-600">{t('Add New', '新增')}</span>
      </button>
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
      
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-border flex items-center justify-center shrink-0">
              <UserCircle className="w-8 h-8 text-[#6366f1]" />
            </div>
            <div>
              <Link href="/" className="flex items-center gap-2 text-[#4f566b] hover:text-[#1a1f36] text-xs mb-1 transition-colors">
                <ArrowLeft className="w-3 h-3" />
                {t('Back to Dashboard', '返回主頁')}
              </Link>
              <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight leading-none">{t('Business Profile', '企業資料')}</h1>
              <p className="text-[#4f566b] text-sm mt-1">{user?.email}</p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#6366f1] hover:bg-[#5658d2] text-white gap-2 shadow-sm h-10 px-6"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t('Save Changes', '保存變更')}
          </Button>
        </div>

        <div className="space-y-8">
          {/* Company Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#4f566b] mb-2 px-1">
              <Building2 className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">{t('Business Identity', '企業身份')}</h2>
            </div>
            <Card className="border-border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">{t('Registered Business Name', '註冊企業名稱')}</Label>
                    <Input 
                      value={settings.company_name}
                      onChange={e => setSettings({...settings, company_name: e.target.value})}
                      placeholder={t('e.g. Kainuo Innovision Ltd', '例如：凱諾創新科技有限公司')}
                      className="border-[#e6e9ef] h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">{t('Business Email (Public)', '企業電郵（公開）')}</Label>
                    <Input 
                      value={settings.company_email}
                      onChange={e => setSettings({...settings, company_email: e.target.value})}
                      placeholder="contact@yourbusiness.com"
                      className="border-[#e6e9ef] h-10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-[#1a1f36]">{t('Official Business Address', '企業註冊地址')}</Label>
                  <Textarea 
                    value={settings.company_address}
                    onChange={e => setSettings({...settings, company_address: e.target.value})}
                    placeholder={t('This address will appear on all documents', '此地址將顯示在所有文件上')}
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
              <h2 className="text-sm font-semibold uppercase tracking-wider">{t('Default Payment Methods', '預設付款方式')}</h2>
            </div>
            <Card className="border-border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">{t('Bank Name', '銀行名稱')}</Label>
                    <Input value={settings.bank_name} onChange={e => setSettings({...settings, bank_name: e.target.value})} placeholder={t('e.g. HSBC Hong Kong', '例如：香港匯豐銀行')} className="border-[#e6e9ef] h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">{t('Account Number', '帳戶號碼')}</Label>
                    <Input value={settings.account_number} onChange={e => setSettings({...settings, account_number: e.target.value})} placeholder="123-456789-001" className="border-[#e6e9ef] h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">{t('FPS ID / Identifier', 'FPS 識別碼')}</Label>
                    <Input value={settings.fps_id} onChange={e => setSettings({...settings, fps_id: e.target.value})} placeholder={t('Mobile or Email', '手機號碼或電郵')} className="border-[#e6e9ef] h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">{t('SWIFT / BIC Code', 'SWIFT / BIC 代碼')}</Label>
                    <Input value={settings.swift_code} onChange={e => setSettings({...settings, swift_code: e.target.value})} placeholder={t('Optional for international', '國際轉賬選填')} className="border-[#e6e9ef] h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">PayPal {t('Email', '電郵')}</Label>
                    <Input value={settings.paypal_email} onChange={e => setSettings({...settings, paypal_email: e.target.value})} placeholder="payments@company.com" className="border-[#e6e9ef] h-10" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#e6e9ef] space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">{t('Default Contract Terms', '預設合同條款')}</Label>
                    <Textarea 
                      value={settings.default_contract_terms}
                      onChange={e => setSettings({...settings, default_contract_terms: e.target.value})}
                      placeholder={t('Standard terms and conditions for contracts', '合同的標準條款和條件')}
                      className="border-[#e6e9ef] min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-[#1a1f36]">{t('Default Invoice Notes', '預設發票備註')}</Label>
                    <Textarea 
                      value={settings.default_invoice_notes}
                      onChange={e => setSettings({...settings, default_invoice_notes: e.target.value})}
                      placeholder={t('Standard notes for invoices (e.g., payment instructions)', '發票的標準備註（例如付款說明）')}
                      className="border-[#e6e9ef] min-h-[80px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Asset Library */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#4f566b] mb-2 px-1">
              <Paintbrush className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">{t('Asset Library', '資產庫')}</h2>
            </div>
            
            {/* Logos */}
            <Card className="border-border shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-[#1a1f36]">{t('Company Logos', '公司標誌')}</CardTitle>
              </CardHeader>
              <CardContent>
                <AssetGallery assets={logos} type="logo" />
              </CardContent>
            </Card>

            {/* Signatures */}
            <Card className="border-border shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-[#1a1f36]">{t('Digital Signatures', '數位簽名')}</CardTitle>
              </CardHeader>
              <CardContent>
                <AssetGallery assets={signatures} type="signature" />
              </CardContent>
            </Card>

            {/* Stamps */}
            <Card className="border-border shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-[#1a1f36]">{t('Company Stamps', '公司印章')}</CardTitle>
              </CardHeader>
              <CardContent>
                <AssetGallery assets={stamps} type="stamp" />
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Upload New Asset', '上傳新資產')}</DialogTitle>
            <DialogDescription>
              {t('Add a new', '新增')} {uploadType} {t('to your asset library', '到您的資產庫')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('Asset Name', '資產名稱')}</Label>
              <Input
                value={newAssetName}
                onChange={e => setNewAssetName(e.target.value)}
                placeholder={t('e.g. Primary Logo', '例如：主要標誌')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Upload File', '上傳檔案')}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={e => setNewAssetFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="setDefault"
                checked={setAsDefault}
                onChange={e => setSetAsDefault(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="setDefault" className="text-sm cursor-pointer">
                {t('Set as default', '設為預設')}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              {t('Cancel', '取消')}
            </Button>
            <Button 
              onClick={handleUploadAsset}
              disabled={!newAssetFile || !newAssetName || uploading[uploadType]}
              className="bg-[#6366f1] hover:bg-[#5658d2]"
            >
              {uploading[uploadType] ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              {t('Upload', '上傳')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
