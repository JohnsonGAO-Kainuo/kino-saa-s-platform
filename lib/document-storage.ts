import { supabase } from './supabase'
import { Document, DocumentType, DocumentStatus, RelationshipType } from './types'

export class DocumentStorage {
  async saveDocument(doc: Partial<Document>): Promise<Document | null> {
    const { data, error } = await supabase
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

  async getAllDocuments(filters?: { type?: DocumentType; status?: DocumentStatus }): Promise<Document[]> {
    let query = supabase.from('documents').select('*')

    if (filters?.type) query = query.eq('doc_type', filters.type)
    if (filters?.status) query = query.eq('status', filters.status)

    const { data, error } = await query.order('updated_at', { ascending: false })

    if (error) {
      console.error('Error getting documents:', error)
      return []
    }

    return data || []
  }

  async deleteDocument(id: string): Promise<boolean> {
    const { error } = await supabase
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
