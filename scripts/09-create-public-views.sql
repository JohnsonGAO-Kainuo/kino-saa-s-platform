-- Create public views that expose kino.* tables through the public schema
-- This provides compatibility for REST clients expecting public schema endpoints

BEGIN;

CREATE OR REPLACE VIEW public.documents AS
SELECT * FROM kino.documents;

CREATE OR REPLACE VIEW public.company_settings AS
SELECT * FROM kino.company_settings;

CREATE OR REPLACE VIEW public.subscriptions AS
SELECT * FROM kino.subscriptions;

CREATE OR REPLACE VIEW public.business_profiles AS
SELECT * FROM kino.business_profiles;

CREATE OR REPLACE VIEW public.app_memberships AS
SELECT * FROM kino.app_memberships;

CREATE OR REPLACE VIEW public.user_consents AS
SELECT * FROM kino.user_consents;

CREATE OR REPLACE VIEW public.user_assets AS
SELECT * FROM kino.user_assets;

CREATE OR REPLACE VIEW public.ai_generations AS
SELECT * FROM kino.ai_generations;

CREATE OR REPLACE VIEW public.document_relationships AS
SELECT * FROM kino.document_relationships;

COMMIT;

-- Note: RLS policies on kino.* still apply; views allow REST endpoints at /rest/v1/<view_name>
-- If you prefer not to expose some endpoints, do not create the corresponding view.
