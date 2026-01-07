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
import { Loader2, Building2, CreditCard, Paintbrush, Save, Upload, Plus, Trash2, Star, Image as ImageIcon, PenTool, Stamp } from 'lucide-react'
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

export default function BusinessProfilePage() {
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
      // Silent error for new profiles
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
      toast.success(t('Business profile updated!', '企業資料已更新！'))
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

  const AssetCard = ({ title, icon: Icon, assets, type, onUpload }: any) => {
    const defaultAsset = assets.find((a: any) => a.is_default) || assets[0]
    
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-100/50 transition-colors relative group min-h-[200px]">
        {defaultAsset ? (
          <div className="relative w-full h-full flex flex-col items-center">
             <div className="w-full h-32 mb-2 flex items-center justify-center overflow-hidden">
                <img src={defaultAsset.asset_url} alt={defaultAsset.asset_name} className="max-w-full max-h-full object-contain" />
             </div>
             <p className="text-sm font-medium text-slate-700">{defaultAsset.asset_name}</p>
             <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
               <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(defaultAsset.id)}>
                 <Trash2 className="w-4 h-4" />
               </Button>
             </div>
             <Button variant="ghost" className="mt-2 text-[#6366f1] text-xs" onClick={onUpload}>Change</Button>
          </div>
        ) : (
          <div className="cursor-pointer" onClick={onUpload}>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Icon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
            <p className="text-xs text-slate-500">Upload or drag and drop</p>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6366f1]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#1a1f36]">
      <DashboardHeader />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <span>Company</span>
              <span className="text-slate-300">/</span>
              <span>Profile</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-[#6366f1] rounded-lg flex items-center justify-center text-white font-bold">
                 C
               </div>
               <h1 className="text-3xl font-bold tracking-tight">Business Profile</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white">Select a profile</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#6366f1] hover:bg-[#5558dd] text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Business Identity */}
        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-white">
            <CardTitle className="text-lg font-bold">Business Identity</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Logo Upload */}
              <AssetCard 
                title="Upload Logo" 
                icon={ImageIcon} 
                assets={logos} 
                type="logo" 
                onUpload={() => { setUploadType('logo'); setUploadDialogOpen(true); }}
              />
              
              {/* Signature Upload */}
              <AssetCard 
                title="Signatures" 
                icon={PenTool} 
                assets={signatures} 
                type="signature" 
                onUpload={() => { setUploadType('signature'); setUploadDialogOpen(true); }}
              />
              
              {/* Stamp Upload */}
              <AssetCard 
                title="Upload Stamp" 
                icon={Stamp} 
                assets={stamps} 
                type="stamp" 
                onUpload={() => { setUploadType('stamp'); setUploadDialogOpen(true); }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Details (Form) */}
        <Card className="border-slate-100 shadow-sm">
           <CardHeader className="border-b border-slate-50 bg-white">
            <CardTitle className="text-lg font-bold">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Registered Business Name</Label>
                <Input 
                  value={settings.company_name} 
                  onChange={e => setSettings({...settings, company_name: e.target.value})}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Business Email</Label>
                <Input 
                  value={settings.company_email} 
                  onChange={e => setSettings({...settings, company_email: e.target.value})}
                  className="bg-slate-50 border-slate-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Office Address</Label>
              <Textarea 
                value={settings.company_address} 
                onChange={e => setSettings({...settings, company_address: e.target.value})}
                className="bg-slate-50 border-slate-200 min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="border-b border-slate-50 bg-white flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Payment Methods</CardTitle>
            <Button variant="ghost" size="sm" className="text-[#6366f1]">Add New</Button>
          </CardHeader>
          <CardContent className="p-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100">
                       <Building2 className="w-5 h-5 text-slate-600" />
                     </div>
                     <div>
                       <p className="font-bold text-sm">Bank Transfer</p>
                       <p className="text-xs text-slate-400">Default Method</p>
                     </div>
                   </div>
                   <div className="space-y-3">
                     <Input 
                       placeholder="Bank Name" 
                       value={settings.bank_name} 
                       onChange={e => setSettings({...settings, bank_name: e.target.value})}
                       className="bg-white h-9 text-xs"
                     />
                     <Input 
                       placeholder="Account Number" 
                       value={settings.account_number} 
                       onChange={e => setSettings({...settings, account_number: e.target.value})}
                       className="bg-white h-9 text-xs"
                     />
                     <Input 
                       placeholder="SWIFT / BIC" 
                       value={settings.swift_code} 
                       onChange={e => setSettings({...settings, swift_code: e.target.value})}
                       className="bg-white h-9 text-xs"
                     />
                   </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100">
                       <CreditCard className="w-5 h-5 text-slate-600" />
                     </div>
                     <div>
                       <p className="font-bold text-sm">Digital Payment</p>
                       <p className="text-xs text-slate-400">FPS / PayPal</p>
                     </div>
                   </div>
                   <div className="space-y-3">
                     <Input 
                       placeholder="FPS ID" 
                       value={settings.fps_id} 
                       onChange={e => setSettings({...settings, fps_id: e.target.value})}
                       className="bg-white h-9 text-xs"
                     />
                     <Input 
                       placeholder="PayPal Email" 
                       value={settings.paypal_email} 
                       onChange={e => setSettings({...settings, paypal_email: e.target.value})}
                       className="bg-white h-9 text-xs"
                     />
                   </div>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Asset Library (Full List) */}
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="border-b border-slate-50 bg-white">
             <CardTitle className="text-lg font-bold">Asset Library</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {/* Just placeholders for the 'Full List' visual */}
               <div className="aspect-square bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#6366f1] transition-colors" onClick={() => { setUploadType('logo'); setUploadDialogOpen(true); }}>
                  <Plus className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="text-xs font-medium text-slate-500">Add Logo</span>
               </div>
               <div className="aspect-square bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#6366f1] transition-colors" onClick={() => { setUploadType('stamp'); setUploadDialogOpen(true); }}>
                  <Plus className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="text-xs font-medium text-slate-500">Add Stamp</span>
               </div>
               {/* List existing assets nicely */}
               {[...logos, ...stamps, ...signatures].slice(0, 6).map((asset) => (
                 <div key={asset.id} className="aspect-square bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-center relative group">
                    <img src={asset.asset_url} alt={asset.asset_name} className="max-w-full max-h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(asset.id)}>
                         <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

      </main>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {uploadType === 'logo' ? 'Logo' : uploadType === 'signature' ? 'Signature' : 'Stamp'}</DialogTitle>
            <DialogDescription>
              Add a new asset to your business identity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Asset Name</Label>
              <Input
                value={newAssetName}
                onChange={e => setNewAssetName(e.target.value)}
                placeholder="e.g. Primary Logo"
              />
            </div>
            <div className="space-y-2">
              <Label>File</Label>
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
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="setDefault">Set as default</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUploadAsset}
              disabled={!newAssetFile || !newAssetName || uploading[uploadType]}
              className="bg-[#6366f1] hover:bg-[#5658d2]"
            >
              {uploading[uploadType] ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

