"use client"

import { useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, GripVertical, Search } from "lucide-react"
import { AssetSelector } from "./asset-selector"
import { removeImageBackground } from "@/lib/image-utils"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { languageNames, type Language } from "@/lib/language-context"

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
  clientSignature?: string | null
  contractTerms: string
  paymentTerms: string
  deliveryDate: string
  languageMode: "single" | "bilingual"
  primaryLanguage: Language
  secondaryLanguage?: Language
  logoPosition: "left" | "center" | "right"
  logoWidth?: number
  templateId?: "standard" | "corporate" | "modern"
  signatureOffset?: { x: number; y: number }
  stampOffset?: { x: number; y: number }
  clientSignatureOffset?: { x: number; y: number }
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

  const removeItem = (index: number) => {
    onChange({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'stamp' | 'signature' | 'clientSignature') => {
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
    <div className="space-y-6 md:space-y-8 pb-32 max-w-2xl mx-auto">
      {/* 1. From Section */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
        <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase mb-4">From</h3>
        <div className="space-y-4">
          <Input
            id="companyName"
            placeholder="Your Company Name"
            value={formData.companyName || ''}
            onChange={(e) => handleFieldChange("companyName", e.target.value)}
            className="text-base md:text-lg font-bold border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50 h-11 md:h-12"
          />
          <Textarea
            id="companyAddress"
            placeholder="Your business address, email, phone..."
            value={formData.companyAddress || ''}
            onChange={(e) => handleFieldChange("companyAddress", e.target.value)}
            className="min-h-[80px] text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50 resize-none"
          />
          
          <div className="pt-2">
            <h4 className="text-[10px] md:text-xs font-medium text-gray-400 mb-2 uppercase">Company Logo</h4>
            <div 
              className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors min-h-[100px]"
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
        </div>
      </div>

      {/* 2. Bill To Section */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
        <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase mb-4">Bill To</h3>
        <div className="space-y-4">
          <Input
            id="clientName"
            placeholder="Client Name"
            value={formData.clientName}
            onChange={(e) => handleFieldChange("clientName", e.target.value)}
            className="text-base md:text-lg font-bold border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50 h-11 md:h-12"
          />
          <Textarea
            id="clientAddress"
            placeholder="Client's billing address..."
            value={formData.clientAddress}
            onChange={(e) => handleFieldChange("clientAddress", e.target.value)}
            className="min-h-[80px] text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50 resize-none"
          />
        </div>
      </div>

      {/* 3. Description (Optional / Top Level) */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
        <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase mb-4">Description</h3>
        <Textarea
           placeholder="Write a project description or summary..."
           value={formData.notes}
           onChange={(e) => handleFieldChange("notes", e.target.value)}
           className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50 resize-none text-sm"
        />
      </div>

      {/* 3b. Branding & Assets */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm space-y-6">
        <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase">Branding & Assets</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label className="text-[10px] md:text-xs text-gray-400 uppercase">Signature</Label>
            <div 
              className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors min-h-[100px]"
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
            {formData.signature && (
              <div className="space-y-2">
                <Label className="text-[10px] text-gray-400 uppercase">Position Offset</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400">X: {formData.signatureOffset?.x || 0}</span>
                    <Slider 
                      value={[formData.signatureOffset?.x || 0]} 
                      min={-100} max={100} step={1}
                      onValueChange={([val]) => handleFieldChange("signatureOffset", { ...formData.signatureOffset, x: val })}
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400">Y: {formData.signatureOffset?.y || 0}</span>
                    <Slider 
                      value={[formData.signatureOffset?.y || 0]} 
                      min={-100} max={100} step={1}
                      onValueChange={([val]) => handleFieldChange("signatureOffset", { ...formData.signatureOffset, y: val })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] md:text-xs text-gray-400 uppercase">Stamp / Chop</Label>
            <div 
              className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors min-h-[100px]"
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
            {formData.stamp && (
              <div className="space-y-2">
                <Label className="text-[10px] text-gray-400 uppercase">Position Offset</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400">X: {formData.stampOffset?.x || 0}</span>
                    <Slider 
                      value={[formData.stampOffset?.x || 0]} 
                      min={-100} max={100} step={1}
                      onValueChange={([val]) => handleFieldChange("stampOffset", { ...formData.stampOffset, x: val })}
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400">Y: {formData.stampOffset?.y || 0}</span>
                    <Slider 
                      value={[formData.stampOffset?.y || 0]} 
                      min={-100} max={100} step={1}
                      onValueChange={([val]) => handleFieldChange("stampOffset", { ...formData.stampOffset, y: val })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {documentType === "contract" && (
          <div className="pt-4 border-t border-gray-100">
            <Label className="text-[10px] md:text-xs text-gray-400 uppercase block mb-4">Client Signature (Party B)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div 
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors min-h-[100px]"
                onClick={() => document.getElementById('client-signature-upload')?.click()}
              >
                <AssetSelector
                  type="signature"
                  currentValue={formData.clientSignature}
                  onChange={(value) => handleFieldChange("clientSignature", value)}
                  onUploadClick={() => document.getElementById("client-signature-upload")?.click()}
                  processing={processing.clientSignature}
                />
                <input id="client-signature-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'clientSignature')} />
              </div>
              {formData.clientSignature && (
                <div className="space-y-2">
                  <Label className="text-[10px] text-gray-400 uppercase">Position Offset</Label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400">X: {formData.clientSignatureOffset?.x || 0}</span>
                      <Slider 
                        value={[formData.clientSignatureOffset?.x || 0]} 
                        min={-100} max={100} step={1}
                        onValueChange={([val]) => handleFieldChange("clientSignatureOffset", { ...formData.clientSignatureOffset, x: val })}
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] text-gray-400">Y: {formData.clientSignatureOffset?.y || 0}</span>
                      <Slider 
                        value={[formData.clientSignatureOffset?.y || 0]} 
                        min={-100} max={100} step={1}
                        onValueChange={([val]) => handleFieldChange("clientSignatureOffset", { ...formData.clientSignatureOffset, y: val })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Line Items */}
      {!isContractType && (
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase">Items</h3>
            <span className="text-[10px] md:text-xs text-gray-400">
               Total: <span className="text-blue-600 font-bold text-sm md:text-base ml-1">
                 HKD {formData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2)}
               </span>
            </span>
          </div>

          <div className="space-y-3">
            {/* Table Header (Hidden on small mobile) */}
            <div className="hidden sm:grid grid-cols-12 gap-2 text-[10px] font-medium text-gray-400 uppercase px-2 mb-2">
              <div className="col-span-1">No.</div>
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-1 text-center">Qty</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="group relative bg-gray-50/30 rounded-xl p-3 md:p-4 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all space-y-3">
                <div className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-2 items-start sm:items-center">
                  <div className="hidden sm:block col-span-1 text-gray-400 text-sm font-bold pl-1">{index + 1}</div>
                  
                  {/* Item Name (Full width on mobile) */}
                  <div className="w-full sm:col-span-6">
                    <Label className="sm:hidden text-[10px] text-gray-400 uppercase mb-1 block">Item Name</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      placeholder="Item name"
                      className="h-10 border-gray-200 bg-white focus:bg-white px-3 shadow-sm font-medium w-full"
                    />
                  </div>

                  <div className="flex w-full sm:col-span-5 gap-3">
                    <div className="flex-1">
                      <Label className="sm:hidden text-[10px] text-gray-400 uppercase mb-1 block text-right">Price</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="h-10 text-right border-gray-200 bg-white px-3 shadow-sm w-full"
                      />
                    </div>
                    <div className="w-20">
                      <Label className="sm:hidden text-[10px] text-gray-400 uppercase mb-1 block text-center">Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                        className="h-10 text-center border-gray-200 bg-white px-1 shadow-sm w-full"
                      />
                    </div>
                    <div className="hidden sm:block col-span-2 text-right text-sm font-bold text-blue-600 pr-2 min-w-[60px]">
                      ${(item.quantity * item.unitPrice).toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Sub-items list */}
                <div className="pl-0 sm:pl-9 space-y-2">
                  {item.subItems?.map((sub, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2 group/sub">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      <Input
                        value={sub}
                        onChange={(e) => {
                          const newSubItems = [...(item.subItems || [])]
                          newSubItems[sIdx] = e.target.value
                          handleItemChange(index, "subItems", newSubItems)
                        }}
                        placeholder="Sub-item detail..."
                        className="h-8 text-xs border-transparent bg-transparent hover:border-gray-200 hover:bg-white focus:bg-white py-0 shadow-none w-full"
                      />
                      <button 
                        onClick={() => {
                          const newSubItems = (item.subItems || []).filter((_, i) => i !== sIdx)
                          handleItemChange(index, "subItems", newSubItems)
                        }}
                        className="opacity-0 group-hover/sub:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newSubItems = [...(item.subItems || []), ""]
                      handleItemChange(index, "subItems", newSubItems)
                    }}
                    className="text-[10px] font-bold text-blue-500 hover:text-blue-600 uppercase flex items-center gap-1 mt-1 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-3 h-3" /> Add Detail
                  </button>
                </div>

                {/* Mobile Total Row */}
                <div className="sm:hidden flex justify-between items-center pt-2 border-t border-gray-100">
                   <span className="text-[10px] text-gray-400 uppercase">Item Total</span>
                   <span className="text-sm font-bold text-blue-600">${(item.quantity * item.unitPrice).toFixed(0)}</span>
                </div>

                {/* Delete Button (absolute) */}
                <button 
                  onClick={() => removeItem(index)}
                  className="absolute -right-2 -top-2 md:-right-3 md:-top-3 bg-white rounded-full p-1.5 shadow-lg border border-gray-100 text-gray-300 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 hover:scale-110 z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <Button 
            variant="ghost" 
            onClick={addItem}
            className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-11 md:h-10 border-dashed border border-blue-200 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      )}

      {/* 5. Terms */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
        <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase mb-4">Terms</h3>
        <div className="space-y-4">
           <div className="flex gap-2 flex-wrap mb-2">
             {["Payment due on receipt", "Net 30", "50% Deposit"].map(term => (
               <div key={term} className="text-[10px] md:text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200"
                    onClick={() => handleFieldChange("paymentTerms", term)}>
                 {term}
               </div>
             ))}
           </div>
           <Textarea
              id="contractTerms"
              value={isContractType ? formData.contractTerms : formData.paymentTerms}
              onChange={(e) => handleFieldChange(isContractType ? "contractTerms" : "paymentTerms", e.target.value)}
              className="min-h-[120px] text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50/50 resize-none"
            />
        </div>
      </div>

      {/* 6. Document Language Settings */}
      <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
        <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase mb-4">Document Language</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Bilingual Mode</Label>
              <p className="text-[10px] md:text-xs text-gray-500">Show content in two languages side-by-side</p>
            </div>
            <Switch 
              checked={formData.languageMode === "bilingual"}
              onCheckedChange={(checked) => handleFieldChange("languageMode", checked ? "bilingual" : "single")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] md:text-xs text-gray-400 uppercase">Primary Language</Label>
              <select 
                value={formData.primaryLanguage || 'en'}
                onChange={(e) => handleFieldChange("primaryLanguage", e.target.value)}
                className="w-full h-11 md:h-10 px-3 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {(Object.keys(languageNames) as Language[]).map(lang => (
                  <option key={lang} value={lang}>{languageNames[lang]}</option>
                ))}
              </select>
            </div>

            {formData.languageMode === "bilingual" && (
              <div className="space-y-2">
                <Label className="text-[10px] md:text-xs text-gray-400 uppercase">Secondary Language</Label>
                <select 
                  value={formData.secondaryLanguage || 'zh-TW'}
                  onChange={(e) => handleFieldChange("secondaryLanguage", e.target.value)}
                  className="w-full h-11 md:h-10 px-3 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {(Object.keys(languageNames) as Language[]).map(lang => (
                    <option key={lang} value={lang}>{languageNames[lang]}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 7. Action Buttons (Bottom Fixed or relative) */}
      <div className="flex gap-4 pt-4 pb-10 sm:pb-0">
        <Button variant="outline" className="flex-1 h-12 rounded-xl text-gray-500 border-gray-200 hover:bg-gray-50">
          Cancel
        </Button>
        <Button className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-200">
          Continue
        </Button>
      </div>
    </div>
  )
}

