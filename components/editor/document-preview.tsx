"use client"

import React, { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { PaymentStatus } from "@/lib/payment-utils"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Building2, User, Pen, Trash2, Plus, Upload } from 'lucide-react'
import type { Language } from '@/lib/language-context'
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
  clientSignature?: string | null
  contractTerms: string
  paymentTerms: string
  deliveryDate: string
  paymentStatus?: PaymentStatus
  languageMode?: "single" | "bilingual"
  primaryLanguage: Language
  secondaryLanguage?: Language
  logoPosition?: "left" | "center" | "right"
  logoWidth?: number
  templateId?: "standard" | "corporate" | "modern"
  signatureOffset?: { x: number; y: number }
  stampOffset?: { x: number; y: number }
  clientSignatureOffset?: { x: number; y: number }
}

interface DocumentPreviewProps {
  documentType: DocumentType
  formData: FormDataType
  onFieldChange?: (field: string, value: any) => void
  onFieldClick?: (fieldId: string) => void
}

const EditableText = ({ 
  value, 
  field, 
  placeholder, 
  multiline = false,
  className = "",
  onSave,
  onFocus
}: { 
  value: string; 
  field: string; 
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  onSave?: (field: string, value: string) => void;
  onFocus?: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onSave?.(field, localValue);
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          autoFocus
          className={`w-full p-1 border-2 border-primary/20 rounded-lg outline-none bg-accent/30 text-inherit font-inherit resize-none ${className}`}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          rows={3}
        />
      );
    }
    return (
      <input
        autoFocus
        className={`w-full p-1 border-2 border-primary/20 rounded-lg outline-none bg-accent/30 text-inherit font-inherit ${className}`}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
      />
    );
  }

  return (
    <div 
      onClick={() => {
        setIsEditing(true);
        onFocus?.();
      }}
      className={`cursor-text hover:bg-accent/50 hover:ring-1 hover:ring-primary/20 rounded px-1 transition-all min-h-[1.2em] relative group ${className}`}
    >
      <span className={!value ? "text-muted-foreground/50 italic" : ""}>
        {value || placeholder}
      </span>
      <Pen className="w-3 h-3 absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 text-primary" />
    </div>
  );
};

export function DocumentPreview({ documentType, formData, onFieldChange, onFieldClick }: DocumentPreviewProps) {
  const { user } = useAuth()
  const [companySettings, setCompanySettings] = useState<any>(null)
  
  const [draggingAsset, setDraggingAsset] = useState<'signature' | 'stamp' | 'clientSignature' | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [dragStartMouse, setDragStartMouse] = useState({ x: 0, y: 0 })
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 })
  
  const totalAmount = formData.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0)
  const languageMode = formData.languageMode || "single"
  const primaryLanguage = formData.primaryLanguage || "en"
  const secondaryLanguage = formData.secondaryLanguage || "zh-TW"
  const logoPosition = formData.logoPosition || "left"
  const logoWidth = formData.logoWidth || 128
  const templateId = formData.templateId || "standard"
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    async function fetchSettings() {
      if (user) {
        try {
          const { data, error } = await supabase.schema('kino').from('company_settings').select('*').eq('user_id', user.id).single()
          // Handle case where no settings exist yet (PGRST116 = no rows returned)
          if (error && error.code !== 'PGRST116') {
            console.error('Failed to load company settings:', error)
          } else if (data) {
            setCompanySettings(data)
          }
        } catch (error) {
          console.error('Error fetching company settings:', error)
        }
      }
    }
    fetchSettings()
  }, [user])

  const t = (labels: Partial<Record<Language, string>>) => {
    const pLabel = labels[primaryLanguage] || labels['en'] || ''
    if (languageMode === "single") return pLabel
    const sLabel = labels[secondaryLanguage] || labels['zh-TW'] || ''
    return `${pLabel} / ${sLabel}`
  }

  const getDocumentTitle = () => {
    switch (documentType) {
      case "quotation": return { en: "QUOTATION", 'zh-TW': "報價單" };
      case "invoice": return { en: "INVOICE", 'zh-TW': "發票" };
      case "receipt": return { en: "OFFICIAL RECEIPT", 'zh-TW': "正式收據" };
      case "contract": return { en: "CONTRACT", 'zh-TW': "合約" };
      default: return { en: "DOCUMENT", 'zh-TW': "文件" };
    }
  }

  const titleLabels = getDocumentTitle()
  const isPaidReceipt = documentType === "receipt" && formData.paymentStatus?.status === "paid"

  const allStyles = {
    standard: {
      card: "bg-white text-foreground p-12 min-h-[800px] shadow-sm relative",
      header: "border-b border-border pb-8 mb-10",
      accentLine: "border-t border-foreground",
      itemRow: "border-b border-border/50",
      sectionHeader: "font-bold text-foreground mb-2 uppercase tracking-tight border-b border-border/50 pb-1"
    },
    // Simplified for now, using standard logic mostly
    corporate: { card: "bg-white p-12", header: "mb-10", accentLine: "border-t", itemRow: "border-b", sectionHeader: "font-bold" },
    modern: { card: "bg-white p-12", header: "mb-10", accentLine: "border-t", itemRow: "border-b", sectionHeader: "font-bold" }
  }
  const styles = allStyles[templateId] || allStyles.standard

  const Header = () => (
    <div className={styles.header}>
      <div className="flex justify-between items-start gap-6">
        <div className={`cursor-pointer hover:ring-2 hover:ring-primary/20 rounded p-1 transition-all group relative min-h-[60px] min-w-[120px]`} 
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.onchange = (e: any) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => onFieldChange?.('logo', reader.result as string);
                reader.readAsDataURL(file);
              }
            };
            input.click();
          }}>
          {formData.logo ? <img src={formData.logo} style={{ width: `${logoWidth}px` }} className="object-contain" /> : <div className="border-2 border-dashed border-border p-4 rounded text-center"><Upload className="w-5 h-5 mx-auto mb-1 opacity-20" /><span className="text-[10px] opacity-20">LOGO</span></div>}
          </div>
        <div className="text-right">
          <h1 className="text-4xl font-black text-foreground tracking-tighter">{t(titleLabels)}</h1>
          <div className="mt-4 space-y-1 text-[11px] font-bold">
            <p><span className="text-muted-foreground uppercase mr-2">{t({ en: "DOC NO", 'zh-TW': "編號" })}:</span> <span className="font-mono">{`${documentType.substring(0,2).toUpperCase()}-${currentYear}001`}</span></p>
            <p><span className="text-muted-foreground uppercase mr-2">{t({ en: "DATE", 'zh-TW': "日期" })}:</span> <span className="font-mono">{new Date().toISOString().split('T')[0]}</span></p>
          </div>
              </div>
            </div>
          </div>
  )

  const Parties = () => (
    <div className="grid grid-cols-2 gap-16 mb-12">
      <div className="space-y-2">
        <p className="text-[10px] font-black text-primary border-b border-primary/20 pb-1 mb-2 uppercase tracking-[0.2em]">{t({ en: "FROM", 'zh-TW': "發件人" })}</p>
        <EditableText value={formData.companyName || companySettings?.company_name || ""} field="companyName" placeholder="Company Name" className="text-base font-black text-foreground" onSave={onFieldChange} />
        <EditableText value={formData.companyAddress || companySettings?.company_address || ""} field="companyAddress" multiline placeholder="Address" className="text-xs text-muted-foreground leading-relaxed" onSave={onFieldChange} />
            </div>
      <div className="space-y-2">
        <p className="text-[10px] font-black text-primary border-b border-primary/20 pb-1 mb-2 uppercase tracking-[0.2em]">{t({ en: "BILL TO", 'zh-TW': "致" })}</p>
        <EditableText value={formData.clientName} field="clientName" placeholder="Client Name" className="text-base font-black text-foreground" onSave={onFieldChange} />
        <EditableText value={formData.clientAddress} field="clientAddress" multiline placeholder="Client Address" className="text-xs text-muted-foreground leading-relaxed" onSave={onFieldChange} />
            </div>
          </div>
  )

  const Items = () => (
    <div className="mb-10">
              <table className="w-full">
        <thead className="border-y-2 border-foreground">
          <tr>
            <th className="text-left py-3 text-[11px] font-black uppercase tracking-widest">{t({ en: "DESCRIPTION", 'zh-TW': "描述" })}</th>
            <th className="text-right py-3 text-[11px] font-black uppercase tracking-widest w-20">{t({ en: "QTY", 'zh-TW': "數量" })}</th>
            <th className="text-right py-3 text-[11px] font-black uppercase tracking-widest w-32">{t({ en: "PRICE", 'zh-TW': "單價" })}</th>
            <th className="text-right py-3 text-[11px] font-black uppercase tracking-widest w-32">{t({ en: "AMOUNT", 'zh-TW': "金額" })}</th>
                  </tr>
                </thead>
        <tbody className="divide-y divide-border/50">
          {formData.items.map((item, i) => (
            <tr key={i} className="group">
              <td className="py-4 text-xs font-bold relative">
                <EditableText value={item.description} field={`items.${i}.description`} onSave={onFieldChange} />
                <button onClick={() => onFieldChange?.('items', formData.items.filter((_, idx) => idx !== i))} className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-destructive"><Trash2 className="w-4 h-4" /></button>
              </td>
              <td className="py-4 text-right">
                <input type="number" value={item.quantity} onChange={(e) => {
                  const newItems = [...formData.items];
                  newItems[i].quantity = parseInt(e.target.value) || 0;
                  onFieldChange?.('items', newItems);
                }} className="w-full bg-transparent text-right outline-none text-xs font-bold" />
              </td>
              <td className="py-4 text-right">
                <input type="number" value={item.unitPrice} onChange={(e) => {
                  const newItems = [...formData.items];
                  newItems[i].unitPrice = parseFloat(e.target.value) || 0;
                  onFieldChange?.('items', newItems);
                }} className="w-full bg-transparent text-right outline-none text-xs font-bold" />
                      </td>
              <td className="py-4 text-right text-xs font-black">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
      <Button variant="ghost" className="w-full border-2 border-dashed border-border mt-4 h-10 text-[10px] font-black tracking-widest uppercase hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all" onClick={() => onFieldChange?.('items', [...formData.items, { description: "New Item", quantity: 1, unitPrice: 0 }])}>+ {t({ en: "Add Item", 'zh-TW': "增加項目" })}</Button>
    </div>
  )

  const Footer = () => (
    <div className="mt-16 pt-10 border-t-2 border-foreground">
      <div className="flex justify-between items-start">
        <div className="flex gap-16">
          <div className="w-48 text-center space-y-4">
            <div className="h-24 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center relative group cursor-pointer" onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.onchange = (e: any) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => onFieldChange?.('signature', reader.result as string);
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}>
              {formData.signature ? <img src={formData.signature} className="h-20 object-contain" /> : <Upload className="w-5 h-5 opacity-20" />}
            </div>
            <div className="border-t border-foreground/50 pt-2">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t({ en: "ISSUED BY", 'zh-TW': "發件人簽章" })}</p>
              <p className="text-[11px] font-black text-foreground mt-1 uppercase">{formData.companyName || companySettings?.company_name || ""}</p>
              </div>
          </div>

          {(documentType === 'contract') && (
            <div className="w-48 text-center space-y-4">
              <div className="h-24 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center relative group cursor-pointer">
                {formData.clientSignature ? <img src={formData.clientSignature} className="h-20 object-contain" /> : <Upload className="w-5 h-5 opacity-20" />}
              </div>
              <div className="border-t border-foreground/50 pt-2">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t({ en: "PREPARED FOR", 'zh-TW': "客戶簽章" })}</p>
                <p className="text-[11px] font-black text-foreground mt-1 uppercase">{formData.clientName || ""}</p>
              </div>
              </div>
            )}
          </div>

        <div className="w-64 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-muted-foreground">{t({ en: "SUBTOTAL", 'zh-TW': "小計" })}</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-black border-t-2 border-foreground pt-2">
            <span>{t({ en: "TOTAL", 'zh-TW': "總計" })}</span>
            <span className="text-primary">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="mt-20 text-center opacity-30 text-[10px] font-bold tracking-widest uppercase italic">
        {t({ en: "Thank you for your business!", 'zh-TW': "多謝惠顧！" })}
      </div>
    </div>
  )

  return (
    <Card className={styles.card}>
      {Header()}
      {Parties()}
      {Items()}
      {formData.notes && (
        <div className="mb-10">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">{t({ en: "NOTES", 'zh-TW': "備註" })}</p>
          <EditableText value={formData.notes} field="notes" multiline onSave={onFieldChange} className="text-xs text-muted-foreground" />
        </div>
      )}
      {Footer()}
    </Card>
  )
}
