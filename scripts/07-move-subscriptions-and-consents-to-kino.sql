-- Move subscriptions and user_consents to kino schema (idempotent, data-preserving)
BEGIN;

CREATE SCHEMA IF NOT EXISTS kino;

-- Move tables if they exist outside kino
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY['subscriptions', 'user_consents'];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r' AND c.relname = tbl AND n.nspname <> 'kino'
    ) THEN
      EXECUTE format('ALTER TABLE %I.%I SET SCHEMA kino',
        (SELECT n.nspname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relkind='r' AND c.relname=tbl LIMIT 1),
        tbl);
    END IF;
  END LOOP;
END$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kino_subscriptions_user_id ON kino.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_kino_user_consents_user_id ON kino.user_consents(user_id);

-- Enable RLS
ALTER TABLE IF EXISTS kino.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kino.user_consents ENABLE ROW LEVEL SECURITY;

-- Policies (only create if missing)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE p.polname = 'users_view_subscription' AND c.relname = 'subscriptions' AND n.nspname = 'kino') THEN
    EXECUTE 'CREATE POLICY users_view_subscription ON kino.subscriptions FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE p.polname = 'users_update_subscription' AND c.relname = 'subscriptions' AND n.nspname = 'kino') THEN
    EXECUTE 'CREATE POLICY users_update_subscription ON kino.subscriptions FOR UPDATE USING (auth.uid() = user_id)';
  END IF;
END$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE p.polname = 'users_view_consents' AND c.relname = 'user_consents' AND n.nspname = 'kino') THEN
    EXECUTE 'CREATE POLICY users_view_consents ON kino.user_consents FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE p.polname = 'users_insert_consents' AND c.relname = 'user_consents' AND n.nspname = 'kino') THEN
    EXECUTE 'CREATE POLICY users_insert_consents ON kino.user_consents FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END$$;

COMMIT;

-- Note: After verifying data in kino.*, you may drop the old public tables to avoid confusion.
