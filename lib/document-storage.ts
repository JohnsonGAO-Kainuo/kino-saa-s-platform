// Client-side document storage and management
// This will be replaced by Supabase integration later

interface StoredDocument {
  id: string
  type: "quotation" | "invoice" | "receipt" | "contract"
  title: string
  clientName: string
  content: any
  createdAt: Date
  updatedAt: Date
  status: "draft" | "sent" | "archived"
}

interface DocumentRelationship {
  sourceId: string
  targetId: string
  type: string
  createdAt: Date
}

class DocumentStorage {
  private documents: Map<string, StoredDocument> = new Map()
  private relationships: DocumentRelationship[] = []
  private storageKey = "kino_documents"
  private relationshipKey = "kino_relationships"

  constructor() {
    this.loadFromStorage()
  }

  saveDocument(doc: StoredDocument): void {
    this.documents.set(doc.id, doc)
    this.persistToStorage()
  }

  getDocument(id: string): StoredDocument | undefined {
    return this.documents.get(id)
  }

  getAllDocuments(): StoredDocument[] {
    return Array.from(this.documents.values())
  }

  deleteDocument(id: string): void {
    this.documents.delete(id)
    this.relationships = this.relationships.filter((r) => r.sourceId !== id && r.targetId !== id)
    this.persistToStorage()
  }

  createRelationship(sourceId: string, targetId: string, type: string): void {
    const relationship: DocumentRelationship = {
      sourceId,
      targetId,
      type,
      createdAt: new Date(),
    }
    this.relationships.push(relationship)
    this.persistToStorage()
  }

  getRelationships(docId: string): DocumentRelationship[] {
    return this.relationships.filter((r) => r.sourceId === docId)
  }

  removeRelationship(sourceId: string, targetId: string): void {
    this.relationships = this.relationships.filter((r) => !(r.sourceId === sourceId && r.targetId === targetId))
    this.persistToStorage()
  }

  private persistToStorage(): void {
    try {
      const docsArray = Array.from(this.documents.values())
      localStorage.setItem(this.storageKey, JSON.stringify(docsArray))
      localStorage.setItem(this.relationshipKey, JSON.stringify(this.relationships))
    } catch (e) {
      console.error("Failed to persist to storage:", e)
    }
  }

  private loadFromStorage(): void {
    try {
      const docsData = localStorage.getItem(this.storageKey)
      const relData = localStorage.getItem(this.relationshipKey)

      if (docsData) {
        const docs = JSON.parse(docsData) as StoredDocument[]
        docs.forEach((doc) => {
          this.documents.set(doc.id, {
            ...doc,
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(doc.updatedAt),
          })
        })
      }

      if (relData) {
        const rels = JSON.parse(relData) as DocumentRelationship[]
        this.relationships = rels.map((r) => ({
          ...r,
          createdAt: new Date(r.createdAt),
        }))
      }
    } catch (e) {
      console.error("Failed to load from storage:", e)
    }
  }

  generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const documentStorage = new DocumentStorage()
