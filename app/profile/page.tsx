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
import { Loader2, Building2, CreditCard, Paintbrush, Save, Upload, Star, Trash2, CheckCircle2, Plus } from 'lucide-react'
import { removeImageBackground, dataURLtoFile } from '@/lib/image-utils'
import { getUserAssets, uploadAsset, setDefaultAsset, deleteAsset, type UserAsset } from '@/lib/asset-management'
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
    <div className={`relative group border rounded-[18px] p-4 bg-card transition-all duration-300 ${asset.is_default ? 'border-primary ring-1 ring-primary shadow-md' : 'border-border hover:border-primary/30 hover:shadow-lg'}`}>
      <div className="aspect-video bg-secondary/30 rounded-[12px] flex items-center justify-center mb-3 overflow-hidden p-2 relative">
        <img src={asset.asset_url} alt={asset.asset_name} className="max-w-full max-h-full object-contain" />
        {asset.is_default && (
          <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground truncate max-w-[100px]">{asset.asset_name}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!asset.is_default && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-primary rounded-lg"
              onClick={() => handleSetDefault(asset.id, type)}
              title="Set Default"
            >
              <Star className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-lg"
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
      className="border-2 border-dashed border-border rounded-[18px] p-4 bg-secondary/10 hover:bg-primary/5 hover:border-primary/30 transition-all flex flex-col items-center justify-center cursor-pointer min-h-[160px] group"
    >
      <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform border border-border">
        <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground mt-1">{t('Drag & Drop or Click', '拖放或點擊')}</span>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  // Get default assets for display in Identity Section
  const defaultLogo = logos.find(a => a.is_default) || logos[0]
  const defaultSignature = signatures.find(a => a.is_default) || signatures[0]
  const defaultStamp = stamps.find(a => a.is_default) || stamps[0]

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 text-foreground">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{t('Business Profile', '企業資料')}</h1>
            <p className="text-muted-foreground text-lg mt-2">{t('Manage your business identity and assets', '管理您的企業身份與資產')}</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto h-12 px-8 rounded-[16px] text-base gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {t('Save Changes', '保存變更')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Business Identity Card */}
            <Card className="border border-border shadow-sm bg-card overflow-hidden rounded-[24px]">
              <CardHeader className="border-b border-border bg-secondary/20 pb-6 px-8 pt-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground">{t('Business Identity', '企業身份')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {/* Visual Identity Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  {/* Logo Area (Large) */}
                  <div className="space-y-4">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('Company Logo', '企業標誌')}</Label>
                    {defaultLogo ? (
                      <div className="relative group border border-border rounded-[20px] p-8 bg-secondary/5 flex items-center justify-center min-h-[220px] transition-all hover:border-primary/20 hover:shadow-md">
                        <img src={defaultLogo.asset_url} alt="Logo" className="max-w-full max-h-[160px] object-contain" />
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[20px] cursor-pointer backdrop-blur-sm"
                             onClick={() => { setUploadType('logo'); setUploadDialogOpen(true); }}>
                           <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">{t('Change', '更換')}</span>
                        </div>
                      </div>
                    ) : (
                      <EmptyUploadCard type="logo" label={t('Upload Logo', '上傳標誌')} />
                    )}
                  </div>

                  {/* Signature & Stamp (Stacked) */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('Authorized Signature', '授權簽名')}</Label>
                      {defaultSignature ? (
                        <div className="relative group border border-border rounded-[20px] p-6 bg-secondary/5 flex items-center justify-center h-[100px] transition-all hover:border-primary/20 hover:shadow-md">
                          <img src={defaultSignature.asset_url} alt="Sig" className="max-w-full max-h-full object-contain" />
                          <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[20px] cursor-pointer backdrop-blur-sm"
                               onClick={() => { setUploadType('signature'); setUploadDialogOpen(true); }}>
                             <span className="bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">{t('Change', '更換')}</span>
                          </div>
                        </div>
                      ) : (
                         <div 
                          onClick={() => { setUploadType('signature'); setUploadDialogOpen(true); }}
                          className="border-2 border-dashed border-border rounded-[20px] bg-secondary/5 hover:bg-primary/5 hover:border-primary/30 transition-all flex flex-col items-center justify-center cursor-pointer h-[100px]"
                        >
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2"><Plus className="w-3 h-3" /> {t('Upload Signature', '上傳簽名')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('Company Stamp', '公司印章')}</Label>
                      {defaultStamp ? (
                        <div className="relative group border border-border rounded-[20px] p-6 bg-secondary/5 flex items-center justify-center h-[100px] transition-all hover:border-primary/20 hover:shadow-md">
                          <img src={defaultStamp.asset_url} alt="Stamp" className="max-w-full max-h-full object-contain" />
                          <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[20px] cursor-pointer backdrop-blur-sm"
                               onClick={() => { setUploadType('stamp'); setUploadDialogOpen(true); }}>
                             <span className="bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">{t('Change', '更換')}</span>
                          </div>
                        </div>
                      ) : (
                         <div 
                          onClick={() => { setUploadType('stamp'); setUploadDialogOpen(true); }}
                          className="border-2 border-dashed border-border rounded-[20px] bg-secondary/5 hover:bg-primary/5 hover:border-primary/30 transition-all flex flex-col items-center justify-center cursor-pointer h-[100px]"
                        >
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2"><Plus className="w-3 h-3" /> {t('Upload Stamp', '上傳印章')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Text Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-border/50">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('Company Name', '公司名稱')}</Label>
                    <Input value={settings.company_name} onChange={e => setSettings({...settings, company_name: e.target.value})} className="bg-secondary/20 border-border/50 h-12 rounded-[14px]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('Email', '電郵')}</Label>
                    <Input value={settings.company_email} onChange={e => setSettings({...settings, company_email: e.target.value})} className="bg-secondary/20 border-border/50 h-12 rounded-[14px]" />
                  </div>
                  <div className="col-span-full space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('Address', '地址')}</Label>
                    <Textarea value={settings.company_address} onChange={e => setSettings({...settings, company_address: e.target.value})} className="bg-secondary/20 border-border/50 min-h-[100px] rounded-[16px] resize-none p-4 text-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset Library Tabs */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Paintbrush className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-foreground">{t('Asset Library', '資產庫')}</h2>
              </div>
              <Tabs defaultValue="logos" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-card border border-border p-1.5 h-auto rounded-[18px] shadow-sm">
                  <TabsTrigger value="logos" className="rounded-[14px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold py-2.5 transition-all">{t('Logos', '標誌')}</TabsTrigger>
                  <TabsTrigger value="signatures" className="rounded-[14px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold py-2.5 transition-all">{t('Signatures', '簽名')}</TabsTrigger>
                  <TabsTrigger value="stamps" className="rounded-[14px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold py-2.5 transition-all">{t('Stamps', '印章')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="logos" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {logos.map(asset => <AssetCard key={asset.id} asset={asset} type="logo" />)}
                    <EmptyUploadCard type="logo" label="Add Logo" />
                  </div>
                </TabsContent>
                <TabsContent value="signatures" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {signatures.map(asset => <AssetCard key={asset.id} asset={asset} type="signature" />)}
                    <EmptyUploadCard type="signature" label="Add Signature" />
                  </div>
                </TabsContent>
                <TabsContent value="stamps" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            <Card className="border border-border shadow-sm bg-card overflow-hidden rounded-[24px]">
              <CardHeader className="border-b border-border bg-secondary/20 pb-6 pt-8 px-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">{t('Payment Methods', '付款方式')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t('Bank Name', '銀行名稱')}</Label>
                  <Input value={settings.bank_name} onChange={e => setSettings({...settings, bank_name: e.target.value})} className="bg-secondary/20 border-border/50 h-11 rounded-[12px]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t('Account Number', '帳戶號碼')}</Label>
                  <Input value={settings.account_number} onChange={e => setSettings({...settings, account_number: e.target.value})} className="bg-secondary/20 border-border/50 h-11 rounded-[12px]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">FPS ID</Label>
                  <Input value={settings.fps_id} onChange={e => setSettings({...settings, fps_id: e.target.value})} className="bg-secondary/20 border-border/50 h-11 rounded-[12px]" />
                </div>
                <div className="space-y-2">
                   <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">PayPal</Label>
                   <Input value={settings.paypal_email} onChange={e => setSettings({...settings, paypal_email: e.target.value})} className="bg-secondary/20 border-border/50 h-11 rounded-[12px]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm bg-card overflow-hidden rounded-[24px]">
              <CardHeader className="border-b border-border bg-secondary/20 pb-6 pt-8 px-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Star className="w-5 h-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">{t('Defaults', '預設內容')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t('Invoice Notes', '發票備註')}</Label>
                  <Textarea value={settings.default_invoice_notes} onChange={e => setSettings({...settings, default_invoice_notes: e.target.value})} className="bg-secondary/20 border-border/50 min-h-[100px] text-xs rounded-[14px] resize-none p-3" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t('Contract Terms', '合同條款')}</Label>
                  <Textarea value={settings.default_contract_terms} onChange={e => setSettings({...settings, default_contract_terms: e.target.value})} className="bg-secondary/20 border-border/50 min-h-[100px] text-xs rounded-[14px] resize-none p-3" />
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[24px] border-border bg-card p-0 overflow-hidden">
          <DialogHeader className="bg-secondary/20 px-6 py-6 border-b border-border">
            <DialogTitle className="text-xl font-bold">{t('Upload New Asset', '上傳新資產')}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('Add a new', '新增')} {uploadType} {t('to your asset library', '到您的資產庫')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 px-6 py-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('Asset Name', '資產名稱')}</Label>
              <Input
                value={newAssetName}
                onChange={e => setNewAssetName(e.target.value)}
                placeholder={t('e.g. Primary Logo', '例如：主要標誌')}
                className="bg-secondary/20 border-border/50 h-11 rounded-[12px]"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('Upload File', '上傳檔案')}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={e => setNewAssetFile(e.target.files?.[0] || null)}
                className="bg-secondary/20 border-border/50 file:bg-primary/10 file:text-primary file:border-0 file:rounded-full file:px-4 file:mr-4 file:font-bold hover:file:bg-primary/20 transition-all rounded-[12px] h-12 pt-2"
              />
            </div>
            <div className="flex items-center space-x-3 bg-secondary/20 p-3 rounded-[12px]">
              <input
                type="checkbox"
                id="setDefault"
                checked={setAsDefault}
                onChange={e => setSetAsDefault(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="setDefault" className="text-sm font-medium cursor-pointer">
                {t('Set as default', '設為預設')}
              </Label>
            </div>
          </div>
          <DialogFooter className="bg-secondary/10 px-6 py-4 flex gap-3">
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)} className="rounded-[12px] border-border/50 h-10">
              {t('Cancel', '取消')}
            </Button>
            <Button 
              onClick={handleUploadAsset}
              disabled={!newAssetFile || !newAssetName || uploading[uploadType]}
              className="bg-primary hover:bg-primary/90 text-white rounded-[12px] h-10 px-6 shadow-md"
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
