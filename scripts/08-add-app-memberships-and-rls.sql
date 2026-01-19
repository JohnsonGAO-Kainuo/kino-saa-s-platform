-- Migration: Add app_memberships table and update RLS for multi-project isolation
-- This migration implements project isolation using membership-based RLS

BEGIN;

-- Create membership table
CREATE TABLE IF NOT EXISTS kino.app_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_slug text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, app_slug)
);

CREATE INDEX IF NOT EXISTS idx_app_memberships_user_app ON kino.app_memberships(user_id, app_slug);

-- Seed memberships for existing users
INSERT INTO kino.app_memberships(user_id, app_slug)
SELECT DISTINCT user_id, 'kino'
FROM (
  SELECT user_id FROM kino.documents
  UNION ALL SELECT user_id FROM kino.company_settings
  UNION ALL SELECT user_id FROM kino.subscriptions
  UNION ALL SELECT user_id FROM kino.user_assets
  UNION ALL SELECT user_id FROM kino.user_consents
  UNION ALL SELECT user_id FROM kino.ai_generations
) s
WHERE user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Helper function to check kino membership
CREATE OR REPLACE FUNCTION kino.is_kino_member()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM kino.app_memberships m
    WHERE m.user_id = auth.uid()
      AND m.app_slug = 'kino'
  );
$$;

-- Enable RLS on membership table
ALTER TABLE kino.app_memberships ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on affected tables
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN (
    SELECT polname, n.nspname, c.relname
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'kino'
      AND c.relname IN (
        'app_memberships','ai_generations','company_settings','document_relationships',
        'documents','subscriptions','user_assets','user_consents'
      )
  ) LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.polname, r.nspname, r.relname);
  END LOOP;
END$$;

-- RLS Policies for app_memberships
CREATE POLICY app_memberships_select_self
ON kino.app_memberships
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY app_memberships_insert_self
ON kino.app_memberships
FOR INSERT
WITH CHECK (auth.uid() = user_id AND app_slug = 'kino');

-- RLS Policies for ai_generations
ALTER TABLE kino.ai_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_generations_select_self ON kino.ai_generations FOR SELECT USING (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY ai_generations_insert_self ON kino.ai_generations FOR INSERT WITH CHECK (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY ai_generations_update_self ON kino.ai_generations FOR UPDATE USING (auth.uid() = user_id AND kino.is_kino_member()) WITH CHECK (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY ai_generations_delete_self ON kino.ai_generations FOR DELETE USING (auth.uid() = user_id AND kino.is_kino_member());

-- RLS Policies for company_settings
ALTER TABLE kino.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_settings_select_self ON kino.company_settings FOR SELECT USING (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY company_settings_insert_self ON kino.company_settings FOR INSERT WITH CHECK (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY company_settings_update_self ON kino.company_settings FOR UPDATE USING (auth.uid() = user_id AND kino.is_kino_member()) WITH CHECK (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY company_settings_delete_self ON kino.company_settings FOR DELETE USING (auth.uid() = user_id AND kino.is_kino_member());

-- RLS Policies for documents
ALTER TABLE kino.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_select_self ON kino.documents FOR SELECT USING (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY documents_insert_self ON kino.documents FOR INSERT WITH CHECK (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY documents_update_self ON kino.documents FOR UPDATE USING (auth.uid() = user_id AND kino.is_kino_member()) WITH CHECK (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY documents_delete_self ON kino.documents FOR DELETE USING (auth.uid() = user_id AND kino.is_kino_member());

-- RLS Policies for subscriptions
ALTER TABLE kino.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_select_self ON kino.subscriptions FOR SELECT USING (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY subscriptions_insert_self ON kino.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY subscriptions_update_self ON kino.subscriptions FOR UPDATE USING (auth.uid() = user_id AND kino.is_kino_member()) WITH CHECK (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY subscriptions_delete_self ON kino.subscriptions FOR DELETE USING (auth.uid() = user_id AND kino.is_kino_member());

-- RLS Policies for user_assets
ALTER TABLE kino.user_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_assets_select_self ON kino.user_assets FOR SELECT USING (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY user_assets_insert_self ON kino.user_assets FOR INSERT WITH CHECK (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY user_assets_update_self ON kino.user_assets FOR UPDATE USING (auth.uid() = user_id AND kino.is_kino_member()) WITH CHECK (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY user_assets_delete_self ON kino.user_assets FOR DELETE USING (auth.uid() = user_id AND kino.is_kino_member());

-- RLS Policies for user_consents
ALTER TABLE kino.user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_consents_select_self ON kino.user_consents FOR SELECT USING (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY user_consents_insert_self ON kino.user_consents FOR INSERT WITH CHECK (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY user_consents_update_self ON kino.user_consents FOR UPDATE USING (auth.uid() = user_id AND kino.is_kino_member()) WITH CHECK (auth.uid() = user_id AND kino.is_kino_member());
CREATE POLICY user_consents_delete_self ON kino.user_consents FOR DELETE USING (auth.uid() = user_id AND kino.is_kino_member());

-- RLS Policies for document_relationships (no user_id, verify source_doc ownership)
ALTER TABLE kino.document_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY docrels_select_owner ON kino.document_relationships FOR SELECT USING (kino.is_kino_member() AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM kino.documents d WHERE d.id = source_doc_id AND d.user_id = auth.uid()));
CREATE POLICY docrels_insert_owner ON kino.document_relationships FOR INSERT WITH CHECK (kino.is_kino_member() AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM kino.documents d WHERE d.id = source_doc_id AND d.user_id = auth.uid()));
CREATE POLICY docrels_update_owner ON kino.document_relationships FOR UPDATE USING (kino.is_kino_member() AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM kino.documents d WHERE d.id = source_doc_id AND d.user_id = auth.uid())) WITH CHECK (kino.is_kino_member() AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM kino.documents d WHERE d.id = source_doc_id AND d.user_id = auth.uid()));
CREATE POLICY docrels_delete_owner ON kino.document_relationships FOR DELETE USING (kino.is_kino_member() AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM kino.documents d WHERE d.id = source_doc_id AND d.user_id = auth.uid()));

COMMIT;

-- Note: Frontend must ensure new users get membership record created:
-- await supabase.from('app_memberships').upsert({ user_id: user.id, app_slug: 'kino', role: 'member' });
