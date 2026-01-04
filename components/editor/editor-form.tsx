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
}

interface EditorFormProps {
  documentType: DocumentType
  formData: FormDataType
  onChange: (data: FormDataType) => void
}

export function EditorForm({ documentType, formData, onChange }: EditorFormProps) {
  const [signaturePadOpen, setSignaturePadOpen] = useState(false)

  const handleClientChange = (field: string, value: string) => {
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
      <div className="space-y-6">
        {/* Company/Logo Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Company Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Logo</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </Button>
                {formData.logo && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-accent">{formData.logo.name}</span>
                    <button
                      onClick={() => onChange({ ...formData, logo: null })}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Signature</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => setSignaturePadOpen(true)}
                >
                  <Pen className="w-4 h-4" />
                  Draw Signature
                </Button>
                {formData.signature && (
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-6 bg-input border border-border rounded flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">✓</span>
                    </div>
                    <button
                      onClick={() => onChange({ ...formData, signature: null })}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Company Stamp</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => document.getElementById("stamp-upload")?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Upload Stamp
                </Button>
                {formData.stamp && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-accent">{formData.stamp.name}</span>
                    <button
                      onClick={() => onChange({ ...formData, stamp: null })}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input id="stamp-upload" type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clientName" className="text-sm text-muted-foreground mb-2 block">
                Client Name
              </Label>
              <Input
                id="clientName"
                placeholder="Client name"
                value={formData.clientName}
                onChange={(e) => handleClientChange("clientName", e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="clientEmail" className="text-sm text-muted-foreground mb-2 block">
                Email
              </Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="client@example.com"
                value={formData.clientEmail}
                onChange={(e) => handleClientChange("clientEmail", e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="clientAddress" className="text-sm text-muted-foreground mb-2 block">
                Address
              </Label>
              <Textarea
                id="clientAddress"
                placeholder="Client address"
                value={formData.clientAddress}
                onChange={(e) => handleClientChange("clientAddress", e.target.value)}
                className="bg-input border-border text-foreground"
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
                    onChange={(e) => handleClientChange("contractTerms", e.target.value)}
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
                    onChange={(e) => handleClientChange("paymentTerms", e.target.value)}
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
                    onChange={(e) => handleClientChange("deliveryDate", e.target.value)}
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
              onChange={(e) => handleClientChange("notes", e.target.value)}
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
