import { supabase } from './supabase'
import { Document, DocumentType, DocumentStatus, RelationshipType } from './types'

export class DocumentStorage {
  async saveDocument(doc: Partial<Document>): Promise<Document | null> {
    const { data, error } = await supabase
      .schema('kino')
      .from('documents')
      .upsert({
        ...doc,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving document:', error)
      return null
    }

    return data
  }

  async getDocument(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .schema('kino')
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error getting document:', error)
      return null
    }

    return data
  }

  async getAllDocuments(filters?: { type?: DocumentType; status?: DocumentStatus; limit?: number }): Promise<Document[]> {
    try {
      const limit = filters?.limit ?? 100
      let query: any = supabase.schema('kino').from('documents').select('*', { count: 'exact' })

      if (filters?.type) query = query.eq('doc_type', filters.type)
      if (filters?.status) query = query.eq('status', filters.status)

      query = query.limit(limit)

      const { data, error } = await query.order('updated_at', { ascending: false })

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST301') {
          console.warn('Documents table may not exist yet. Please run the database migration scripts.')
        } else {
          console.error('Error getting documents:', error)
        }
        return []
      }

      return data || []
    } catch (err) {
      console.error('Unexpected error getting documents:', err)
      return []
    }
  }

  async getDocumentStats(): Promise<{ total: number; quotations: number; contracts: number; invoices: number }> {
    try {
      const { data, error } = await supabase.schema('kino').from('documents').select('doc_type')

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST301') {
          console.warn('Documents table may not exist yet.')
        } else {
          console.error('Error getting document stats:', error)
        }
        return { total: 0, quotations: 0, contracts: 0, invoices: 0 }
      }

      const stats = {
        total: data?.length || 0,
        quotations: data?.filter((d: any) => d.doc_type === 'quotation').length || 0,
        contracts: data?.filter((d: any) => d.doc_type === 'contract').length || 0,
        invoices: data?.filter((d: any) => d.doc_type === 'invoice').length || 0,
      }

      return stats
    } catch (err) {
      console.error('Unexpected error getting document stats:', err)
      return { total: 0, quotations: 0, contracts: 0, invoices: 0 }
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    const { error } = await supabase
      .schema('kino')
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting document:', error)
      return false
    }

    return true
  }

  async createRelationship(sourceId: string, targetId: string, type: RelationshipType): Promise<boolean> {
    const { error } = await supabase
      .schema('kino')
      .from('document_relationships')
      .insert({
        source_doc_id: sourceId,
        target_doc_id: targetId,
        relationship_type: type,
      })

    if (error) {
      console.error('Error creating relationship:', error)
      return false
    }

    return true
  }

  async getRelationships(docId: string): Promise<any[]> {
    const { data, error } = await supabase
      .schema('kino')
      .from('document_relationships')
      .select('*')
      .or(`source_doc_id.eq.${docId},target_doc_id.eq.${docId}`)

    if (error) {
      console.error('Error getting relationships:', error)
      return []
    }

    return data || []
  }
}

export const documentStorage = new DocumentStorage()
