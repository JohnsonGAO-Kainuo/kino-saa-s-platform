// Document types
export type DocumentType = "quotation" | "invoice" | "receipt" | "contract"
export type DocumentStatus = "draft" | "sent" | "accepted" | "rejected" | "paid" | "archived"
export type RelationshipType =
  | "quotation_to_contract"
  | "quotation_to_invoice"
  | "contract_to_invoice"
  | "any_to_receipt"

export interface Document {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  doc_type: DocumentType
  status: DocumentStatus
  title?: string
  client_name?: string
  client_email?: string
  client_phone?: string
  client_address?: string
  content: Record<string, any>
  logo_url?: string
  signature_url?: string
  stamp_url?: string
  language: "en" | "zh"
}

export interface DocumentRelationship {
  id: string
  source_doc_id: string
  target_doc_id: string
  relationship_type: RelationshipType
  notes?: string
}

export interface CompanySettings {
  id: string
  company_name?: string
  company_email?: string
  company_phone?: string
  company_address?: string
  company_tax_id?: string
  logo_url?: string
  stamp_url?: string
  signature_url?: string
  default_terms?: string
}

export interface AIGeneration {
  id: string
  prompt: string
  document_type: DocumentType
  generated_doc_id?: string
  model: string
  tokens_used: number
}
