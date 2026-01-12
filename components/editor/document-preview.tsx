"use client"

import React, { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import type { PaymentStatus } from "@/lib/payment-utils"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Building2, User, Pen, Trash2, Plus, Upload } from 'lucide-react'
import type { Language } from '@/lib/language-context'

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

export function DocumentPreview({ documentType, formData, onFieldChange, onFieldClick }: DocumentPreviewProps) {
  const { user } = useAuth()
  const [companySettings, setCompanySettings] = useState<any>(null)
  const [draggingAsset, setDraggingAsset] = useState<'signature' | 'stamp' | 'clientSignature' | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  // Helper for inline editing
  const EditableText = ({ 
    value, 
    field, 
    placeholder, 
    multiline = false,
    className = "" 
  }: { 
    value: string; 
    field: string; 
    placeholder?: string;
    multiline?: boolean;
    className?: string;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleBlur = () => {
      setIsEditing(false);
      if (localValue !== value) {
        onFieldChange?.(field, localValue);
      }
    };

    if (isEditing) {
      if (multiline) {
        return (
          <textarea
            autoFocus
            className={`w-full p-1 border-2 border-blue-400 rounded outline-none bg-blue-50/30 text-inherit font-inherit resize-none ${className}`}
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
          className={`w-full p-1 border-2 border-blue-400 rounded outline-none bg-blue-50/30 text-inherit font-inherit ${className}`}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
        />
      );
    }

    return (
      <div 
        onClick={() => setIsEditing(true)}
        className={`cursor-text hover:bg-blue-50/50 hover:ring-1 hover:ring-blue-200 rounded px-1 transition-all min-h-[1.2em] relative group ${className}`}
      >
        <span className={!value ? "text-gray-300 italic" : ""}>
          {value || placeholder}
        </span>
        <Pen className="w-3 h-3 absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 text-blue-500" />
      </div>
    );
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const paymentStatus = formData.paymentStatus
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
        const { data } = await supabase
          .from('company_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()
        if (data) setCompanySettings(data)
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
      case "quotation":
        return { en: "QUOTATION", 'zh-TW': "報價單", fr: "DEVIS", ja: "見積書", es: "PRESUPUESTO" }
      case "invoice":
        return { en: "INVOICE", 'zh-TW': "發票", fr: "FACTURE", ja: "請求書", es: "FACTURA" }
      case "receipt":
        return { en: "OFFICIAL RECEIPT", 'zh-TW': "正式收據", fr: "REÇU", ja: "領収書", es: "RECIBO" }
      case "contract":
        return { en: "CONTRACT", 'zh-TW': "合約", fr: "CONTRAT", ja: "契約書", es: "CONTRATO" }
      default:
        return { en: "DOCUMENT", 'zh-TW': "文件" }
    }
  }

  const titleLabels = getDocumentTitle()

  const isPaidReceipt = documentType === "receipt" && paymentStatus?.status === "paid"
  const isVoidedReceipt = documentType === "receipt" && paymentStatus?.status === "voided"

  const styles = {
    standard: {
      card: "bg-white text-black p-8 min-h-[800px] shadow-lg border-border/50 sticky top-0 relative",
      header: "border-b-2 border-gray-800 pb-6 mb-8",
      accentLine: "border-t-2 border-gray-800",
      itemRow: "border-b border-gray-300",
      sectionHeader: "font-bold text-gray-900 mb-2 uppercase tracking-tight border-b border-gray-200 pb-1"
    },
    corporate: {
      card: "bg-white text-black p-10 min-h-[842px] shadow-lg border-t-8 border-[#1a1f36] sticky top-0 relative",
      header: "flex justify-between items-start mb-12",
      accentLine: "border-t border-gray-400",
      itemRow: "border-b border-gray-100",
      sectionHeader: "bg-gray-50 px-2 py-1 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3"
    },
    modern: {
      card: "bg-white text-black p-8 min-h-[800px] shadow-lg sticky top-0 relative overflow-hidden",
      header: "flex justify-between items-center mb-8 bg-[#6366f1]/5 -mx-8 px-8 py-6 border-b border-[#6366f1]/10",
      accentLine: "border-t-2 border-[#6366f1]",
      itemRow: "border-b border-slate-50",
      sectionHeader: "text-[#6366f1] text-[12px] font-black uppercase tracking-tighter mb-2"
    }
  }[templateId]

  const DocumentWrapper = ({ children }: { children: React.ReactNode }) => (
    <Card id="document-preview-card" className={`${styles.card} ${isPaidReceipt || isVoidedReceipt ? "bg-gradient-to-br from-white to-slate-50" : ""}`}>
      {templateId === 'modern' && <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366f1]/10 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />}
      <div className="max-w-full text-sm leading-relaxed relative z-10">{children}</div>
    </Card>
  )

  const Header = () => {
    const Logo = () => (
      <div 
        className={`flex ${logoPosition === "center" ? "justify-center" : logoPosition === "right" ? "justify-end" : "justify-start"} cursor-pointer hover:ring-2 hover:ring-[#6366f1] rounded p-1 transition-all group relative min-h-[60px] min-w-[120px]`} 
        onClick={(e) => {
          e.stopPropagation();
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                onFieldChange?.('logo', reader.result as string);
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        }}
      >
        {formData.logo ? (
          <>
            <img src={formData.logo} alt="Logo" style={{ width: `${logoWidth}px` }} className="h-auto object-contain rounded" crossOrigin="anonymous" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded">
              <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">Click to Change</span>
            </div>
          </>
        ) : (companySettings?.logo_url && !companySettings.logo_url.includes('kino')) ? (
          <>
            <img src={companySettings.logo_url} alt="Company Logo" style={{ width: `${logoWidth}px` }} className="h-auto object-contain rounded" crossOrigin="anonymous" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded">
              <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">Click to Change</span>
            </div>
          </>
        ) : (
          <div className={`flex flex-col items-${logoPosition === 'center' ? 'center' : logoPosition === 'right' ? 'end' : 'start'} border-2 border-dashed border-gray-300 hover:border-blue-400 p-4 rounded bg-gray-50/50 hover:bg-blue-50/30 w-full transition-all`}>
            <Upload className="w-6 h-6 text-gray-300 mb-1" />
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t({ en: "UPLOAD LOGO", 'zh-TW': "點擊上傳標誌" })}</div>
          </div>
        )}
      </div>
    )

    const Title = () => {
      const docNumber = `${documentType === "quotation" ? "QT" : documentType === "contract" ? "CTR" : documentType === "invoice" ? "INV" : "RC"}-${currentYear}001`
      const currentDate = new Date().toISOString().split('T')[0]
      const validUntilDate = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]

      return (
        <div className="text-right">
          <div className="flex flex-col gap-1 items-end">
            <h1 className={`font-bold ${templateId === 'modern' ? 'text-4xl text-[#1a1f36]' : 'text-3xl text-gray-900'}`}>{t(titleLabels)}</h1>
            <div className="mt-4 space-y-1 text-right">
              <div className="flex justify-end items-center gap-4 text-[11px]">
                <span className="font-bold text-gray-900 uppercase tracking-wide">{t({ en: "DOC NO.", 'zh-TW': "編號" })}</span>
                <span className="font-mono text-gray-600">{docNumber}</span>
              </div>
              <div className="flex justify-end items-center gap-4 text-[11px]">
                <span className="font-bold text-gray-900 uppercase tracking-wide">{t({ en: "DATE", 'zh-TW': "日期" })}</span>
                <span className="font-mono text-gray-600">{currentDate}</span>
              </div>
              {(documentType === "quotation" || documentType === "contract") && (
                <div className="flex justify-end items-center gap-4 text-[11px]">
                  <span className="font-bold text-gray-900 uppercase tracking-wide">{t({ en: "VALID UNTIL", 'zh-TW': "有效期至" })}</span>
                  <span className="font-mono text-gray-600">{validUntilDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={styles.header}>
        <div className={`flex flex-col md:flex-row justify-between items-start gap-6 w-full`}>
          <div className={`w-full md:w-auto ${logoPosition !== "left" ? "order-2 md:order-1" : ""}`}><Logo /></div>
          <div className={`w-full md:w-auto ${logoPosition === "left" ? "order-1 md:order-2" : "order-1"}`}><Title /></div>
        </div>
      </div>
    )
  }

  const PartiesInfo = () => {
    const displayCompanyName = formData.companyName || companySettings?.company_name || ""
    const displayCompanyAddress = formData.companyAddress || companySettings?.company_address || ""

    return (
      <div className={`grid grid-cols-2 gap-12 mb-10 ${templateId === 'modern' ? 'bg-slate-50/50 p-6 rounded-2xl border border-slate-100' : ''}`}>
        <div className="text-xs space-y-1">
          <p className="text-yellow-600 font-bold mb-1 uppercase tracking-widest text-[10px] border-b border-yellow-100 pb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" /> {t({ en: "FROM", 'zh-TW': "發件人" })}
          </p>
          <EditableText 
            value={displayCompanyName} 
            field="companyName" 
            placeholder={t({ en: "[Company Name]", 'zh-TW': "[公司名稱]" })} 
            className="font-black text-gray-900 uppercase text-sm" 
          />
          <EditableText 
            value={displayCompanyAddress} 
            field="companyAddress" 
            multiline
            placeholder={t({ en: "[Address]", 'zh-TW': "[地址]" })} 
            className="text-gray-600 leading-relaxed" 
          />
        </div>
        <div className="text-xs space-y-1">
          <p className="text-yellow-600 font-bold mb-1 uppercase tracking-widest text-[10px] border-b border-yellow-100 pb-1 flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> {t({ en: "BILL TO", 'zh-TW': "致" })}
          </p>
          <EditableText 
            value={formData.clientName} 
            field="clientName" 
            placeholder={t({ en: "[Client Name]", 'zh-TW': "[客戶名稱]" })} 
            className="font-black text-[14px] text-gray-900 mt-2" 
          />
          <EditableText 
            value={formData.clientAddress} 
            field="clientAddress" 
            multiline
            placeholder={t({ en: "[Client Address]", 'zh-TW': "[客戶地址]" })} 
            className="text-gray-600 leading-relaxed" 
          />
        </div>
      </div>
    )
  }

  const ItemsTable = () => (
    <div className="mb-6">
      <table className="w-full">
        <thead>
          <tr className={styles.accentLine}>
            <th className="text-left py-2 font-bold text-xs text-gray-900">{t({ en: "Description", 'zh-TW': "描述" })}</th>
            <th className="text-right py-2 font-bold text-xs w-16 text-gray-900">{t({ en: "Qty", 'zh-TW': "數量" })}</th>
            <th className="text-right py-2 font-bold text-xs w-20 text-gray-900">{t({ en: "Unit Price", 'zh-TW': "單價" })}</th>
            <th className="text-right py-2 font-bold text-xs w-20 text-gray-900">{t({ en: "Amount", 'zh-TW': "金額" })}</th>
          </tr>
        </thead>
        <tbody>
          {formData.items.map((item, index) => (
            <React.Fragment key={index}>
              <tr className={styles.itemRow}>
                <td className="py-3 text-xs text-gray-900 font-semibold group relative">
                  <EditableText 
                    value={item.description} 
                    field={`items.${index}.description`} 
                    placeholder="Description"
                    className="font-semibold"
                  />
                  <button 
                    onClick={() => {
                      const newItems = [...formData.items];
                      newItems.splice(index, 1);
                      onFieldChange?.('items', newItems);
                    }}
                    className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
                <td className="text-right py-3 text-xs text-gray-800">
                  <input 
                    type="number"
                    className="w-12 bg-transparent text-right outline-none hover:bg-blue-50 focus:bg-blue-50 rounded px-1 transition-all"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].quantity = parseInt(e.target.value) || 0;
                      onFieldChange?.('items', newItems);
                    }}
                  />
                </td>
                <td className="text-right py-3 text-xs text-gray-800">
                  <div className="flex items-center justify-end">
                    <span>$</span>
                    <input 
                      type="number"
                      className="w-20 bg-transparent text-right outline-none hover:bg-blue-50 focus:bg-blue-50 rounded px-1 transition-all"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].unitPrice = parseFloat(e.target.value) || 0;
                        onFieldChange?.('items', newItems);
                      }}
                    />
                  </div>
                </td>
                <td className="text-right py-3 font-semibold text-xs text-gray-900">${(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
              {item.subItems && item.subItems.length > 0 && item.subItems.map((subItem, sIndex) => (
                <tr key={`${index}-${sIndex}`} className="border-b border-gray-100 bg-gray-50/20">
                  <td colSpan={4} className="py-1 pl-6 text-[11px] text-gray-500 group relative">
                    <div className="flex items-center gap-1">
                      <span>•</span>
                      <EditableText 
                        value={subItem} 
                        field={`items.${index}.subItems.${sIndex}`} 
                        placeholder="Detail..."
                        className="text-[11px] flex-1"
                      />
                      <button 
                        onClick={() => {
                          const newItems = [...formData.items];
                          newItems[index].subItems = newItems[index].subItems?.filter((_, i) => i !== sIndex);
                          onFieldChange?.('items', newItems);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <button 
        onClick={() => {
          const newItems = [...formData.items, { description: "", quantity: 1, unitPrice: 0, subItems: [] }];
          onFieldChange?.('items', newItems);
        }}
        className="w-full py-2 border-2 border-dashed border-gray-100 text-gray-300 hover:border-blue-200 hover:text-blue-400 rounded-lg transition-all flex items-center justify-center gap-1 mt-2 text-xs font-bold"
      >
        <Plus className="w-3.5 h-3.5" /> {t({ en: "ADD ITEM", 'zh-TW': "增加項目" })}
      </button>
    </div>
  )

  const Footer = () => {
    const stampX = formData.stampOffset?.x || 0
    const stampY = formData.stampOffset?.y || 0
    const sigX = formData.signatureOffset?.x || 0
    const sigY = formData.signatureOffset?.y || 0
    const clientSigX = formData.clientSignatureOffset?.x || 0
    const clientSigY = formData.clientSignatureOffset?.y || 0

    const handleAssetClick = (assetType: 'signature' | 'stamp' | 'clientSignature', currentValue: string | null | undefined) => {
      if (currentValue) {
        const action = confirm(t({ en: "Remove this asset or upload a new one?\n\nOK = Remove\nCancel = Upload new", 'zh-TW': "移除此資產還是上傳新的？\n\n確定 = 移除\n取消 = 上傳新的" }));
        if (action) {
          onFieldChange?.(assetType, null);
        } else {
          triggerAssetUpload(assetType);
        }
      } else {
        triggerAssetUpload(assetType);
      }
    };

    const triggerAssetUpload = (assetType: 'signature' | 'stamp' | 'clientSignature') => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          // Auto background removal for stamps/signatures
          try {
            const { removeImageBackground, dataURLtoFile } = await import('@/lib/image-utils');
            const transparentDataUrl = await removeImageBackground(file);
            onFieldChange?.(assetType, transparentDataUrl);
          } catch (error) {
            console.error('Background removal failed:', error);
            // Fallback: upload without bg removal
            const reader = new FileReader();
            reader.onloadend = () => {
              onFieldChange?.(assetType, reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        }
      };
      input.click();
    };

    const handleMouseDown = (e: React.MouseEvent, assetType: 'signature' | 'stamp' | 'clientSignature') => {
      e.preventDefault();
      e.stopPropagation();
      setDraggingAsset(assetType);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    useEffect(() => {
      if (!draggingAsset) return;

      const handleMouseMove = (e: MouseEvent) => {
        if (!draggingAsset) return;
        const container = document.getElementById('document-preview-card');
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const newX = e.clientX - containerRect.left - dragOffset.x;
        const newY = e.clientY - containerRect.top - dragOffset.y;
        
        const offsetField = `${draggingAsset}Offset` as 'signatureOffset' | 'stampOffset' | 'clientSignatureOffset';
        onFieldChange?.(offsetField, { x: Math.round(newX), y: Math.round(newY) });
      };

      const handleMouseUp = () => {
        setDraggingAsset(null);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [draggingAsset, dragOffset, onFieldChange]);

    // Quotation usually has no signature
    if (documentType === "quotation") {
      return (
        <div className="pt-8 mt-12 border-t-2 border-gray-800">
          <div className="flex justify-end">
            <div className="w-64 space-y-1">
              <div className="flex justify-between py-1 text-xs">
                <span className="font-bold text-gray-900">{t({ en: "SUBTOTAL", 'zh-TW': "小計" })}:</span>
                <span className="text-gray-900">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-gray-900 border-t-2 border-gray-800 mt-2">
                <span className="text-sm">{t({ en: "TOTAL", 'zh-TW': "總計" })}:</span>
                <span className="text-sm">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center border-t border-gray-100 pt-4">
            <p className="text-[11px] text-gray-400 italic">{t({ en: "Thank you for your business!", 'zh-TW': "多謝惠顧！" })}</p>
            <p className="text-[10px] text-gray-300 mt-2">{t({ en: "End of Document", 'zh-TW': "文件完" })}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="pt-8 mt-12 border-t-2 border-gray-800">
        <div className="flex justify-between items-end">
          <div className="w-64 space-y-1">
            <div className="flex justify-between py-1 text-xs">
              <span className="font-bold text-gray-900">{t({ en: "SUBTOTAL", 'zh-TW': "小計" })}:</span>
              <span className="text-gray-900">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-gray-900 border-t-2 border-gray-800 mt-2">
              <span className="text-sm">{t({ en: "TOTAL", 'zh-TW': "總計" })}:</span>
              <span className="text-sm">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex gap-12">
            {/* Issuer Signature & Stamp */}
            <div className="relative flex flex-col items-center min-w-[200px]">
              <div className="h-28 flex items-center justify-center relative w-full mb-2">
                {(formData.stamp || companySettings?.stamp_url) ? (
                  <div 
                    className="absolute right-0 top-0 opacity-80 cursor-move hover:ring-2 hover:ring-blue-400 rounded p-1 transition-all group"
                    style={{ transform: `translate(${stampX}px, ${stampY}px)` }}
                    onMouseDown={(e) => handleMouseDown(e, 'stamp')}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssetClick('stamp', formData.stamp || companySettings?.stamp_url);
                    }}
                  >
                    <img src={formData.stamp || companySettings?.stamp_url} alt="Stamp" className="h-24 w-24 object-contain" crossOrigin="anonymous" />
                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-lg">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => handleAssetClick('stamp', null)}
                    className="absolute right-0 top-0 border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-lg p-2 cursor-pointer bg-gray-50/50 hover:bg-blue-50/30 transition-all flex items-center justify-center"
                    style={{ width: '96px', height: '96px' }}
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                      <span className="text-[8px] text-gray-400">STAMP</span>
                    </div>
                  </div>
                )}
                
                {(formData.signature || companySettings?.signature_url) ? (
                  <div 
                    className="z-10 cursor-move hover:ring-2 hover:ring-blue-400 rounded p-1 transition-all group"
                    style={{ transform: `translate(${sigX}px, ${sigY}px)` }}
                    onMouseDown={(e) => handleMouseDown(e, 'signature')}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssetClick('signature', formData.signature || companySettings?.signature_url);
                    }}
                  >
                    <img src={formData.signature || companySettings?.signature_url} alt="Signature" className="h-20 w-48 object-contain" crossOrigin="anonymous" />
                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-lg">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => handleAssetClick('signature', null)}
                    className="border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-lg p-4 cursor-pointer bg-gray-50/50 hover:bg-blue-50/30 transition-all flex items-center justify-center"
                    style={{ width: '192px', height: '80px' }}
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                      <span className="text-[8px] text-gray-400">SIGNATURE</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-full border-t border-gray-900 pt-2 text-center">
                <p className="font-bold text-[10px] uppercase tracking-tight text-gray-900">
                  {documentType === "contract" ? t({ en: "PARTY A (ISSUER)", 'zh-TW': "甲方 (發件人)" }) : t({ en: "AUTHORIZED SIGNATURE & CHOP", 'zh-TW': "授權簽名及公司蓋章" })}
                </p>
              </div>
            </div>

            {/* Client Signature (Contract Only) */}
            {documentType === "contract" && (
              <div className="relative flex flex-col items-center min-w-[200px]">
                <div className="h-28 flex items-center justify-center relative w-full mb-2">
                  {formData.clientSignature ? (
                    <div 
                      className="cursor-move hover:ring-2 hover:ring-blue-400 rounded p-1 transition-all group"
                      style={{ transform: `translate(${clientSigX}px, ${clientSigY}px)` }}
                      onMouseDown={(e) => handleMouseDown(e, 'clientSignature')}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssetClick('clientSignature', formData.clientSignature);
                      }}
                    >
                      <img src={formData.clientSignature} alt="Client Signature" className="h-20 w-48 object-contain" crossOrigin="anonymous" />
                      <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-lg">
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => handleAssetClick('clientSignature', null)}
                      className="border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-lg p-4 cursor-pointer bg-gray-50/50 hover:bg-blue-50/30 transition-all flex items-center justify-center"
                      style={{ width: '192px', height: '80px' }}
                    >
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                        <span className="text-[8px] text-gray-400">CLIENT SIGNATURE</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-full border-t border-gray-900 pt-2 text-center">
                  <p className="font-bold text-[10px] uppercase tracking-tight text-gray-900">
                    {t({ en: "PARTY B (CLIENT)", 'zh-TW': "乙方 (客戶)" })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-12 text-center border-t border-gray-100 pt-4">
          <p className="text-[11px] text-gray-400 italic">{t({ en: "Thank you for your business!", 'zh-TW': "多謝惠顧！" })}</p>
          <p className="text-[10px] text-gray-300 mt-2">{t({ en: "End of Document", 'zh-TW': "文件完" })}</p>
        </div>
      </div>
    )
  }

  return (
    <DocumentWrapper>
      <Header />
      <PartiesInfo />
      <ItemsTable />
      {formData.notes && (
        <div className="mb-6 pt-4 border-t border-gray-300">
          <p className={styles.sectionHeader}>{t({ en: "Notes", 'zh-TW': "備註" })}:</p>
          <EditableText 
            value={formData.notes} 
            field="notes" 
            multiline
            placeholder={t({ en: "Additional notes...", 'zh-TW': "額外備註..." })} 
            className="text-xs text-gray-700 whitespace-pre-wrap" 
          />
        </div>
      )}
      <Footer />
    </DocumentWrapper>
  )
}
