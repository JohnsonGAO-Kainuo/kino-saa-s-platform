-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL,
  
  -- Document metadata
  doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('quotation', 'invoice', 'receipt', 'contract')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'paid', 'archived')),
  title VARCHAR(255),
  
  -- Client information
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(20),
  client_address TEXT,
  
  -- Document content
  content JSONB NOT NULL DEFAULT '{}',
  
  -- File uploads
  logo_url TEXT,
  signature_url TEXT,
  stamp_url TEXT,
  
  -- Bilingual support
  language VARCHAR(10) DEFAULT 'en',
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Document relationships table (for linking quotations to contracts, invoices, receipts)
CREATE TABLE document_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  source_doc_id UUID NOT NULL,
  target_doc_id UUID NOT NULL,
  relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('quotation_to_contract', 'quotation_to_invoice', 'contract_to_invoice', 'any_to_receipt')),
  notes TEXT,
  
  FOREIGN KEY (source_doc_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (target_doc_id) REFERENCES documents(id) ON DELETE CASCADE,
  UNIQUE (source_doc_id, target_doc_id)
);

-- AI prompts and generation history
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL,
  
  prompt TEXT NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  generated_doc_id UUID,
  
  -- AI metadata
  model VARCHAR(50),
  tokens_used INT,
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (generated_doc_id) REFERENCES documents(id) ON DELETE SET NULL
);

-- Company settings (logo, stamps, etc.)
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL UNIQUE,
  
  company_name VARCHAR(255),
  company_email VARCHAR(255),
  company_phone VARCHAR(20),
  company_address TEXT,
  company_tax_id VARCHAR(50),
  
  logo_url TEXT,
  stamp_url TEXT,
  signature_url TEXT,
  
  default_terms TEXT,
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_type ON documents(doc_type);
CREATE INDEX idx_document_relationships_source ON document_relationships(source_doc_id);
CREATE INDEX idx_document_relationships_target ON document_relationships(target_doc_id);
CREATE INDEX idx_ai_generations_user ON ai_generations(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can only see their own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can see relationships of their documents" ON document_relationships
  FOR SELECT USING (
    source_doc_id IN (SELECT id FROM documents WHERE user_id = auth.uid())
    OR target_doc_id IN (SELECT id FROM documents WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own generations" ON ai_generations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their company settings" ON company_settings
  FOR ALL USING (auth.uid() = user_id);
