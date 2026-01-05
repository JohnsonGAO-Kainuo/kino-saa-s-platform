"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, Trash2, Check } from 'lucide-react'
import { getUserAssets, type UserAsset } from '@/lib/asset-management'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/lib/language-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AssetSelectorProps {
  type: 'logo' | 'signature' | 'stamp'
  currentValue: string | null
  onChange: (value: string | null) => void
  onUploadClick: () => void
  processing?: boolean
}

export function AssetSelector({ type, currentValue, onChange, onUploadClick, processing }: AssetSelectorProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [assets, setAssets] = useState<UserAsset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAssets() {
      if (user) {
        const data = await getUserAssets(user.id, type)
        setAssets(data)
        
        // Auto-select default asset if no current value
        if (!currentValue && data.length > 0) {
          const defaultAsset = data.find(a => a.is_default)
          if (defaultAsset) {
            onChange(defaultAsset.asset_url)
          }
        }
      }
      setLoading(false)
    }
    loadAssets()
  }, [user, type])

  const getLabel = () => {
    switch (type) {
      case 'logo': return t('Company Logo', '公司標誌')
      case 'signature': return t('Authorized Signature', '授權簽名')
      case 'stamp': return t('Company Stamp', '公司印章')
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{getLabel()}</Label>
      <div className="flex flex-col gap-2">
        {assets.length > 0 && (
          <Select value={currentValue || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full h-10 bg-white">
              <SelectValue placeholder={t('Select from library', '從資產庫選擇')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                <span className="text-muted-foreground italic">{t('None', '無')}</span>
              </SelectItem>
              {assets.map((asset) => (
                <SelectItem key={asset.id} value={asset.asset_url}>
                  <div className="flex items-center gap-2">
                    <span>{asset.asset_name}</span>
                    {asset.is_default && (
                      <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                        {t('Default', '預設')}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <Button
          variant="outline"
          size="sm"
          disabled={processing}
          className="w-full gap-2 bg-transparent border-dashed h-10"
          onClick={onUploadClick}
        >
          {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {currentValue ? t('Replace', '替換') : t('Upload New', '上傳新檔案')}
        </Button>
        
        {currentValue && (
          <div className="flex items-center justify-between px-2 py-1 bg-green-50 rounded border border-green-100">
            <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> {t('Active', '已啟用')}
            </span>
            <button onClick={() => onChange(null)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

