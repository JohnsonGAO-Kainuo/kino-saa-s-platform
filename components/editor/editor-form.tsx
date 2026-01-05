"use client"

import { useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, Trash2, Plus, Pen, MoveHorizontal, Loader2, Paintbrush, Building2, User, FileText, CreditCard } from "lucide-react"
import { AssetSelector } from "./asset-selector"
import { removeImageBackground } from "@/lib/image-utils"
import { Slider } from "@/components/ui/slider"

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
  signatureOffset?: { x: number; y: number }
  stampOffset?: { x: number; y: number }
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

  return (
    <div className="space-y-6 pb-32">
      {/* 1. From & Logo Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e6e9ef] p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#1a1f36]">
            <Building2 className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-base uppercase tracking-tight">From</h3>
          </div>
          <div className="space-y-3">
            <Input
              id="companyName"
              placeholder="Your Company or Name"
              value={formData.companyName || ''}
              onChange={(e) => handleFieldChange("companyName", e.target.value)}
              className="bg-[#fcfdfe] border-[#e6e9ef] font-bold text-lg"
            />
            <Textarea
              id="companyAddress"
              placeholder="Address, Phone, Email..."
              value={formData.companyAddress || ''}
              onChange={(e) => handleFieldChange("companyAddress", e.target.value)}
              className="bg-[#fcfdfe] border-[#e6e9ef] min-h-[100px] text-sm"
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#FFF9C4] rounded-xl border-2 border-dashed border-[#F9A825] p-6 h-full flex flex-col items-center justify-center text-center hover:bg-[#FFF59D] transition-all cursor-pointer group"
               onClick={() => document.getElementById('logo-upload')?.click()}>
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
      </div>

      {/* 2. Bill To & Doc Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e6e9ef] p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#1a1f36]">
            <User className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-base uppercase tracking-tight">Bill To</h3>
          </div>
          <Textarea
            id="clientAddress"
            placeholder="Your customer's billing address"
            value={formData.clientAddress}
            onChange={(e) => handleFieldChange("clientAddress", e.target.value)}
            className="bg-[#fcfdfe] border-[#e6e9ef] min-h-[120px] text-sm"
          />
        </div>

        <div className="lg:col-span-1 bg-white rounded-xl border border-[#e6e9ef] p-6 space-y-4 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <FileText className="w-3 h-3 text-yellow-500" /> {documentType.toUpperCase()} #
              </Label>
              <Input
                placeholder="100"
                className="bg-[#fcfdfe] border-[#e6e9ef]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-500 uppercase">Date</Label>
              <Input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="bg-[#fcfdfe] border-[#e6e9ef]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Line Items Section */}
      {!isContractType && (
        <div className="bg-white rounded-xl border border-[#e6e9ef] p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#1a1f36]">
              <FileText className="w-5 h-5 text-[#6366f1]" />
              <h3 className="font-bold text-base uppercase tracking-tight">Description</h3>
            </div>
            <div className="flex gap-12 text-xs font-bold text-gray-400 uppercase mr-20">
              <span className="w-20 text-center">Amount</span>
              <span className="w-20 text-center">Tax</span>
            </div>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, itemIndex) => (
              <div key={itemIndex} className="group relative border-b border-gray-100 pb-6 last:border-0">
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(itemIndex, "description", e.target.value)}
                      className="bg-transparent border-none shadow-none text-base font-medium focus-visible:ring-0 p-0 h-auto"
                    />
                    
                    {/* Sub-items */}
                    <div className="pl-4 space-y-2">
                      {item.subItems?.map((sub, subIdx) => (
                        <div key={subIdx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                          <Input
                            placeholder="Sub-item detail..."
                            value={sub}
                            onChange={(e) => handleSubItemChange(itemIndex, subIdx, e.target.value)}
                            className="bg-transparent border-none shadow-none text-xs focus-visible:ring-0 p-0 h-auto text-gray-500 italic"
                          />
                          <button onClick={() => removeSubItem(itemIndex, subIdx)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addSubItem(itemIndex)} className="text-[10px] text-[#6366f1] font-bold hover:underline">
                        + Add Detail
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center pt-1">
                    <div className="w-24">
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(itemIndex, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="bg-[#fcfdfe] border-[#e6e9ef] text-right"
                      />
                    </div>
                    <div className="w-32">
                      <Button variant="outline" size="sm" className="w-full bg-[#FFF9C4] border-[#F9A825] text-[10px] h-8 uppercase font-bold">
                        Add a Tax
                      </Button>
                    </div>
                    {formData.items.length > 1 && (
                      <button onClick={() => removeItem(itemIndex)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              onClick={addItem} 
              className="w-full bg-[#FFF9C4] border-[#F9A825] border-2 font-bold uppercase tracking-widest text-xs h-12 hover:bg-[#FFF59D] transition-all"
            >
              Add New Item
            </Button>
          </div>
        </div>
      )}

      {/* 4. Terms & Signature Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e6e9ef] p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#1a1f36]">
            <Pen className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-base uppercase tracking-tight">Terms & Conditions</h3>
          </div>
          <Textarea
            id="contractTerms"
            placeholder="Payment is due within 15 days..."
            value={isContractType ? formData.contractTerms : formData.paymentTerms}
            onChange={(e) => handleFieldChange(isContractType ? "contractTerms" : "paymentTerms", e.target.value)}
            className="bg-[#fcfdfe] border-[#e6e9ef] min-h-[120px] text-sm"
          />
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#FFF9C4] rounded-xl border-2 border-dashed border-[#F9A825] p-6 h-full flex flex-col items-center justify-center text-center hover:bg-[#FFF59D] transition-all cursor-pointer group"
               onClick={() => document.getElementById('signature-upload')?.click()}>
            <AssetSelector
              type="signature"
              currentValue={formData.signature}
              onChange={(value) => handleFieldChange("signature", value)}
              onUploadClick={() => document.getElementById("signature-upload")?.click()}
              processing={processing.signature}
            />
            <input id="signature-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'signature')} />
          </div>
        </div>
      </div>

      {/* 5. Document Settings (Global) */}
      <div className="bg-white rounded-xl border border-[#e6e9ef] p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 text-[#1a1f36]">
          <Paintbrush className="w-5 h-5 text-[#6366f1]" />
          <h3 className="font-bold text-base uppercase tracking-tight">Document Layout & Style</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <Label className="text-xs font-bold text-gray-500 uppercase">Template</Label>
            <div className="flex gap-2">
              {['standard', 'corporate', 'modern'].map(tpl => (
                <button
                  key={tpl}
                  onClick={() => handleFieldChange("templateId", tpl)}
                  className={`flex-1 py-2 text-[10px] font-bold rounded border transition-all ${
                    formData.templateId === tpl ? "bg-[#6366f1] text-white border-[#6366f1]" : "bg-white text-gray-500 border-gray-200"
                  }`}
                >
                  {tpl.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold text-gray-500 uppercase">Language</Label>
            <div className="flex gap-2">
              {['bilingual', 'english', 'chinese'].map(lang => (
                <button
                  key={lang}
                  onClick={() => handleFieldChange("languageMode", lang)}
                  className={`flex-1 py-2 text-[10px] font-bold rounded border transition-all ${
                    formData.languageMode === lang ? "bg-[#6366f1] text-white border-[#6366f1]" : "bg-white text-gray-500 border-gray-200"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold text-gray-500 uppercase">Logo Width</Label>
            <Slider
              value={[formData.logoWidth || 128]}
              onValueChange={(vals) => handleFieldChange("logoWidth", vals[0])}
              min={60} max={400}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
