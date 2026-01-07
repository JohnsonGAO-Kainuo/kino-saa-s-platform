"use client"

import { useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Building2, User, FileText, CreditCard, Layers, Stamp, Signature as SignatureIcon, Image as ImageIcon } from "lucide-react"
import { AssetSelector } from "./asset-selector"
import { removeImageBackground } from "@/lib/image-utils"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

type DocumentType = "quotation" | "invoice" | "receipt" | "contract"

interface FormDataType {
  companyName?: string
  companyEmail?: string
  companyAddress?: string
  companyPhone?: string
  bankName?: string
  accountNumber?: string
  fpsId?: string
  paypalEmail?: string
  clientName: string
  clientEmail: string
  clientAddress: string
  items: Array<{ 
    description: string
    subItems?: string[]
    quantity: number
    unitPrice: number 
  }>
  notes: string
  logo: string | null
  signature: string | null
  stamp: string | null
  contractTerms: string
  paymentTerms: string
  deliveryDate: string
  languageMode: "bilingual" | "english" | "chinese"
  logoPosition: "left" | "center" | "right"
  logoWidth?: number
  templateId?: "standard" | "corporate" | "modern"
}

interface EditorFormProps {
  documentType: DocumentType
  formData: FormDataType
  onChange: (data: FormDataType) => void
  onFocusField?: (fieldId: string) => void
}

export function EditorForm({ documentType, formData, onChange, onFocusField }: EditorFormProps) {
  const [processing, setProcessing] = useState<Record<string, boolean>>({})

  const handleFieldChange = (field: string, value: any) => {
    onChange({ ...formData, [field]: value })
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    onChange({ ...formData, items: newItems })
  }

  const addItem = () => {
    onChange({
      ...formData,
      items: [...formData.items, { description: "", subItems: [], quantity: 1, unitPrice: 0 }],
    })
  }

  const handleSubItemChange = (itemIndex: number, subItemIndex: number, value: string) => {
    const newItems = [...formData.items]
    if (!newItems[itemIndex].subItems) newItems[itemIndex].subItems = []
    newItems[itemIndex].subItems![subItemIndex] = value
    onChange({ ...formData, items: newItems })
  }

  const addSubItem = (itemIndex: number) => {
    const newItems = [...formData.items]
    if (!newItems[itemIndex].subItems) newItems[itemIndex].subItems = []
    newItems[itemIndex].subItems!.push("")
    onChange({ ...formData, items: newItems })
  }

  const removeSubItem = (itemIndex: number, subItemIndex: number) => {
    const newItems = [...formData.items]
    newItems[itemIndex].subItems = newItems[itemIndex].subItems?.filter((_, i) => i !== subItemIndex)
    onChange({ ...formData, items: newItems })
  }

  const removeItem = (index: number) => {
    onChange({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'stamp' | 'signature') => {
    const file = e.target.files?.[0]
    if (!file) return

    setProcessing(prev => ({ ...prev, [type]: true }))
    try {
      const transparentDataUrl = await removeImageBackground(file)
      onChange({ ...formData, [type]: transparentDataUrl })
    } catch (error) {
      console.error(`Error processing ${type}:`, error)
      const reader = new FileReader()
      reader.onload = (event) => {
        onChange({ ...formData, [type]: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    } finally {
      setProcessing(prev => ({ ...prev, [type]: false }))
    }
  }

  const isContractType = documentType === "contract"

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
    </div>
  )

  const InputField = ({ id, label, placeholder, value, onChange, type = "text", className = "" }: any) => (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label htmlFor={id} className="text-xs font-semibold text-slate-500">{label}</Label>}
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#f8fafc] border-slate-200 h-10 text-slate-900 focus:bg-white transition-all shadow-none"
      />
    </div>
  )

  return (
    <div className="space-y-10 pb-40">
      {/* 1. From & Logo */}
      <section>
        <SectionHeader icon={Building2} title="From" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <InputField 
              id="companyName" 
              placeholder="Kainuo Kainuo" 
              value={formData.companyName} 
              onChange={(v: string) => handleFieldChange("companyName", v)} 
            />
            <Textarea
              placeholder="User Company Name & Address"
              value={formData.companyAddress}
              onChange={(e) => handleFieldChange("companyAddress", e.target.value)}
              className="bg-[#f8fafc] border-slate-200 min-h-[100px] text-slate-900 focus:bg-white transition-all shadow-none"
            />
          </div>
          <div 
            className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-[#6366f1] transition-all"
            onClick={() => document.getElementById('logo-upload')?.click()}
          >
            <AssetSelector
              type="logo"
              currentValue={formData.logo}
              onChange={(value) => handleFieldChange("logo", value)}
              onUploadClick={() => document.getElementById("logo-upload")?.click()}
              processing={processing.logo}
            />
            <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />
          </div>
        </div>
      </section>

      {/* 2. Bill To */}
      <section>
        <SectionHeader icon={User} title="Bill To" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            placeholder="Kainuo Name" 
            value={formData.clientName} 
            onChange={(v: string) => handleFieldChange("clientName", v)} 
          />
          <InputField 
            placeholder="Email phone" 
            value={formData.clientEmail} 
            onChange={(v: string) => handleFieldChange("clientEmail", v)} 
          />
          <Textarea
            placeholder="Client Address"
            value={formData.clientAddress}
            onChange={(e) => handleFieldChange("clientAddress", e.target.value)}
            className="md:col-span-2 bg-[#f8fafc] border-slate-200 min-h-[80px] text-slate-900 focus:bg-white transition-all shadow-none"
          />
        </div>
      </section>

      {/* 3. Description / Line Items */}
      {!isContractType && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <SectionHeader icon={FileText} title="Description" />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addItem}
              className="border-slate-200 text-[#6366f1] hover:bg-[#6366f1]/5 h-8 font-bold"
            >
              Add Item
            </Button>
          </div>
          <div className="space-y-6">
            {formData.items.map((item, itemIndex) => (
              <div key={itemIndex} className="group relative bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-4">
                    <Input
                      placeholder="Line item description"
                      value={item.description}
                      onChange={(e) => handleItemChange(itemIndex, "description", e.target.value)}
                      className="bg-transparent border-none shadow-none text-base font-bold focus-visible:ring-0 p-0 h-auto"
                    />
                    
                    {/* Sub-items */}
                    <div className="pl-4 space-y-2">
                      {item.subItems?.map((sub, subIdx) => (
                        <div key={subIdx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <Input
                            placeholder="Sub-item detail..."
                            value={sub}
                            onChange={(e) => handleSubItemChange(itemIndex, subIdx, e.target.value)}
                            className="bg-transparent border-none shadow-none text-xs focus-visible:ring-0 p-0 h-auto text-slate-500 italic"
                          />
                          <button onClick={() => removeSubItem(itemIndex, subIdx)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addSubItem(itemIndex)} className="text-[10px] text-[#6366f1] font-bold hover:underline">
                        + Add Detail
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-16">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(itemIndex, "quantity", parseFloat(e.target.value) || 0)}
                        className="bg-[#f8fafc] border-slate-200 text-center h-8 text-xs"
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Price</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(itemIndex, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="bg-[#f8fafc] border-slate-200 text-right h-8 text-xs"
                      />
                    </div>
                    {formData.items.length > 1 && (
                      <button onClick={() => removeItem(itemIndex)} className="mt-6 text-slate-300 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Terms */}
      <section>
        <SectionHeader icon={Layers} title="Terms" />
        <Textarea
          placeholder="Enter payment or contract terms..."
          value={isContractType ? formData.contractTerms : formData.paymentTerms}
          onChange={(e) => handleFieldChange(isContractType ? "contractTerms" : "paymentTerms", e.target.value)}
          className="bg-[#f8fafc] border-slate-200 min-h-[120px] text-slate-900 focus:bg-white transition-all shadow-none rounded-xl"
        />
      </section>

      {/* 5. Signature & Stamp */}
      <section>
        <SectionHeader icon={SignatureIcon} title="Digital Assets" />
        <div className="grid grid-cols-2 gap-6">
          <div 
            className="aspect-[1.618/1] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-[#6366f1] transition-all"
            onClick={() => document.getElementById('signature-upload')?.click()}
          >
            <AssetSelector
              type="signature"
              currentValue={formData.signature}
              onChange={(value) => handleFieldChange("signature", value)}
              onUploadClick={() => document.getElementById("signature-upload")?.click()}
              processing={processing.signature}
            />
            <input id="signature-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'signature')} />
          </div>
          <div 
            className="aspect-[1.618/1] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-[#6366f1] transition-all"
            onClick={() => document.getElementById('stamp-upload')?.click()}
          >
            <AssetSelector
              type="stamp"
              currentValue={formData.stamp}
              onChange={(value) => handleFieldChange("stamp", value)}
              onUploadClick={() => document.getElementById("stamp-upload")?.click()}
              processing={processing.stamp}
            />
            <input id="stamp-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'stamp')} />
          </div>
        </div>
      </section>

      {/* 6. Layout Style */}
      <section>
        <SectionHeader icon={Plus} title="Bilingual Layout" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-xs font-bold text-slate-500 uppercase">Language Selection</Label>
            <div className="flex gap-2">
              {['bilingual', 'english', 'chinese'].map(lang => (
                <button
                  key={lang}
                  onClick={() => handleFieldChange("languageMode", lang)}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all",
                    formData.languageMode === lang ? "bg-[#6366f1] text-white border-[#6366f1] shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-xs font-bold text-slate-500 uppercase">Logo Size</Label>
            <Slider
              value={[formData.logoWidth || 128]}
              onValueChange={(vals) => handleFieldChange("logoWidth", vals[0])}
              min={60} max={400}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
