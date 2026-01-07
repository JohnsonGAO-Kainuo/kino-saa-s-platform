"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { toast } from 'sonner'
import { Loader2, UserCircle, Building2, CreditCard, Paintbrush, Save, Upload, Plus, Star, Trash2, Image as ImageIcon, CheckCircle2 } from 'lucide-react'
import { removeImageBackground, dataURLtoFile } from '@/lib/image-utils'
import { getUserAssets, uploadAsset, setDefaultAsset, deleteAsset, type UserAsset } from '@/lib/asset-management'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
      console.error(error)
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

  const AssetCard = ({ asset, type }: { asset: UserAsset, type: 'logo' | 'signature' | 'stamp' }) => (
    <div className={`relative group border rounded-xl p-3 bg-white transition-all ${asset.is_default ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}>
      <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden p-2 relative">
        <img src={asset.asset_url} alt={asset.asset_name} className="max-w-full max-h-full object-contain" />
        {asset.is_default && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-700 truncate max-w-[100px]">{asset.asset_name}</p>
        <div className="flex gap-1">
          {!asset.is_default && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-gray-400 hover:text-blue-600"
              onClick={() => handleSetDefault(asset.id, type)}
              title="Set Default"
            >
              <Star className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-gray-400 hover:text-red-600"
            onClick={() => handleDelete(asset.id)}
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )

  const EmptyUploadCard = ({ type, label }: { type: 'logo' | 'signature' | 'stamp', label: string }) => (
    <div 
      onClick={() => {
        setUploadType(type)
        setUploadDialogOpen(true)
      }}
      className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center cursor-pointer min-h-[160px]"
    >
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
        <Upload className="w-5 h-5 text-gray-400" />
      </div>
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-xs text-gray-400 mt-1">{t('Drag & Drop or Click', '拖放或點擊')}</span>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Get default assets for display in Identity Section
  const defaultLogo = logos.find(a => a.is_default) || logos[0]
  const defaultSignature = signatures.find(a => a.is_default) || signatures[0]
  const defaultStamp = stamps.find(a => a.is_default) || stamps[0]

  return (
    <div className="min-h-screen bg-[#f7f9fc] p-8 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('Business Profile', '企業資料')}</h1>
            <p className="text-gray-500 mt-1">{t('Manage your business identity and assets', '管理您的企業身份與資產')}</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {t('Save Changes', '保存變更')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Business Identity Card */}
            <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-base font-bold text-gray-800">{t('Business Identity', '企業身份')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {/* Visual Identity Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Logo Area (Large) */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-500 uppercase">{t('Company Logo', '企業標誌')}</Label>
                    {defaultLogo ? (
                      <div className="relative group border rounded-xl p-6 bg-gray-50 flex items-center justify-center min-h-[200px]">
                        <img src={defaultLogo.asset_url} alt="Logo" className="max-w-full max-h-[160px] object-contain" />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl cursor-pointer"
                             onClick={() => { setUploadType('logo'); setUploadDialogOpen(true); }}>
                           <span className="bg-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">{t('Change', '更換')}</span>
                        </div>
                      </div>
                    ) : (
                      <EmptyUploadCard type="logo" label={t('Upload Logo', '上傳標誌')} />
                    )}
                  </div>

                  {/* Signature & Stamp (Stacked) */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-gray-500 uppercase">{t('Authorized Signature', '授權簽名')}</Label>
                      {defaultSignature ? (
                        <div className="relative group border rounded-xl p-4 bg-gray-50 flex items-center justify-center h-[90px]">
                          <img src={defaultSignature.asset_url} alt="Sig" className="max-w-full max-h-full object-contain" />
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl cursor-pointer"
                               onClick={() => { setUploadType('signature'); setUploadDialogOpen(true); }}>
                             <span className="bg-white px-2 py-1 rounded-full text-[10px] font-medium shadow-sm">{t('Change', '更換')}</span>
                          </div>
                        </div>
                      ) : (
                         <div 
                          onClick={() => { setUploadType('signature'); setUploadDialogOpen(true); }}
                          className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center cursor-pointer h-[90px]"
                        >
                          <span className="text-xs font-medium text-gray-500">+ {t('Upload Signature', '上傳簽名')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-gray-500 uppercase">{t('Company Stamp', '公司印章')}</Label>
                      {defaultStamp ? (
                        <div className="relative group border rounded-xl p-4 bg-gray-50 flex items-center justify-center h-[90px]">
                          <img src={defaultStamp.asset_url} alt="Stamp" className="max-w-full max-h-full object-contain" />
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl cursor-pointer"
                               onClick={() => { setUploadType('stamp'); setUploadDialogOpen(true); }}>
                             <span className="bg-white px-2 py-1 rounded-full text-[10px] font-medium shadow-sm">{t('Change', '更換')}</span>
                          </div>
                        </div>
                      ) : (
                         <div 
                          onClick={() => { setUploadType('stamp'); setUploadDialogOpen(true); }}
                          className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all flex flex-col items-center justify-center cursor-pointer h-[90px]"
                        >
                          <span className="text-xs font-medium text-gray-500">+ {t('Upload Stamp', '上傳印章')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Text Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                  <div className="space-y-2">
                    <Label>{t('Company Name', '公司名稱')}</Label>
                    <Input value={settings.company_name} onChange={e => setSettings({...settings, company_name: e.target.value})} className="bg-gray-50/50 border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('Email', '電郵')}</Label>
                    <Input value={settings.company_email} onChange={e => setSettings({...settings, company_email: e.target.value})} className="bg-gray-50/50 border-gray-200" />
                  </div>
                  <div className="col-span-full space-y-2">
                    <Label>{t('Address', '地址')}</Label>
                    <Textarea value={settings.company_address} onChange={e => setSettings({...settings, company_address: e.target.value})} className="bg-gray-50/50 border-gray-200 min-h-[80px]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset Library Tabs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#4f566b] px-1">
                <Paintbrush className="w-4 h-4" />
                <h2 className="text-sm font-semibold uppercase tracking-wider">{t('Asset Library', '資產庫')}</h2>
              </div>
              <Tabs defaultValue="logos" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4 bg-white border border-gray-100 p-1 h-auto rounded-xl">
                  <TabsTrigger value="logos" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 font-medium py-2">{t('Logos', '標誌')}</TabsTrigger>
                  <TabsTrigger value="signatures" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 font-medium py-2">{t('Signatures', '簽名')}</TabsTrigger>
                  <TabsTrigger value="stamps" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 font-medium py-2">{t('Stamps', '印章')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="logos" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {logos.map(asset => <AssetCard key={asset.id} asset={asset} type="logo" />)}
                    <EmptyUploadCard type="logo" label="Add Logo" />
                  </div>
                </TabsContent>
                <TabsContent value="signatures" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {signatures.map(asset => <AssetCard key={asset.id} asset={asset} type="signature" />)}
                    <EmptyUploadCard type="signature" label="Add Signature" />
                  </div>
                </TabsContent>
                <TabsContent value="stamps" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stamps.map(asset => <AssetCard key={asset.id} asset={asset} type="stamp" />)}
                    <EmptyUploadCard type="stamp" label="Add Stamp" />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Sidebar (4 cols) - Payment & Settings */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-base font-bold text-gray-800">{t('Payment Methods', '付款方式')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase font-bold">{t('Bank Name', '銀行名稱')}</Label>
                  <Input value={settings.bank_name} onChange={e => setSettings({...settings, bank_name: e.target.value})} className="bg-gray-50/50 border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase font-bold">{t('Account Number', '帳戶號碼')}</Label>
                  <Input value={settings.account_number} onChange={e => setSettings({...settings, account_number: e.target.value})} className="bg-gray-50/50 border-gray-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase font-bold">FPS ID</Label>
                  <Input value={settings.fps_id} onChange={e => setSettings({...settings, fps_id: e.target.value})} className="bg-gray-50/50 border-gray-200" />
                </div>
                <div className="space-y-2">
                   <Label className="text-xs text-gray-500 uppercase font-bold">PayPal</Label>
                   <Input value={settings.paypal_email} onChange={e => setSettings({...settings, paypal_email: e.target.value})} className="bg-gray-50/50 border-gray-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-500" />
                  <CardTitle className="text-base font-bold text-gray-800">{t('Defaults', '預設內容')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase font-bold">{t('Invoice Notes', '發票備註')}</Label>
                  <Textarea value={settings.default_invoice_notes} onChange={e => setSettings({...settings, default_invoice_notes: e.target.value})} className="bg-gray-50/50 border-gray-200 min-h-[80px] text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500 uppercase font-bold">{t('Contract Terms', '合同條款')}</Label>
                  <Textarea value={settings.default_contract_terms} onChange={e => setSettings({...settings, default_contract_terms: e.target.value})} className="bg-gray-50/50 border-gray-200 min-h-[80px] text-xs" />
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

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
