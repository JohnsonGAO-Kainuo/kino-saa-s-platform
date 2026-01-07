"use client"

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import { toast } from 'sonner'
import { Loader2, Building2, Upload, Plus, Trash2, Star, Image as ImageIcon, Signature, Stamp, CreditCard, Layers } from 'lucide-react'
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function ProfilePage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  
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
      fetchAssets()
    }
  }, [user])

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
    setLoading(false)
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
    }
  }

  async function handleDelete(assetId: string) {
    if (!user) return
    const success = await deleteAsset(user.id, assetId)
    if (success) {
      toast.success(t('Asset deleted', '資產已刪除'))
      await fetchAssets()
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <Loader2 className="w-8 h-8 animate-spin text-[#6366f1]" />
        </div>
      </DashboardLayout>
    )
  }

  const defaultLogo = logos.find(a => a.is_default) || logos[0]
  const defaultSignature = signatures.find(a => a.is_default) || signatures[0]
  const defaultStamp = stamps.find(a => a.is_default) || stamps[0]

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 overflow-hidden">
                {defaultLogo ? (
                  <img src={defaultLogo.asset_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Company</h1>
                <p className="text-slate-500 mt-1">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" className="border-slate-200 text-slate-600 font-semibold px-6">
              Select profile
            </Button>
          </div>
        </div>

        {/* Business Identity Section */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center gap-2 px-1">
            <h2 className="font-bold text-slate-800 text-lg">Business Identity</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo Card */}
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 mb-2">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Upload Logo</h3>
                  <p className="text-xs text-slate-500 mt-1">Setup and drop-drop logo</p>
                </div>
                <Button 
                  onClick={() => { setUploadType('logo'); setUploadDialogOpen(true); }}
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2 border-slate-200"
                >
                  Change logo
                </Button>
              </CardContent>
            </Card>

            {/* Signature Card */}
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 mb-2">
                  <Signature className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Signatures</h3>
                  <p className="text-xs text-slate-500 mt-1">Setup and drop-drop signature</p>
                </div>
                <Button 
                  onClick={() => { setUploadType('signature'); setUploadDialogOpen(true); }}
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2 border-slate-200"
                >
                  Upload signature
                </Button>
              </CardContent>
            </Card>

            {/* Stamp Card */}
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 mb-2">
                  <Stamp className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Upload Stamp</h3>
                  <p className="text-xs text-slate-500 mt-1">Setup and drop-drop stamp</p>
                </div>
                <Button 
                  onClick={() => { setUploadType('stamp'); setUploadDialogOpen(true); }}
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2 border-slate-200"
                >
                  Upload stamp
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="space-y-6 mb-12">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-bold text-slate-800 text-lg">Payment Methods</h2>
            <Button variant="outline" size="sm" className="border-slate-200 text-slate-600">Payment methods</Button>
          </div>
          
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm">Payment Methods</h4>
                <p className="text-xs text-slate-500">Logistics</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Asset Library Section */}
        <div className="space-y-6">
          <h2 className="font-bold text-slate-800 text-lg px-1">Asset Library</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* Displaying existing assets like the design */}
            {[...logos, ...signatures, ...stamps].map((asset) => (
              <Card key={asset.id} className="bg-white border-slate-200 shadow-sm group relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-[1.5/1] bg-slate-50 flex items-center justify-center p-4">
                    <img src={asset.asset_url} alt={asset.asset_name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="p-3 flex justify-between items-center border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-700 truncate">{asset.asset_name}</span>
                    <div className="flex gap-1">
                      {asset.is_default && <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />}
                      <button onClick={() => handleDelete(asset.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <button 
              onClick={() => { setUploadType('logo'); setUploadDialogOpen(true); }}
              className="aspect-[1.5/1] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#6366f1] hover:bg-[#6366f1]/5 transition-all text-slate-400"
            >
              <Upload className="w-6 h-6" />
              <span className="text-xs font-bold">Upload New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {uploadType}</DialogTitle>
            <DialogDescription>Add a new {uploadType} to your asset library</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Asset Name</Label>
              <Input value={newAssetName} onChange={e => setNewAssetName(e.target.value)} placeholder="e.g. Primary Logo" />
            </div>
            <div className="space-y-2">
              <Label>Upload File</Label>
              <Input type="file" accept="image/*" onChange={e => setNewAssetFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUploadAsset} disabled={!newAssetFile || !newAssetName || uploading[uploadType]} className="bg-[#6366f1] hover:bg-[#5658d2]">
              {uploading[uploadType] ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
