import type { Document, DocumentRelationship, DocumentType, RelationshipType } from "./types"

// Valid relationship paths for document workflow
const VALID_RELATIONSHIPS: Record<RelationshipType, { from: DocumentType; to: DocumentType }> = {
  quotation_to_contract: { from: "quotation", to: "contract" },
  quotation_to_invoice: { from: "quotation", to: "invoice" },
  contract_to_invoice: { from: "contract", to: "invoice" },
  any_to_receipt: { from: "quotation", to: "receipt" }, // Special case: any doc can lead to receipt
}

export class DocumentMatcher {
  /**
   * Validate if two documents can be linked based on business rules
   */
  static canLink(sourceDoc: Document, targetDoc: Document): { valid: boolean; reason?: string } {
    // Cannot link a document to itself
    if (sourceDoc.id === targetDoc.id) {
      return { valid: false, reason: "Cannot link a document to itself" }
    }

    // Quotation can link to Contract or Invoice
    if (sourceDoc.doc_type === "quotation") {
      if (targetDoc.doc_type === "contract" || targetDoc.doc_type === "invoice" || targetDoc.doc_type === "receipt") {
        return { valid: true }
      }
      return { valid: false, reason: "Quotation can only link to Contract, Invoice, or Receipt" }
    }

    // Contract can link to Invoice or Receipt
    if (sourceDoc.doc_type === "contract") {
      if (targetDoc.doc_type === "invoice" || targetDoc.doc_type === "receipt") {
        return { valid: true }
      }
      return { valid: false, reason: "Contract can only link to Invoice or Receipt" }
    }

    // Invoice can link to Receipt
    if (sourceDoc.doc_type === "invoice") {
      if (targetDoc.doc_type === "receipt") {
        return { valid: true }
      }
      return { valid: false, reason: "Invoice can only link to Receipt" }
    }

    // Receipt cannot be source
    if (sourceDoc.doc_type === "receipt") {
      return { valid: false, reason: "Receipt cannot be the source document" }
    }

    return { valid: false, reason: "Invalid document combination" }
  }

  /**
   * Get the relationship type between two documents
   */
  static getRelationshipType(sourceType: DocumentType, targetType: DocumentType): RelationshipType | null {
    if (sourceType === "quotation" && targetType === "contract") return "quotation_to_contract"
    if (sourceType === "quotation" && targetType === "invoice") return "quotation_to_invoice"
    if (sourceType === "contract" && targetType === "invoice") return "contract_to_invoice"
    if (targetType === "receipt") return "any_to_receipt"
    return null
  }

  /**
   * Get suggested next documents based on current document type
   */
  static getSuggestedNext(currentType: DocumentType): DocumentType[] {
    switch (currentType) {
      case "quotation":
        return ["contract", "invoice", "receipt"]
      case "contract":
        return ["invoice", "receipt"]
      case "invoice":
        return ["receipt"]
      case "receipt":
        return []
      default:
        return []
    }
  }

  /**
   * Get document workflow path (for visualization)
   */
  static getWorkflowPath(documents: Document[], relationships: DocumentRelationship[]): Document[] {
    // Find the root document (quotation or contract)
    const rootDoc = documents.find((d) => d.doc_type === "quotation" || d.doc_type === "contract")
    if (!rootDoc) return documents

    const path: Document[] = [rootDoc]
    let currentDocId = rootDoc.id

    while (true) {
      const nextRelationship = relationships.find((r) => r.source_doc_id === currentDocId)
      if (!nextRelationship) break

      const nextDoc = documents.find((d) => d.id === nextRelationship.target_doc_id)
      if (!nextDoc) break

      path.push(nextDoc)
      currentDocId = nextDoc.id
    }

    return path
  }
}
