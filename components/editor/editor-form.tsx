"use client"

import { useState } from "react"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, Trash2, Plus, Pen } from "lucide-react"
import { SignaturePadModal } from "./signature-pad-modal"

type DocumentType = "quotation" | "invoice" | "receipt" | "contract"

interface FormDataType {
  clientName: string
  clientEmail: string
  clientAddress: string
  items: Array<{ description: string; quantity: number; unitPrice: number }>
  notes: string
  logo: File | null
  signature: string | null
  stamp: File | null
  contractTerms: string
  paymentTerms: string
  deliveryDate: string
  languageMode: "bilingual" | "english" | "chinese"
  logoPosition: "left" | "center" | "right"
}

interface EditorFormProps {
  documentType: DocumentType
  formData: FormDataType
  onChange: (data: FormDataType) => void
}

export function EditorForm({ documentType, formData, onChange }: EditorFormProps) {
  const [signaturePadOpen, setSignaturePadOpen] = useState(false)

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
      items: [...formData.items, { description: "", quantity: 1, unitPrice: 0 }],
    })
  }

  const removeItem = (index: number) => {
    onChange({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onChange({ ...formData, logo: file })
  }

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onChange({ ...formData, stamp: file })
  }

  const handleSignatureSave = (signature: string) => {
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
              Document Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </CardContent>
        </Card>

        {/* Company/Logo Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Branding & Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Company Logo</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 bg-transparent border-dashed h-12"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    {formData.logo ? "Replace Logo" : "Upload Logo"}
                  </Button>
                  {formData.logo && (
                    <div className="flex items-center justify-between px-2 py-1 bg-accent/5 rounded border border-accent/10">
                      <span className="text-[10px] text-accent truncate max-w-[100px]">{formData.logo.name}</span>
                      <button onClick={() => handleFieldChange("logo", null)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Authorized Signature</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 bg-transparent border-dashed h-12"
                    onClick={() => setSignaturePadOpen(true)}
                  >
                    <Pen className="w-4 h-4" />
                    {formData.signature ? "Re-draw" : "Draw Signature"}
                  </Button>
                  {formData.signature && (
                    <div className="flex items-center justify-between px-2 py-1 bg-green-50 rounded border border-green-100">
                      <span className="text-[10px] text-green-600 font-medium">Captured ✓</span>
                      <button onClick={() => handleFieldChange("signature", null)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Company Stamp</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 bg-transparent border-dashed h-12"
                    onClick={() => document.getElementById("stamp-upload")?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    {formData.stamp ? "Replace Stamp" : "Upload Stamp"}
                  </Button>
                  {formData.stamp && (
                    <div className="flex items-center justify-between px-2 py-1 bg-accent/5 rounded border border-accent/10">
                      <span className="text-[10px] text-accent truncate max-w-[100px]">{formData.stamp.name}</span>
                      <button onClick={() => handleFieldChange("stamp", null)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <input id="stamp-upload" type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />
                </div>
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
                    placeholder="Enter contract terms, scope of work, deliverables, IP rights, confidentiality, termination clause, liability, dispute resolution, etc."
                    value={formData.contractTerms}
                    onChange={(e) => handleFieldChange("contractTerms", e.target.value)}
                    className="bg-input border-border text-foreground min-h-40"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentTerms" className="text-sm text-muted-foreground mb-2 block">
                    Payment Terms
                  </Label>
                  <Input
                    id="paymentTerms"
                    placeholder="e.g., Net 30, 50% upfront, 50% on delivery"
                    value={formData.paymentTerms}
                    onChange={(e) => handleFieldChange("paymentTerms", e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryDate" className="text-sm text-muted-foreground mb-2 block">
                    Expected Delivery Date
                  </Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => handleFieldChange("deliveryDate", e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
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
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-sm text-muted-foreground mb-1 block">Description</Label>
                    <Input
                      placeholder="Product/service description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="w-20">
                    <Label className="text-sm text-muted-foreground mb-1 block">Qty</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", Number.parseInt(e.target.value) || 0)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-sm text-muted-foreground mb-1 block">Price</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addItem}
                className="w-full gap-2 border-border hover:bg-accent/10 hover:border-accent bg-transparent"
              >
                <Plus className="w-4 h-4" />
                Add Item
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
              placeholder="Add any additional notes or terms..."
              value={formData.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              className="bg-input border-border text-foreground"
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
