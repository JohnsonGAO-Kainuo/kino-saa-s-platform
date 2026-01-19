-- Migration: move core tables into dedicated schema `kino`
-- This script attempts to be idempotent and safe: it will create the schema if missing,
-- and move existing public tables into kino schema using ALTER TABLE ... SET SCHEMA.
-- Run in Supabase SQL editor or psql connected to the project's DB.

BEGIN;

-- 1) Create schema
CREATE SCHEMA IF NOT EXISTS kino;

-- 2) Move existing tables into kino schema if they exist
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'documents',
    'document_relationships',
    'ai_generations',
    'company_settings',
    'user_assets'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relkind = 'r' AND c.relname = tbl AND n.nspname <> 'kino') THEN
      EXECUTE format('ALTER TABLE %I.%I SET SCHEMA kino', (SELECT n.nspname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relkind='r' AND c.relname=tbl LIMIT 1), tbl);
    END IF;
  END LOOP;
END$$;

-- 3) Create indexes if missing (idempotent)
CREATE INDEX IF NOT EXISTS idx_kino_documents_user_id ON kino.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kino_documents_status ON kino.documents(status);
CREATE INDEX IF NOT EXISTS idx_kino_documents_type ON kino.documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_kino_docrel_source ON kino.document_relationships(source_doc_id);
CREATE INDEX IF NOT EXISTS idx_kino_docrel_target ON kino.document_relationships(target_doc_id);
CREATE INDEX IF NOT EXISTS idx_kino_ai_generations_user ON kino.ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_kino_company_settings_user ON kino.company_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_kino_user_assets_user_id ON kino.user_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_kino_user_assets_type ON kino.user_assets(asset_type);

-- 4) Enable RLS and (re)create basic policies for each table.
-- Note: If policies already exist with same names this may fail on some Postgres versions; adjust if needed.

ALTER TABLE IF EXISTS kino.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kino.document_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kino.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kino.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kino.user_assets ENABLE ROW LEVEL SECURITY;

-- Documents policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE p.polname = 'users_only_select_documents' AND c.relname = 'documents' AND n.nspname = 'kino') THEN
    EXECUTE 'CREATE POLICY users_only_select_documents ON kino.documents FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE p.polname = 'users_only_insert_documents' AND c.relname = 'documents' AND n.nspname = 'kino') THEN
    EXECUTE 'CREATE POLICY users_only_insert_documents ON kino.documents FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE p.polname = 'users_only_update_documents' AND c.relname = 'documents' AND n.nspname = 'kino') THEN
    EXECUTE 'CREATE POLICY users_only_update_documents ON kino.documents FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE p.polname = 'users_only_delete_documents' AND c.relname = 'documents' AND n.nspname = 'kino') THEN
    EXECUTE 'CREATE POLICY users_only_delete_documents ON kino.documents FOR DELETE USING (auth.uid() = user_id)';
  END IF;
END$$;

-- Document relationships policy
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE p.polname = 'users_docrel_select' AND c.relname = 'document_relationships' AND n.nspname = 'kino') THEN
    EXECUTE 'CREATE POLICY users_docrel_select ON kino.document_relationships FOR SELECT USING (source_doc_id IN (SELECT id FROM kino.documents WHERE user_id = auth.uid()) OR target_doc_id IN (SELECT id FROM kino.documents WHERE user_id = auth.uid()))';
  END IF;
END$$;

-- AI generations policy
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE p.polname = 'users_ai_generations_all' AND c.relname = 'ai_generations' AND n.nspname = 'kino') THEN
    EXECUTE 'CREATE POLICY users_ai_generations_all ON kino.ai_generations FOR ALL USING (auth.uid() = user_id)';
  END IF;
END$$;

-- Company settings policy
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE p.polname = 'users_company_settings_all' AND c.relname = 'company_settings' AND n.nspname = 'kino') THEN
    EXECUTE 'CREATE POLICY users_company_settings_all ON kino.company_settings FOR ALL USING (auth.uid() = user_id)';
  END IF;
END$$;

-- User assets policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE p.polname = 'users_user_assets_all' AND c.relname = 'user_assets' AND n.nspname = 'kino') THEN
    EXECUTE 'CREATE POLICY users_user_assets_all ON kino.user_assets FOR ALL USING (auth.uid() = user_id)';
  END IF;
END$$;

COMMIT;

-- Notes:
-- 1) Review the policy names and adjust if your environment already has policies with different names.
-- 2) Test in a staging DB first. If your project uses other schemas or objects with the same names, validate before running.
-- 3) If you prefer to create new kino.* tables and COPY data instead of moving, we can provide that variant.
