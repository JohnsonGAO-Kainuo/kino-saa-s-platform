"use client"

import { useState } from "react"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, Trash2, Plus, Pen, MoveHorizontal, Loader2 } from "lucide-react"
import { SignaturePadModal } from "./signature-pad-modal"
import { AssetSelector } from "./asset-selector"
import { removeImageBackground } from "@/lib/image-utils"
import { Slider } from "@/components/ui/slider"

type DocumentType = "quotation" | "invoice" | "receipt" | "contract"

interface FormDataType {
  // Company info (can override profile defaults)
  companyName?: string
  companyEmail?: string
  companyAddress?: string
  companyPhone?: string
  bankName?: string
  accountNumber?: string
  fpsId?: string
  paypalEmail?: string
  // Client info
  clientName: string
  clientEmail: string
  clientAddress: string
  // Document content
  items: Array<{ 
    description: string
    subItems?: string[]
    quantity: number
    unitPrice: number 
  }>
  notes: string
  // Assets
  logo: string | null
  signature: string | null
  stamp: string | null
  // Contract specific
  contractTerms: string
  paymentTerms: string
  deliveryDate: string
  // Display settings
  languageMode: "bilingual" | "english" | "chinese"
  logoPosition: "left" | "center" | "right"
  logoWidth?: number
  templateId?: "standard" | "corporate" | "modern"
  // Asset positioning
  signatureOffset?: { x: number; y: number }
  stampOffset?: { x: number; y: number }
}

interface EditorFormProps {
  documentType: DocumentType
  formData: FormDataType
  onChange: (data: FormDataType) => void
}

export function EditorForm({ documentType, formData, onChange }: EditorFormProps) {
  const [signaturePadOpen, setSignaturePadOpen] = useState(false)
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
      // Apply background removal for all types (especially signature and stamp)
      const transparentDataUrl = await removeImageBackground(file)
      onChange({ ...formData, [type]: transparentDataUrl })
    } catch (error) {
      console.error(`Error processing ${type}:`, error)
      // Fallback: use original image if background removal fails
      const reader = new FileReader()
      reader.onload = (event) => {
        onChange({ ...formData, [type]: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    } finally {
      setProcessing(prev => ({ ...prev, [type]: false }))
    }
  }

  const handleSignatureSave = (signature: string) => {
    // Force immediate sync by updating state directly and notifying parent
    onChange({ ...formData, signature })
  }

  const isContractType = documentType === "contract"

  return (
    <>
      <div className="space-y-6 pb-20">
        {/* Document Settings */}
        <Card className="bg-card border-border border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-1.5 h-4 bg-accent rounded-full" />
              Document Layout & Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Document Template</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'standard', label: 'Stripe Minimal' },
                  { id: 'corporate', label: 'Corporate' },
                  { id: 'modern', label: 'Modern Tech' }
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleFieldChange("templateId", tpl.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      (formData.templateId || 'standard') === tpl.id 
                        ? "border-[#6366f1] bg-[#6366f1]/5 shadow-sm" 
                        : "border-[#e6e9ef] hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`w-full aspect-[3/4] rounded shadow-inner ${
                      tpl.id === 'standard' ? 'bg-slate-50' :
                      tpl.id === 'corporate' ? 'bg-slate-100 border-t-4 border-[#1a1f36]' :
                      'bg-slate-100 border-l-4 border-[#6366f1]'
                    }`} />
                    <span className={`text-[11px] font-bold ${
                      (formData.templateId || 'standard') === tpl.id ? "text-[#6366f1]" : "text-[#4f566b]"
                    }`}>{tpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#f7f9fc]">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Language Mode</Label>
                <div className="flex bg-input p-1 rounded-lg border border-border">
                  {[
                    { id: 'bilingual', label: 'Bilingual' },
                    { id: 'english', label: 'English' },
                    { id: 'chinese', label: '繁體中文' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleFieldChange("languageMode", mode.id)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                        formData.languageMode === mode.id 
                          ? "bg-white text-accent shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Logo Alignment</Label>
                <div className="flex bg-input p-1 rounded-lg border border-border">
                  {[
                    { id: 'left', label: 'Left' },
                    { id: 'center', label: 'Center' },
                    { id: 'right', label: 'Right' }
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => handleFieldChange("logoPosition", pos.id)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                        formData.logoPosition === pos.id 
                          ? "bg-white text-accent shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#f7f9fc]">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <MoveHorizontal className="w-4 h-4 text-accent" />
                  Logo Display Width
                </Label>
                <span className="text-xs font-mono text-accent">{formData.logoWidth || 128}px</span>
              </div>
              <Slider
                value={[formData.logoWidth || 128]}
                onValueChange={(vals) => handleFieldChange("logoWidth", vals[0])}
                min={60}
                max={400}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding & Assets */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Branding & Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AssetSelector
                type="logo"
                currentValue={formData.logo}
                onChange={(value) => handleFieldChange("logo", value)}
                onUploadClick={() => document.getElementById("logo-upload")?.click()}
                processing={processing.logo}
              />
              <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />

              <AssetSelector
                type="signature"
                currentValue={formData.signature}
                onChange={(value) => handleFieldChange("signature", value)}
                onUploadClick={() => document.getElementById("signature-upload")?.click()}
                processing={processing.signature}
              />
              <input id="signature-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'signature')} />

              <AssetSelector
                type="stamp"
                currentValue={formData.stamp}
                onChange={(value) => handleFieldChange("stamp", value)}
                onUploadClick={() => document.getElementById("stamp-upload")?.click()}
                processing={processing.stamp}
              />
              <input id="stamp-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'stamp')} />
            </div>

            {(formData.signature || formData.stamp) && (
              <div className="pt-6 border-t border-[#f7f9fc] space-y-6">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <MoveHorizontal className="w-4 h-4 text-[#6366f1]" />
                  Asset Positioning 微調位置
                </Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {formData.signature && (
                    <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[11px] font-bold text-[#4f566b] uppercase">Signature Position 簽名位置</p>
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Horizontal 水平</span>
                          <span className="font-mono font-bold text-[#6366f1]">{formData.signatureOffset?.x || 0}px</span>
                        </div>
                        <Slider 
                          value={[formData.signatureOffset?.x || 0]} 
                          min={-100} max={100} step={1}
                          onValueChange={([val]) => handleFieldChange("signatureOffset", { ...formData.signatureOffset, x: val })}
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Vertical 垂直</span>
                          <span className="font-mono font-bold text-[#6366f1]">{formData.signatureOffset?.y || 0}px</span>
                        </div>
                        <Slider 
                          value={[formData.signatureOffset?.y || 0]} 
                          min={-100} max={100} step={1}
                          onValueChange={([val]) => handleFieldChange("signatureOffset", { ...formData.signatureOffset, y: val })}
                        />
                      </div>
                    </div>
                  )}

                  {formData.stamp && (
                    <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <p className="text-[11px] font-bold text-[#4f566b] uppercase">Stamp Position 印章位置</p>
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Horizontal 水平</span>
                          <span className="font-mono font-bold text-[#6366f1]">{formData.stampOffset?.x || 0}px</span>
                        </div>
                        <Slider 
                          value={[formData.stampOffset?.x || 0]} 
                          min={-100} max={100} step={1}
                          onValueChange={([val]) => handleFieldChange("stampOffset", { ...formData.stampOffset, x: val })}
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Vertical 垂直</span>
                          <span className="font-mono font-bold text-[#6366f1]">{formData.stampOffset?.y || 0}px</span>
                        </div>
                        <Slider 
                          value={[formData.stampOffset?.y || 0]} 
                          min={-100} max={100} step={1}
                          onValueChange={([val]) => handleFieldChange("stampOffset", { ...formData.stampOffset, y: val })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Information Override */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Your Company Information</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Override default profile settings for this document only</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-xs font-medium text-muted-foreground">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Your Company Name"
                  value={formData.companyName || ''}
                  onChange={(e) => handleFieldChange("companyName", e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="companyEmail" className="text-xs font-medium text-muted-foreground">Company Email</Label>
                <Input
                  id="companyEmail"
                  placeholder="contact@company.com"
                  value={formData.companyEmail || ''}
                  onChange={(e) => handleFieldChange("companyEmail", e.target.value)}
                  className="bg-input border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="companyPhone" className="text-xs font-medium text-muted-foreground">Phone Number</Label>
                <Input
                  id="companyPhone"
                  placeholder="+852 1234 5678"
                  value={formData.companyPhone || ''}
                  onChange={(e) => handleFieldChange("companyPhone", e.target.value)}
                  className="bg-input border-border"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyAddress" className="text-xs font-medium text-muted-foreground">Company Address</Label>
              <Textarea
                id="companyAddress"
                placeholder="Full business address"
                value={formData.companyAddress || ''}
                onChange={(e) => handleFieldChange("companyAddress", e.target.value)}
                className="bg-input border-border min-h-[60px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment & Banking Information */}
        <Card className="bg-card border-border border-[#10b981]/30">
          <CardHeader>
            <CardTitle className="text-base text-[#10b981]">Payment & Banking Information</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Bank details for invoice and receipt documents</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bankName" className="text-xs font-medium text-muted-foreground">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="e.g. HSBC Hong Kong"
                  value={formData.bankName || ''}
                  onChange={(e) => handleFieldChange("bankName", e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="accountNumber" className="text-xs font-medium text-muted-foreground">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="123-456789-001"
                  value={formData.accountNumber || ''}
                  onChange={(e) => handleFieldChange("accountNumber", e.target.value)}
                  className="bg-input border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fpsId" className="text-xs font-medium text-muted-foreground">FPS ID (Hong Kong)</Label>
                <Input
                  id="fpsId"
                  placeholder="12345678"
                  value={formData.fpsId || ''}
                  onChange={(e) => handleFieldChange("fpsId", e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paypalEmail" className="text-xs font-medium text-muted-foreground">PayPal Email</Label>
                <Input
                  id="paypalEmail"
                  placeholder="payments@company.com"
                  value={formData.paypalEmail || ''}
                  onChange={(e) => handleFieldChange("paypalEmail", e.target.value)}
                  className="bg-input border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Client Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="clientName" className="text-xs font-medium text-muted-foreground">Client Name</Label>
                <Input
                  id="clientName"
                  placeholder="e.g. Acme Corp"
                  value={formData.clientName}
                  onChange={(e) => handleFieldChange("clientName", e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="clientEmail" className="text-xs font-medium text-muted-foreground">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="billing@acme.com"
                  value={formData.clientEmail}
                  onChange={(e) => handleFieldChange("clientEmail", e.target.value)}
                  className="bg-input border-border"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clientAddress" className="text-xs font-medium text-muted-foreground">Address</Label>
              <Textarea
                id="clientAddress"
                placeholder="Full billing address"
                value={formData.clientAddress}
                onChange={(e) => handleFieldChange("clientAddress", e.target.value)}
                className="bg-input border-border min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {isContractType && (
          <>
            <Card className="bg-card border-border border-accent/50">
              <CardHeader>
                <CardTitle className="text-base text-accent">Contract Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contractTerms" className="text-sm text-muted-foreground mb-2 block">
                    Terms & Conditions
                  </Label>
                  <Textarea
                    id="contractTerms"
                    placeholder="Enter contract terms..."
                    value={formData.contractTerms}
                    onChange={(e) => handleFieldChange("contractTerms", e.target.value)}
                    className="bg-input border-border text-foreground min-h-40"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentTerms" className="text-sm text-muted-foreground mb-2 block">
                      Payment Terms
                    </Label>
                    <Input
                      id="paymentTerms"
                      placeholder="e.g., Net 30"
                      value={formData.paymentTerms}
                      onChange={(e) => handleFieldChange("paymentTerms", e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryDate" className="text-sm text-muted-foreground mb-2 block">
                      Delivery Date
                    </Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => handleFieldChange("deliveryDate", e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Line Items */}
        {!isContractType && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Line Items</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Add main items and optional sub-items for detailed breakdown</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.items.map((item, itemIndex) => (
                <div key={itemIndex} className="border border-border rounded-lg p-4 space-y-3 bg-slate-50/30">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label className="text-sm font-semibold text-foreground mb-1.5 block">Main Item / Service</Label>
                        <Input
                          placeholder="e.g. Website Development"
                          value={item.description}
                          onChange={(e) => handleItemChange(itemIndex, "description", e.target.value)}
                          className="bg-white border-border text-foreground font-medium"
                        />
                      </div>
                      
                      {/* Sub-items */}
                      {item.subItems && item.subItems.length > 0 && (
                        <div className="pl-4 border-l-2 border-[#6366f1]/30 space-y-2">
                          <Label className="text-xs text-muted-foreground">Sub-items (optional breakdown)</Label>
                          {item.subItems.map((subItem, subIndex) => (
                            <div key={subIndex} className="flex gap-2 items-center">
                              <span className="text-xs text-muted-foreground">•</span>
                              <Input
                                placeholder="e.g. Domain registration, SEO optimization"
                                value={subItem}
                                onChange={(e) => handleSubItemChange(itemIndex, subIndex, e.target.value)}
                                className="bg-white border-border text-sm flex-1"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => removeSubItem(itemIndex, subIndex)}
                              >
                                <Trash2 className="w-3 h-3 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSubItem(itemIndex)}
                        className="gap-1.5 text-xs h-7"
                      >
                        <Plus className="w-3 h-3" /> Add Sub-item
                      </Button>
                    </div>

                    <div className="w-20">
                      <Label className="text-sm text-muted-foreground mb-1.5 block">Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(itemIndex, "quantity", parseInt(e.target.value) || 0)}
                        className="bg-white border-border text-foreground text-center"
                      />
                    </div>
                    <div className="w-28">
                      <Label className="text-sm text-muted-foreground mb-1.5 block">Unit Price</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(itemIndex, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="bg-white border-border text-foreground"
                      />
                    </div>
                    {formData.items.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeItem(itemIndex)} 
                        className="text-muted-foreground hover:text-destructive mt-6"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex justify-end pt-2 border-t border-border">
                    <span className="text-sm font-semibold text-foreground">
                      Subtotal: ${(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem} className="w-full gap-2 mt-2">
                <Plus className="w-4 h-4" /> Add New Item
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add additional notes..."
              value={formData.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              className="bg-input border-border min-h-[100px]"
            />
          </CardContent>
        </Card>
      </div>

      <SignaturePadModal
        open={signaturePadOpen}
        onClose={() => setSignaturePadOpen(false)}
        onSave={handleSignatureSave}
      />
    </>
  )
}
